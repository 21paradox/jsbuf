describe('test basic decoding', function() {
  var Long, ProtoBuf, clone;
  ProtoBuf = dcodeIO.ProtoBuf;
  Long = dcodeIO.Long;
  clone = function(obj) {
    var flags, key, newInstance;
    if ((obj == null) || typeof obj !== 'object') {
      return obj;
    }
    if (obj instanceof Date) {
      return new Date(obj.getTime());
    }
    if (obj instanceof RegExp) {
      flags = '';
      if (obj.global != null) {
        flags += 'g';
      }
      if (obj.ignoreCase != null) {
        flags += 'i';
      }
      if (obj.multiline != null) {
        flags += 'm';
      }
      if (obj.sticky != null) {
        flags += 'y';
      }
      return new RegExp(obj.source, flags);
    }
    newInstance = new obj.constructor();
    for (key in obj) {
      newInstance[key] = clone(obj[key]);
    }
    return newInstance;
  };
  return describe('decode simple types', function() {
    beforeEach(function() {});
    it('should decode simple types(string/in32) correctly', function() {
      var Msg01, base64, basicString, conv, hex, msg, protoJson;
      basicString = "message Msg01 {\n				                required string str = 1;\n				             }";
      Msg01 = ProtoBuf.loadProto(basicString).build("Msg01");
      msg = new Msg01({
        str: 'test'
      });
      hex = msg.toHex();
      protoJson = {
        'required string str': 1
      };
      conv = jsbuf(protoJson);
      expect(conv.fromHex(hex)).toEqual({
        str: 'test'
      });
      base64 = msg.toBase64();
      expect(conv.frombase64(base64)).toEqual({
        str: 'test'
      });
      expect(conv.toHex(conv.fromHex(hex))).toBe(hex);
      return expect(conv.tobase64(conv.frombase64(base64))).toBe(base64);
    });
    return it('should decode multiple simple types correctly', function() {
      var Message, base64, conv, hex, msg, originMsg, originMsgCopy, proto, protoJson;
      proto = " message Message {\n	required string text = 1;\n	optional string text1 = 2;\n	optional string text2 = 3;\n	optional string text3 = 4;\n	optional bool bool0 = 5;\n	optional bool bool1 = 6;\n	required int32 int1 = 7;\n	optional int32 flo1 = 8;\n	repeated string repText = 9;\n	optional int64 bigint = 10;\n}  ";
      Message = ProtoBuf.loadProto(proto).build("Message");
      originMsg = {
        text: 'morning!?:',
        text1: '早上好',
        text2: 'おはよう',
        text3: '좋은 아침',
        bool0: true,
        bool1: false,
        int1: 4567892,
        flo1: 987654321,
        repText: ['asd', 'sdf', 'qwe', 'eee', '你好', 'llll'],
        bigint: 987654321012345
      };
      originMsgCopy = clone(originMsg);
      originMsgCopy.bigint = Long.fromNumber(originMsgCopy.bigint);
      console.log(originMsgCopy);
      console.log(originMsg);
      msg = new Message(originMsgCopy);
      console.log(msg);
      protoJson = {
        'required string str': 1,
        'optional string text1': 2,
        'optional string text2': 3,
        'optional string text3': 4,
        'optional bool bool0': 5,
        'optional bool bool1': 6,
        'required int32 int1': 7,
        'optional int32 flo1': 8,
        'repeated string repText': 9,
        'optional int64 bigint': 10
      };
      conv = jsbuf(protoJson);
      hex = msg.toHex();
      expect(conv.fromHex(hex)).toEqual(originMsg);
      base64 = msg.toBase64();
      expect(conv.frombase64(base64)).toEqual(originMsg);
      expect(conv.toHex(conv.fromHex(hex))).toBe(hex);
      return expect(conv.tobase64(conv.frombase64(base64))).toBe(base64);
    });
  });
});
