/**
 * Main JavaScript Protobuf Object.
 * Contains the core encode and decode functions.
 */
var Protobuf = {
    /**
     * Decode a binary string. This means each code point in the string should
     * be a single byte of raw binary data.
     */
    decode: function(str) {
        var fields = [];
        var i = 0, end = str.length;
        var cur, val, typ, num;
        for (;i < end;) {
            cur = Protobuf.pop_varint(str, i);
            num = cur[0] >> 3;
            typ = cur[0] - (num << 3);
            val = Protobuf.wire_decode(typ)(str, cur[1]);
            fields.push([num, typ, val[0]]);
            i = val[1];
        }
        return fields;
    },
    
    /**
     * JavaScript stores all its numbers as 64 bit initally, 
     * but as soon as you start using bitwise operators the interpreter converts the number to a 32 bit representation..
     * borrowed from http://stackoverflow.com/questions/337355/javascript-bitwise-shift-of-long-long-number
     * bitwise operation shim
     */
    lshift: function (num, bits) {
        return num * Math.pow(2, bits);
    },
    /**
     * reverse version of left shift, 
     * shifting a number to the right is the same as dividing it by 2 to the power of shiftAmount
     * from http://code.tutsplus.com/articles/understanding-bitwise-operators--active-11301
     */
    rshift: function (num, bits) {
        return Math.floor(num / Math.pow(2, bits));
    },

    /**
     * Returns a variable-sized integer from the payload, starting at the given
     * index.
     */
    pop_varint: function(payload, idx, acc, itr) {
        if (!acc) { acc = 0; }
        if (!itr) { itr = 0; }
        var head = payload.charCodeAt(idx + itr);
        var msb  = head & 128;
        var data = Protobuf.lshift(head & 127, itr * 7);
        if (msb == 128)
            return Protobuf.pop_varint(
                    payload,
                    idx,
                    data + acc,
                    itr + 1
                );
        return [data + acc, idx + itr + 1];
    },

    /**
     * Returns the next 4 bytes (32 bits) of data from the payload, starting at
     * the given index.
     */
    pop_32bits: function(payload, idx) {
        var data = 0;
        var i = idx, max = payload.length, end = idx + 4;
        for (; i < max && i < end; i++) {
            var c = payload.charCodeAt(idx);
            data += (c << (end - i - 1));
        }
        return [payload.charCodeAt(idx), i];
    },

    /**
     * Returns the next 8 bytes (64 bits) of data from the payload, starting at
     * the given index.
     */
    pop_64bits: function(payload, idx) {
        var data = 0;
        var i = idx, max = payload.length, end = idx + 8;
        for (; i < max && i < end; i++) {
            var c = payload.charCodeAt(idx);
            data += (c << (end - i - 1));
        }
        return [payload.charCodeAt(idx), i];
    },

    /**
     * Returns a variable-length string from the payload, starting at the given
     * index. The first code point in the payload, at `idx`, should be a
     * `varint` representing the number of bytes in the string.
     */
    pop_string: function(payload, idx) {
        var res = Protobuf.pop_varint(payload, idx);
        var i = res[1], max = payload.length;
        var data = "";
        for (var end = i + res[0]; i < max && i < end; i++)
            data += payload.charAt(i);
        return [data, i];
    },

    /**
     * Returns the Protobuf function responsible for decoding the value of a
     * given wire type.
     *
     * Each function takes in `(payload, index)` as its arguments, where
     * `payload` is the binary string being decoded and `index` is the index
     * within the payload to act as the starting point for the decode operation.
     *
     * Each function returns `[Value, EndIndex]` where `Value` is the decoded
     * value of a field and `EndIndex` is the last index inside `payload` that
     * was used during the decoding operation.
     */
    wire_decode: function(type) {
        switch (type) {
            case 0: return Protobuf.pop_varint;
            case 1: return Protobuf.pop_64bits;
            case 2: return Protobuf.pop_string;
            case 5: return Protobuf.pop_32bits;
        }
    },

    /**
     * Encodes an array of field data tuples into a binary string. Each tuple
     * must be of the form `[FieldNumber, Type, Value]`. The `Type` is not the
     * wire type, but the declared type of a field in the proto message
     * definition. For example, "int32" and "float" are both acceptable types. A
     * collection of types and their associated wire types can be found at
     * https://developers.google.com/protocol-buffers/docs/encoding#structure.
     */
    encode: function(fields) {
       var bstr = "", field, header, res, header1, plus;
        for (var i = 0, end = fields.length; i < end; i++) {
            field = fields[i];
            res = Protobuf.wire_encode(field[1]);
            header = (field[0] << 3) | res[0];
          
            // when FieldNum >= 16 , header will be greater than 128, which will cause encoding problem
            // add a second header here
            header1 = Math.floor(field[0] / 16);
          
            if (header1 > 0) {
                header = header - 128 * (header1 - 1);
                plus = String.fromCharCode(header, header1) + res[1](field[2]);
            } else {
                plus = String.fromCharCode(header) + res[1](field[2]);
            }
            
            bstr += plus;
        }
        return bstr;
    },

    encode_varint: function(i, acc) {
        if (!acc) { acc = ""; }
        if (i === true)
            return acc + String.fromCharCode(1);
        else if (i === false)
            return acc + String.fromCharCode(0);
        else if (i < 128)
            return acc + String.fromCharCode(i);
        var next = Protobuf.rshift(i, 7);
        var last = i - Protobuf.lshift(next, 7);
        var data = 128 + last;
        
        return Protobuf.encode_varint(next, acc + String.fromCharCode(data));
    },

    encode_32bits: function(i) {
        if (i < 0)
            return Protobuf.encode_varint(i + (1 << 32));
        return Protobuf.encode_varint(i);
    },

    encode_64bits: function(i) {
        if (i < 0)
            return Protobuf.encode_varint(i + (1 << 64));
        return Protobuf.encode_varint(i);
    },

    encode_string: function(payload) {
        return Protobuf.encode_varint(payload.length) + payload;
    },

    encode_int32: function(i) {
        if (i < 0)
            return Protobuf.encode_varint(i + (1 << 32));
        return Protobuf.encode_varint(i);
    },

    encode_int64: function(i) {
        if (i < 0)
            return Protobuf.encode_varint(i + (1 << 64));
        return Protobuf.encode_varint(i);
    },

    encode_uint32: function(i) { return Protobuf.encode_varint(i) },
    encode_uint64: function(i) { return Protobuf.encode_varint(i) },

    encode_sint32: function(i) {
        return Protobuf.encode_varint((i << 1) ^ (i >> 31));
    },

    encode_sint64: function(i) {
        return Protobuf.encode_varint((i << 1) ^ (i >> 63));
    },

    encode_bool: function(b) { return Protobuf.encode_varint(b); },
    encode_enum: function(i) { return Protobuf.encode_varint(i); },

    encode_bytes: function(b) { return Protobuf.encode_string(b); },

    encode_float: function(f) {
        // TODO
        return Protobuf.encode_varint(f);
    },

    /**
     * Returns the Protobuf function responsible for encoding data of a
     * given field type. Note: this is not the wire type, but the declared field
     * type from the proto message definition.
     *
     * Each function takes in `(payload)` as its arguments, where `payload` is
     * the data being decoded.
     *
     * Each function returns `[WireType, BStr]`, a binary string representing the encoded
     * field header and value.
     */
    wire_encode: function(type) {
        return [
            Protobuf.wire_type(type),
            Protobuf["encode_" + type]
        ];
    },

    wire_type: function(type) {
        switch (type) {
            case "int32":
            case "int64":
            case "uint32":
            case "uint64":
            case "sint32":
            case "sint64":
            case "bool":
            case "enum":
                return 0;
            case "fixed64":
            case "sfixed64":
            case "double":
                return 1;
            case "message":
            case "string":
            case "bytes":
            case "repeated":
                return 2;
            case "fixed32":
            case "sfixed32":
            case "float":
                return 5;
        }
    }
};