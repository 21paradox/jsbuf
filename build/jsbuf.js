
/**
Main JavaScript Protobuf Object.
Contains the core encode and decode functions.
 */

(function() {
  var Protobuf, SimpleTypes, backSimpleType, base64, decObj, encObj, hexToStr, jsbuf, parseSimpleType, query, strToHex, strToUtf8str, typeIsArray, utf8StrToStr,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Protobuf = {

    /**
    Decode a binary string. This means each code point in the string should
    be a single byte of raw binary data.
     */
    decode: function(str) {
      var cur, end, fields, i, num, typ, val;
      fields = [];
      i = 0;
      end = str.length;
      cur = void 0;
      val = void 0;
      typ = void 0;
      num = void 0;
      while (i < end) {
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
    JavaScript stores all its numbers as 64 bit initally,
    but as soon as you start using bitwise operators the interpreter converts the number to a 32 bit representation..
    borrowed from http://stackoverflow.com/questions/337355/javascript-bitwise-shift-of-long-long-number
    bitwise operation shim
     */
    lshift: function(num, bits) {
      return num * Math.pow(2, bits);
    },

    /**
    reverse version of left shift,
    shifting a number to the right is the same as dividing it by 2 to the power of shiftAmount
    from http://code.tutsplus.com/articles/understanding-bitwise-operators--active-11301
     */
    rshift: function(num, bits) {
      return Math.floor(num / Math.pow(2, bits));
    },

    /**
    Returns a variable-sized integer from the payload, starting at the given
    index.
     */
    pop_varint: function(payload, idx, acc, itr) {
      var data, head, msb;
      if (!acc) {
        acc = 0;
      }
      if (!itr) {
        itr = 0;
      }
      head = payload.charCodeAt(idx + itr);
      msb = head & 128;
      data = Protobuf.lshift(head & 127, itr * 7);
      if (msb === 128) {
        return Protobuf.pop_varint(payload, idx, data + acc, itr + 1);
      }
      return [data + acc, idx + itr + 1];
    },

    /**
    Returns the next 4 bytes (32 bits) of data from the payload, starting at
    the given index.
     */
    pop_32bits: function(payload, idx) {
      var c, data, end, i, max;
      data = 0;
      i = idx;
      max = payload.length;
      end = idx + 4;
      while (i < max && i < end) {
        c = payload.charCodeAt(idx);
        data += c << (end - i - 1);
        i++;
      }
      return [payload.charCodeAt(idx), i];
    },

    /**
    Returns the next 8 bytes (64 bits) of data from the payload, starting at
    the given index.
     */
    pop_64bits: function(payload, idx) {
      var c, data, end, i, max;
      data = 0;
      i = idx;
      max = payload.length;
      end = idx + 8;
      while (i < max && i < end) {
        c = payload.charCodeAt(idx);
        data += c << (end - i - 1);
        i++;
      }
      return [payload.charCodeAt(idx), i];
    },

    /**
    Returns a variable-length string from the payload, starting at the given
    index. The first code point in the payload, at `idx`, should be a
    `varint` representing the number of bytes in the string.
     */
    pop_string: function(payload, idx) {
      var data, end, i, max, res;
      res = Protobuf.pop_varint(payload, idx);
      i = res[1];
      max = payload.length;
      data = "";
      end = i + res[0];
      while (i < max && i < end) {
        data += payload.charAt(i);
        i++;
      }
      return [data, i];
    },

    /**
    Returns the Protobuf function responsible for decoding the value of a
    given wire type.
    
    Each function takes in `(payload, index)` as its arguments, where
    `payload` is the binary string being decoded and `index` is the index
    within the payload to act as the starting point for the decode operation.
    
    Each function returns `[Value, EndIndex]` where `Value` is the decoded
    value of a field and `EndIndex` is the last index inside `payload` that
    was used during the decoding operation.
     */
    wire_decode: function(type) {
      switch (type) {
        case 0:
          return Protobuf.pop_varint;
        case 1:
          return Protobuf.pop_64bits;
        case 2:
          return Protobuf.pop_string;
        case 5:
          return Protobuf.pop_32bits;
      }
    },

    /**
    Encodes an array of field data tuples into a binary string. Each tuple
    must be of the form `[FieldNumber, Type, Value]`. The `Type` is not the
    wire type, but the declared type of a field in the proto message
    definition. For example, "int32" and "float" are both acceptable types. A
    collection of types and their associated wire types can be found at
    https://developers.google.com/protocol-buffers/docs/encoding#structure.
     */
    encode: function(fields) {
      var bstr, end, field, header, header1, i, plus, res;
      bstr = "";
      field = void 0;
      header = void 0;
      res = void 0;
      header1 = void 0;
      plus = void 0;
      i = 0;
      end = fields.length;
      while (i < end) {
        field = fields[i];
        res = Protobuf.wire_encode(field[1]);
        header = (field[0] << 3) | res[0];
        header1 = Math.floor(field[0] / 16);
        if (header1 > 0) {
          header = header - 128 * (header1 - 1);
          plus = String.fromCharCode(header, header1) + res[1](field[2]);
        } else {
          plus = String.fromCharCode(header) + res[1](field[2]);
        }
        bstr += plus;
        i++;
      }
      return bstr;
    },
    encode_varint: function(i, acc) {
      var data, last, next;
      if (!acc) {
        acc = "";
      }
      if (i === true) {
        return acc + String.fromCharCode(1);
      } else if (i === false) {
        return acc + String.fromCharCode(0);
      } else {
        if (i < 128) {
          return acc + String.fromCharCode(i);
        }
      }
      next = Protobuf.rshift(i, 7);
      last = i - Protobuf.lshift(next, 7);
      data = 128 + last;
      return Protobuf.encode_varint(next, acc + String.fromCharCode(data));
    },
    encode_32bits: function(i) {
      if (i < 0) {
        return Protobuf.encode_varint(i + (1 << 32));
      }
      return Protobuf.encode_varint(i);
    },
    encode_64bits: function(i) {
      if (i < 0) {
        return Protobuf.encode_varint(i + (1 << 64));
      }
      return Protobuf.encode_varint(i);
    },
    encode_string: function(payload) {
      return Protobuf.encode_varint(payload.length) + payload;
    },
    encode_int32: function(i) {
      if (i < 0) {
        return Protobuf.encode_varint(i + (1 << 32));
      }
      return Protobuf.encode_varint(i);
    },
    encode_int64: function(i) {
      if (i < 0) {
        return Protobuf.encode_varint(i + (1 << 64));
      }
      return Protobuf.encode_varint(i);
    },
    encode_uint32: function(i) {
      return Protobuf.encode_varint(i);
    },
    encode_uint64: function(i) {
      return Protobuf.encode_varint(i);
    },
    encode_sint32: function(i) {
      return Protobuf.encode_varint((i << 1) ^ (i >> 31));
    },
    encode_sint64: function(i) {
      return Protobuf.encode_varint((i << 1) ^ (i >> 63));
    },
    encode_bool: function(b) {
      return Protobuf.encode_varint(b);
    },
    encode_enum: function(i) {
      return Protobuf.encode_varint(i);
    },
    encode_bytes: function(b) {
      return Protobuf.encode_string(b);
    },
    encode_float: function(f) {
      return Protobuf.encode_varint(f);
    },

    /**
    Returns the Protobuf function responsible for encoding data of a
    given field type. Note: this is not the wire type, but the declared field
    type from the proto message definition.
    
    Each function takes in `(payload)` as its arguments, where `payload` is
    the data being decoded.
    
    Each function returns `[WireType, BStr]`, a binary string representing the encoded
    field header and value.
     */
    wire_encode: function(type) {
      return [Protobuf.wire_type(type), Protobuf["encode_" + type]];
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

  base64 = {};

  base64.PADCHAR = "=";

  base64.ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

  base64.getbyte64 = function(s, i) {
    var idx;
    idx = base64.ALPHA.indexOf(s.charAt(i));
    if (idx === -1) {
      throw "Cannot decode base64";
    }
    return idx;
  };

  base64.decode = function(s) {
    var b10, getbyte64, i, imax, pads, x;
    s = "" + s;
    getbyte64 = base64.getbyte64;
    pads = void 0;
    i = void 0;
    b10 = void 0;
    imax = s.length;
    if (imax === 0) {
      return s;
    }
    if (imax % 4 !== 0) {
      throw "Cannot decode base64";
    }
    pads = 0;
    if (s.charAt(imax - 1) === base64.PADCHAR) {
      pads = 1;
      if (s.charAt(imax - 2) === base64.PADCHAR) {
        pads = 2;
      }
      imax -= 4;
    }
    x = [];
    i = 0;
    while (i < imax) {
      b10 = (getbyte64(s, i) << 18) | (getbyte64(s, i + 1) << 12) | (getbyte64(s, i + 2) << 6) | getbyte64(s, i + 3);
      x.push(String.fromCharCode(b10 >> 16, (b10 >> 8) & 0xff, b10 & 0xff));
      i += 4;
    }
    switch (pads) {
      case 1:
        b10 = (getbyte64(s, i) << 18) | (getbyte64(s, i + 1) << 12) | (getbyte64(s, i + 2) << 6);
        x.push(String.fromCharCode(b10 >> 16, (b10 >> 8) & 0xff));
        break;
      case 2:
        b10 = (getbyte64(s, i) << 18) | (getbyte64(s, i + 1) << 12);
        x.push(String.fromCharCode(b10 >> 16));
    }
    return x.join("");
  };

  base64.getbyte = function(s, i) {
    var x;
    x = s.charCodeAt(i);
    if (x > 255) {
      throw "INVALID_CHARACTER_ERR: DOM Exception 5";
    }
    return x;
  };

  base64.encode = function(s) {
    var alpha, b10, getbyte, i, imax, padchar, x;
    if (arguments.length !== 1) {
      throw "SyntaxError: Not enough arguments";
    }
    padchar = base64.PADCHAR;
    alpha = base64.ALPHA;
    getbyte = base64.getbyte;
    i = void 0;
    b10 = void 0;
    x = [];
    s = "" + s;
    imax = s.length - s.length % 3;
    if (s.length === 0) {
      return s;
    }
    i = 0;
    while (i < imax) {
      b10 = (getbyte(s, i) << 16) | (getbyte(s, i + 1) << 8) | getbyte(s, i + 2);
      x.push(alpha.charAt(b10 >> 18));
      x.push(alpha.charAt((b10 >> 12) & 0x3f));
      x.push(alpha.charAt((b10 >> 6) & 0x3f));
      x.push(alpha.charAt(b10 & 0x3f));
      i += 3;
    }
    switch (s.length - imax) {
      case 1:
        b10 = getbyte(s, i) << 16;
        x.push(alpha.charAt(b10 >> 18) + alpha.charAt((b10 >> 12) & 0x3f) + padchar + padchar);
        break;
      case 2:
        b10 = (getbyte(s, i) << 16) | (getbyte(s, i + 1) << 8);
        x.push(alpha.charAt(b10 >> 18) + alpha.charAt((b10 >> 12) & 0x3f) + alpha.charAt((b10 >> 6) & 0x3f) + padchar);
    }
    return x.join("");
  };


  /*
      use jsbuf/Protobuf.js to decode utf-8 encoded strings
      
      And convert to js object based on proto-json (inspired by pomelo-protobuf project)
   */

  utf8StrToStr = function(str) {
    return decodeURIComponent(escape(str));
  };

  strToUtf8str = function(str) {
    return unescape(encodeURIComponent(str));
  };

  strToHex = function (str) {
    var hex = '';
    for (var i=0; i<str.length; i++) {
          var str1 = str.charCodeAt(i).toString(16);
          str1 = str1.length == 0 ? "00" :
          str1.length == 1 ? "0" + str1 : 
          str1.length == 2 ? str1 :
          str1.substring(str1.length-2, str1.length);
          hex += str1;
    }
    return hex;
};

  hexToStr = function (hexx) {
    var hex = hexx.toString();
    var str = '';
    for (var i = 0; i < hex.length; i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
};

  parseSimpleType = function(str, type) {
    switch (type) {
      case 'string':
        return utf8StrToStr(str);
      case 'float':
      case 'double':
      case 'int32':
      case 'uint32':
      case 'uInt32':
      case 'sint32':
      case 'sInt32':
      case 'int64':
      case 'uint64':
      case 'uInt64':
      case 'sint64':
      case 'sInt64':
        return parseFloat(utf8StrToStr(str));
      case 'bool':
        return !!str;
    }
  };

  SimpleTypes = ['string', 'bool', 'float', 'double', 'int32', 'int64', 'uint32', 'uint64', 'uInt32', 'uInt64', 'sint32', 'sint64', 'sInt32', 'sInt64', 'bytes'];

  decObj = function(protoJson, utf8str) {
    var curKey, filterOut, index, infos, item, k, keys, l, len, len1, name, outMsg, parsed, parsedVal, rule, type;
    parsed = Protobuf.decode(utf8str);
    outMsg = {};
    for (keys in protoJson) {
      index = protoJson[keys];
      infos = keys.split(' ');
      if (infos.length !== 3) {
        continue;
      }
      rule = infos[0];
      type = infos[1];
      name = infos[2];
      filterOut = (function() {
        var k, len, results;
        results = [];
        for (k = 0, len = parsed.length; k < len; k++) {
          item = parsed[k];
          if (item[0] === index) {
            results.push(item);
          }
        }
        return results;
      })();
      if (filterOut.length === 0) {
        if (rule !== 'repeated') {
          outMsg[name] = null;
        } else {
          outMsg[name] = [];
        }
        continue;
      }
      if (rule !== 'repeated' && indexOf.call(SimpleTypes, type) >= 0) {
        parsedVal = filterOut[0][2];
        outMsg[name] = parseSimpleType(parsedVal, type);
      } else if (rule === 'repeated' && indexOf.call(SimpleTypes, type) >= 0) {
        outMsg[name] = [];
        for (k = 0, len = filterOut.length; k < len; k++) {
          item = filterOut[k];
          outMsg[name].push(parseSimpleType(item[2], type));
        }
      } else if (rule === 'repeated') {
        curKey = "message " + type;
        outMsg[name] = [];
        for (l = 0, len1 = filterOut.length; l < len1; l++) {
          item = filterOut[l];
          outMsg[name].push(decObj(protoJson[curKey], item[2]));
        }
      } else {
        curKey = "message " + type;
        parsedVal = filterOut[0][2];
        outMsg[name] = decObj(protoJson[curKey], parsedVal);
      }
    }
    return outMsg;
  };

  backSimpleType = function(str, type) {
    switch (type) {
      case 'string':
      case 'bytes':
        return strToUtf8str(str);
      case 'float':
      case 'double':
      case 'int32':
      case 'int64':
      case 'uint32':
      case 'uint64':
      case 'uInt32':
      case 'uInt64':
      case 'sint32':
      case 'sint64':
      case 'sInt32':
      case 'sInt64':
        return str;
      case 'bool':
        if (str) {
          return '1';
        } else {
          return '0';
        }
    }
  };

  encObj = function(protoJson, obj) {
    var curKey, index, infos, item, k, keys, l, len, len1, name, outarr, outarr1, ref, ref1, rule, type;
    outarr = [];
    for (keys in protoJson) {
      index = protoJson[keys];
      infos = keys.split(' ');
      if (infos.length !== 3) {
        continue;
      }
      rule = infos[0];
      type = infos[1];
      name = infos[2];
      if (obj[name] == null) {
        continue;
      }
      if (rule !== 'repeated' && indexOf.call(SimpleTypes, type) >= 0) {
        outarr.push([index, type, backSimpleType(obj[name], type)]);
      } else if (rule === 'repeated' && indexOf.call(SimpleTypes, type) >= 0) {
        ref = obj[name];
        for (k = 0, len = ref.length; k < len; k++) {
          item = ref[k];
          outarr.push([index, type, backSimpleType(item, type)]);
        }
      } else if (rule === 'repeated') {
        curKey = "message " + type;
        ref1 = obj[name];
        for (l = 0, len1 = ref1.length; l < len1; l++) {
          item = ref1[l];
          outarr1 = encObj(protoJson[curKey], item);
          outarr.push([index, 'string', outarr1]);
        }
      } else {
        curKey = "message " + type;
        outarr1 = encObj(protoJson[curKey], obj[name]);
        outarr.push([index, 'string', outarr1]);
      }
    }
    return Protobuf.encode(outarr);
  };

  typeIsArray = Array.isArray || function(value) {
    return Object.prototype.toString.call(value) === '[object Array]';
  };

  query = function(protoJson, utf8str, selectorInput, callback) {
    var _protoJson, curDecodeData, curProtoJson, decodeData, docontinue, filterItem, filterOut, filterOutItem, i, index, inobj, item, j, k, l, len, len1, len2, len3, m, matchResult, n, outArr, outArrConverted, outarr, outarrNew, outobj, packArr, protoJsonKey, rule, selector, selectors, type, valueConverted;
    selectors = selectorInput.split('.');
    curProtoJson = protoJson;
    decodeData = Protobuf.decode(utf8str);
    curDecodeData = decodeData;
    for (i = k = 0, len = selectors.length; k < len; i = ++k) {
      selector = selectors[i];
      if (docontinue) {
        docontinue = false;
        continue;
      }
      protoJsonKey = (function(selector) {
        var filterOut, filterOutItem, index, infos, item, key, l, len1, len2, m, name, rule, type;
        for (key in curProtoJson) {
          index = curProtoJson[key];
          infos = key.split(' ');
          if (infos.length !== 3) {
            continue;
          }
          rule = infos[0];
          type = infos[1];
          name = infos[2];
          filterOut = (function() {
            var l, len1, results;
            results = [];
            for (l = 0, len1 = curDecodeData.length; l < len1; l++) {
              item = curDecodeData[l];
              if (item[0] === index) {
                results.push(item);
              }
            }
            return results;
          })();
          if (rule === 'repeated' || indexOf.call(SimpleTypes, type) < 0) {
            for (l = 0, len1 = filterOut.length; l < len1; l++) {
              filterOutItem = filterOut[l];
              filterOutItem[1] = 'string';
            }
          } else {
            for (m = 0, len2 = filterOut.length; m < len2; m++) {
              filterOutItem = filterOut[m];
              filterOutItem[1] = type;
            }
          }
          if (name === selectors[i]) {
            protoJsonKey = key;
          }
        }
        return protoJsonKey;
      })(selector);
      matchResult = protoJsonKey.split(' ');
      rule = matchResult[0];
      type = matchResult[1];
      index = curProtoJson[protoJsonKey];
      filterOut = (function() {
        var l, len1, results;
        results = [];
        for (l = 0, len1 = curDecodeData.length; l < len1; l++) {
          item = curDecodeData[l];
          if (item[0] === index) {
            results.push(item);
          }
        }
        return results;
      })();
      _protoJson = curProtoJson["message " + type];
      if (rule !== 'repeated' && indexOf.call(SimpleTypes, type) >= 0) {
        if (i === selectors.length - 1) {
          filterOut[0][2] = backSimpleType(callback(parseSimpleType(filterOut[0][2], type)), type);
          break;
        }
      } else if (rule === 'repeated' && indexOf.call(SimpleTypes, type) >= 0) {
        if (i === selectors.length - 1) {
          outArr = (function() {
            var l, len1, results;
            results = [];
            for (l = 0, len1 = filterOut.length; l < len1; l++) {
              filterItem = filterOut[l];
              results.push(parseSimpleType(filterItem[2], type));
            }
            return results;
          })();
          outArrConverted = callback(outArr);
          for (i = l = 0, len1 = outArrConverted.length; l < len1; i = ++l) {
            valueConverted = outArrConverted[i];
            filterOut[i][2] = backSimpleType(valueConverted, type);
          }
          break;
        }
      } else if (rule === 'repeated') {
        if (i === selectors.length - 1) {
          outarr = [];
          for (m = 0, len2 = filterOut.length; m < len2; m++) {
            filterOutItem = filterOut[m];
            outarr.push(decObj(_protoJson, filterOutItem[2]));
          }
          outarrNew = callback(outarr);
          for (j = n = 0, len3 = filterOut.length; n < len3; j = ++n) {
            filterOutItem = filterOut[j];
            filterOut[j][2] = encObj(_protoJson, outarrNew[j]);
          }
          break;
        } else if (i === selectors.length - 2) {
          i += 1;
          inobj = decObj(_protoJson, filterOut[selectors[i]][2]);
          outobj = callback(inobj);
          filterOut[selectors[i]][2] = encObj(_protoJson, outobj);
          break;
        } else if (i < selectors.length - 2) {
          i += 1;
          filterOut[selectors[i]][2] = Protobuf.decode(filterOut[selectors[i]][2]);
          curDecodeData = filterOut[selectors[i]][2];
          docontinue = true;
        }
      } else {
        if (i === selectors.length - 1) {
          inobj = decObj(_protoJson, filterOut[i][2]);
          outobj = callback(inobj);
          filterOut[i][2] = encObj(_protoJson, outobj);
          break;
        } else {
          filterOut[i][2] = Protobuf.decode(filterOut[i][2]);
          curDecodeData = filterOut[i][2];
        }
      }
      curProtoJson = _protoJson;
    }
    packArr = function(decodeData) {
      var datarow, len4, o;
      for (o = 0, len4 = decodeData.length; o < len4; o++) {
        datarow = decodeData[o];
        if (typeIsArray(datarow[2])) {
          datarow[2] = packArr(datarow[2]);
        }
      }
      return Protobuf.encode(decodeData);
    };
    return packArr(decodeData);
  };

  jsbuf = (function(superClass) {
    extend(jsbuf, superClass);

    function jsbuf(protoJson1) {
      this.protoJson = protoJson1;
      if (!(this instanceof jsbuf)) {
        return new jsbuf(this.protoJson);
      }
    }

    jsbuf.prototype.fromUtf8 = function(utf8str) {
      return decObj(this.protoJson, utf8str);
    };

    jsbuf.prototype.toUtf8 = function(obj) {
      return encObj(this.protoJson, obj);
    };

    jsbuf.prototype.fromHex = function(hex) {
      var utf8str;
      utf8str = hexToStr(hex);
      return decObj(this.protoJson, utf8str);
    };

    jsbuf.prototype.toHex = function(obj) {
      var utf8str;
      utf8str = encObj(this.protoJson, obj);
      return strToHex(utf8str);
    };

    jsbuf.prototype.frombase64 = function(base64str) {
      var utf8str;
      utf8str = (typeof window.atob === "function" ? window.atob(base64str) : void 0) || base64.decode(base64str);
      return decObj(this.protoJson, utf8str);
    };

    jsbuf.prototype.tobase64 = function(obj) {
      var utf8str, utfstr;
      utf8str = encObj(this.protoJson, obj);
      utfstr = (typeof window.btoa === "function" ? window.btoa(utf8str) : void 0) || base64.encode(utf8str);
      return utfstr;
    };

    jsbuf.prototype.queryUtf = function(utf8str, selector, callback) {
      var val;
      if (callback) {
        return query(this.protoJson, utf8str, selector, callback);
      } else {
        val = null;
        query(this.protoJson, utf8str, selector, function(data) {
          val = data;
          return data;
        });
        return val;
      }
    };

    jsbuf.prototype.queryHex = function(hex, selector, callback) {
      var utf8str;
      utf8str = hexToStr(hex);
      return this.queryUtf(utf8str, selector, callback);
    };

    jsbuf.prototype.query64 = function(base64str, selector, callback) {
      var utf8str;
      utf8str = (typeof window.atob === "function" ? window.atob(base64str) : void 0) || base64.decode(base64str);
      return this.queryUtf(utf8str, selector, callback);
    };

    return jsbuf;

  })(Protobuf);

  this.jsbuf = jsbuf;

}).call(this);
