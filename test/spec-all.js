describe('test basic decoding/encoding', function() {
  var ArrayBufferToUtf8String, Long, ProtoBuf;
  ProtoBuf = dcodeIO.ProtoBuf;
  Long = dcodeIO.Long;
  ArrayBufferToUtf8String = function(buffer) {
    return String.fromCharCode.apply(null, Array.prototype.slice.apply(new Uint8Array(buffer)));
  };
  beforeEach(function() {});
  it('should decode simple string correctly', function() {
    var Msg01, base64, basicString, conv, hex, msg, protoJson, utf8str;
    basicString = "message Msg01 {\n			                required string str = 1;\n			             }";
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
    utf8str = ArrayBufferToUtf8String(msg.toArrayBuffer());
    expect(conv.frombase64(base64)).toEqual({
      str: 'test'
    });
    expect(conv.toUtf8(conv.fromUtf8(utf8str))).toBe(utf8str);
    expect(conv.toHex(conv.fromHex(hex))).toBe(hex);
    return expect(conv.tobase64(conv.frombase64(base64))).toBe(base64);
  });
  it('should decode multiple simple types(string/int32/int64/bool) correctly', function() {
    var Message, base64, conv, hex, msg, originMsg, proto, protoJson, utf8str;
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
    msg = new Message(originMsg);
    protoJson = {
      'required string text': 1,
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
    utf8str = ArrayBufferToUtf8String(msg.toArrayBuffer());
    expect(conv.fromUtf8(utf8str)).toEqual(originMsg);
    expect(conv.toHex(conv.fromHex(hex))).toBe(hex);
    expect(conv.tobase64(conv.frombase64(base64))).toBe(base64);
    return expect(conv.fromUtf8(conv.toUtf8(originMsg))).toEqual(originMsg);
  });
  it('should works well with complex decodings', function() {
    var Message, base64, conv, hex, msg, originMsg, proto, protoJson, utf8str;
    proto = "message subMsg {\n                required string width = 1;\n                required int32  height = 2;\n             }  \n             \n              message Path {\n                optional string authorName = 1;\n                optional string authorPortrait = 2;\n                optional int32 createTime = 3;\n                optional int32 maxMemberNum = 4;\n                optional int32 memberNum = 5;\n                optional int32 groupType = 6;\n             }\n             \n              message Message {\n                required string text = 1;\n                optional string text1 = 2;\n                optional string text2 = 3;\n                optional string text3 = 4;\n                optional bool text4 = 5;\n                required int32 int1 = 6;\n                required subMsg submsg = 7;\n                optional string text5 = 8;\n                repeated Path path = 9;\n                optional int32 flo1 = 10;\n                repeated string repText = 11;\n                optional int64 bigint = 12;\n            }  ";
    Message = ProtoBuf.loadProto(proto).build("Message");
    originMsg = {
      text: 'morning!?:',
      text1: '早上好!Ծ‸Ծ',
      text2: 'おはよう',
      text3: null,
      text4: false,
      int1: 3,
      submsg: {
        width: '中文编码',
        height: 123
      },
      text5: '额',
      path: [
        {
          authorName: "",
          authorPortrait: null,
          createTime: 1429260862,
          maxMemberNum: null,
          memberNum: null,
          groupType: 1
        }, {
          authorName: "",
          authorPortrait: null,
          createTime: 1429260872,
          maxMemberNum: null,
          memberNum: null,
          groupType: 1
        }
      ],
      flo1: 1429260862,
      repText: ['你好', 'uiasd', 'いちばん'],
      bigint: 748864562345245
    };
    msg = new Message(originMsg);
    protoJson = {
      "required string text": 1,
      "optional string text1": 2,
      "optional string text2": 3,
      "optional string text3": 4,
      "optional bool text4": 5,
      "required int32 int1": 6,
      "message subMsg": {
        "required string width": 1,
        "required int32 height": 2
      },
      "required subMsg submsg": 7,
      "optional string text5": 8,
      "message Path": {
        "optional string authorName": 1,
        "optional string authorPortrait": 2,
        "optional int32 createTime": 3,
        "optional int32 maxMemberNum": 4,
        "optional int32 memberNum": 5,
        "optional int32 groupType": 6
      },
      "repeated Path path": 9,
      "optional int32 flo1": 10,
      "repeated string repText": 11,
      "optional int64 bigint": 12
    };
    conv = jsbuf(protoJson);
    hex = msg.toHex();
    expect(conv.fromHex(hex)).toEqual(originMsg);
    base64 = msg.toBase64();
    expect(conv.frombase64(base64)).toEqual(originMsg);
    utf8str = ArrayBufferToUtf8String(msg.toArrayBuffer());
    expect(conv.fromUtf8(utf8str)).toEqual(originMsg);
    expect(conv.toHex(conv.fromHex(hex))).toBe(hex);
    expect(conv.tobase64(conv.frombase64(base64))).toBe(base64);
    return expect(conv.fromUtf8(conv.toUtf8(originMsg))).toEqual(originMsg);
  });
  return it('should works well with Long groups', function() {
    var Message, base64, conv, hex, msg, originMsg, proto, protoJson, utf8str;
    proto = "message Wrap1 {\n                repeated GroupInfo groupInfo = 1;\n            }\n            \n            message Wrap {\n            	optional Error error = 1;\n            	optional Wrap1 data = 2;\n            }\n            \n            message Error {\n                optional int32 errorno = 1;\n                optional string usermsg = 2;\n            }\n            \n            message GroupInfo {\n                optional int32 val1 = 1;\n                optional int32 val2 = 2;\n                optional string val3 = 3;\n                optional string val4 = 4;\n                optional string val5 = 5;\n                optional string val6 = 6;\n                optional string val7 = 7;\n                optional double val8 = 8;\n                optional double val9 = 9;\n                optional string val10 = 10;\n                optional string val11 = 11;\n                optional int32 val12 = 12;\n                optional int32 val13 = 13;\n                optional int32 val14 = 14;\n                optional string val15 = 15;\n                optional string val16 = 16;\n                optional int32 val17 = 17;\n                optional int32 val18 = 18;\n                optional int32 val19 = 19;\n                optional int32 val20 = 20;\n                optional int64 val21 = 21;\n                optional int32 val22 = 22;\n                optional int32 val23 = 23;   \n                optional int32 val24 = 24;\n                optional string val25 = 25; \n                optional string val26 = 26;\n                optional int32 val27 = 27;\n                optional int32 val28 = 28; \n                optional int32 val29 = 29;\n                optional int64 val30 = 30;\n                optional string val31 = 31;\n                optional int32 val32 = 32;\n                optional int32 val33 = 33;\n                optional int32 val34 = 34;\n            } \n	";
    protoJson = {
      "message Error": {
        "optional int32 errorno": 1,
        "optional string usermsg": 2
      },
      "optional Error error": 1,
      "message Wrap1": {
        "message GroupInfo": {
          "optional int32 val1": 1,
          "optional int32 val2": 2,
          "optional string val3": 3,
          "optional string val4": 4,
          "optional string val5": 5,
          "optional string val6": 6,
          "optional string val7": 7,
          "optional double val8": 8,
          "optional double val9": 9,
          "optional string val10": 10,
          "optional string val11": 11,
          "optional int32 val12": 12,
          "optional int32 val13": 13,
          "optional int32 val14": 14,
          "optional string val15": 15,
          "optional string val16": 16,
          "optional int32 val17": 17,
          "optional int32 val18": 18,
          "optional int32 val19": 19,
          "optional int32 val20": 20,
          "optional int32 val21": 21,
          "optional int32 val22": 22,
          "optional int32 val23": 23,
          "optional int32 val24": 24,
          "optional string val25": 25,
          "optional string val26": 26,
          "optional int32 val27": 27,
          "optional int32 val28": 28,
          "optional int32 val29": 29,
          "optional int64 val30": 30,
          "optional string val31": 31,
          "optional int32 val32": 32,
          "optional int32 val33": 33,
          "optional int32 val34": 34
        },
        "repeated GroupInfo groupInfo": 1
      },
      "optional Wrap1 data": 2
    };
    originMsg = {
      error: {
        errorno: 0,
        usermsg: 'success'
      },
      data: {
        groupInfo: [
          {
            val1: 10007346,
            val2: 0,
            val3: "qun00",
            val4: null,
            val5: "",
            val6: null,
            val7: null,
            val8: null,
            val9: null,
            val10: null,
            val11: null,
            val12: null,
            val13: null,
            val14: 1496,
            val15: "",
            val16: null,
            val17: 1429260862,
            val18: null,
            val19: null,
            val20: 1,
            val21: 1,
            val22: 0,
            val23: null,
            val24: null,
            val25: null,
            val26: null,
            val27: null,
            val28: null,
            val29: null,
            val30: null,
            val31: null,
            val32: null,
            val33: null,
            val34: null
          }, {
            val1: 10007346,
            val2: 0,
            val3: "qun00",
            val4: null,
            val5: "",
            val6: null,
            val7: null,
            val8: null,
            val9: null,
            val10: null,
            val11: null,
            val12: null,
            val13: null,
            val14: 1496,
            val15: "",
            val16: null,
            val17: 1429260862,
            val18: null,
            val19: null,
            val20: 1,
            val21: 1,
            val22: 0,
            val23: null,
            val24: null,
            val25: null,
            val26: null,
            val27: null,
            val28: null,
            val29: null,
            val30: null,
            val31: null,
            val32: null,
            val33: null,
            val34: null
          }, {
            val1: 10007346,
            val2: 0,
            val3: "qun00",
            val4: null,
            val5: "",
            val6: null,
            val7: null,
            val8: null,
            val9: null,
            val10: null,
            val11: null,
            val12: null,
            val13: null,
            val14: 1496,
            val15: "",
            val16: null,
            val17: 1429260862,
            val18: null,
            val19: null,
            val20: 1,
            val21: 1,
            val22: 0,
            val23: null,
            val24: null,
            val25: null,
            val26: null,
            val27: null,
            val28: null,
            val29: null,
            val30: 748864562342,
            val31: null,
            val32: null,
            val33: null,
            val34: null
          }
        ]
      }
    };
    Message = ProtoBuf.loadProto(proto).build("Wrap");
    msg = new Message(originMsg);
    conv = jsbuf(protoJson);
    hex = msg.toHex();
    expect(conv.fromHex(hex)).toEqual(originMsg);
    base64 = msg.toBase64();
    expect(conv.frombase64(base64)).toEqual(originMsg);
    utf8str = ArrayBufferToUtf8String(msg.toArrayBuffer());
    expect(conv.fromUtf8(utf8str)).toEqual(originMsg);
    expect(conv.toHex(conv.fromHex(hex))).toBe(hex);
    expect(conv.tobase64(conv.frombase64(base64))).toBe(base64);
    return expect(conv.fromUtf8(conv.toUtf8(originMsg))).toEqual(originMsg);
  });
});

describe('test query', function() {
  var ArrayBufferToUtf8String, Long, ProtoBuf;
  ProtoBuf = dcodeIO.ProtoBuf;
  Long = dcodeIO.Long;
  ArrayBufferToUtf8String = function(buffer) {
    return String.fromCharCode.apply(null, Array.prototype.slice.apply(new Uint8Array(buffer)));
  };
  beforeEach(function() {});
  return it('should works correct with query', function() {
    var Message, base64, conv, data, hex, msg, originMsg, proto, protoJson, str1, utf8str, utf8str1;
    proto = "message Wrap1 {\n                repeated GroupInfo groupInfo = 1;\n            }\n            \n            message Wrap {\n            	optional Error error = 1;\n            	optional Wrap1 data = 2;\n            }\n            \n            message Error {\n                optional int32 errorno = 1;\n                optional string usermsg = 2;\n            }\n            \n            message GroupInfo {\n                optional int32 val1 = 1;\n                optional int32 val2 = 2;\n                optional string val3 = 3;\n                optional string val4 = 4;\n                optional string val5 = 5;\n                optional string val6 = 6;\n                optional string val7 = 7;\n                optional double val8 = 8;\n                optional double val9 = 9;\n                optional string val10 = 10;\n                optional string val11 = 11;\n                optional int32 val12 = 12;\n                optional int32 val13 = 13;\n                optional int32 val14 = 14;\n                optional string val15 = 15;\n                optional string val16 = 16;\n                optional int32 val17 = 17;\n                optional int32 val18 = 18;\n                optional int32 val19 = 19;\n                optional int32 val20 = 20;\n                optional int64 val21 = 21;\n                optional int32 val22 = 22;\n                optional int32 val23 = 23;   \n                optional int32 val24 = 24;\n                optional string val25 = 25; \n                optional string val26 = 26;\n                optional int32 val27 = 27;\n                optional int32 val28 = 28; \n                optional int32 val29 = 29;\n                optional int64 val30 = 30;\n                optional string val31 = 31;\n                optional int32 val32 = 32;\n                optional int32 val33 = 33;\n                optional int32 val34 = 34;\n            } \n	";
    protoJson = {
      "message Error": {
        "optional int32 errorno": 1,
        "optional string usermsg": 2
      },
      "optional Error error": 1,
      "message Wrap1": {
        "message GroupInfo": {
          "optional int32 val1": 1,
          "optional int32 val2": 2,
          "optional string val3": 3,
          "optional string val4": 4,
          "optional string val5": 5,
          "optional string val6": 6,
          "optional string val7": 7,
          "optional double val8": 8,
          "optional double val9": 9,
          "optional string val10": 10,
          "optional string val11": 11,
          "optional int32 val12": 12,
          "optional int32 val13": 13,
          "optional int32 val14": 14,
          "optional string val15": 15,
          "optional string val16": 16,
          "optional int32 val17": 17,
          "optional int32 val18": 18,
          "optional int32 val19": 19,
          "optional int32 val20": 20,
          "optional int32 val21": 21,
          "optional int32 val22": 22,
          "optional int32 val23": 23,
          "optional int32 val24": 24,
          "optional string val25": 25,
          "optional string val26": 26,
          "optional int32 val27": 27,
          "optional int32 val28": 28,
          "optional int32 val29": 29,
          "optional int64 val30": 30,
          "optional string val31": 31,
          "optional int32 val32": 32,
          "optional int32 val33": 33,
          "optional int32 val34": 34
        },
        "repeated GroupInfo groupInfo": 1
      },
      "optional Wrap1 data": 2
    };
    originMsg = {
      error: {
        errorno: 0,
        usermsg: 'success'
      },
      data: {
        groupInfo: [
          {
            val1: 10007346,
            val2: 0,
            val3: "qun00",
            val4: null,
            val5: "",
            val6: null,
            val7: null,
            val8: null,
            val9: null,
            val10: null,
            val11: null,
            val12: null,
            val13: null,
            val14: 1496,
            val15: "",
            val16: null,
            val17: 1429260862,
            val18: null,
            val19: null,
            val20: 1,
            val21: 1,
            val22: 0,
            val23: null,
            val24: null,
            val25: null,
            val26: null,
            val27: null,
            val28: null,
            val29: null,
            val30: null,
            val31: null,
            val32: null,
            val33: null,
            val34: null
          }, {
            val1: 100072346,
            val2: 0,
            val3: "qun01",
            val4: null,
            val5: "",
            val6: null,
            val7: null,
            val8: null,
            val9: null,
            val10: null,
            val11: null,
            val12: null,
            val13: null,
            val14: 432134,
            val15: "ずっとずっとずっと",
            val16: null,
            val17: 142312608,
            val18: null,
            val19: null,
            val20: 1,
            val21: 1,
            val22: 0,
            val23: null,
            val24: null,
            val25: null,
            val26: null,
            val27: null,
            val28: null,
            val29: null,
            val30: null,
            val31: null,
            val32: null,
            val33: null,
            val34: null
          }, {
            val1: 10007346,
            val2: 0,
            val3: "qun00",
            val4: null,
            val5: "",
            val6: null,
            val7: null,
            val8: null,
            val9: null,
            val10: null,
            val11: null,
            val12: null,
            val13: null,
            val14: 1496,
            val15: "",
            val16: null,
            val17: 1429260862,
            val18: null,
            val19: null,
            val20: 1,
            val21: 1,
            val22: 0,
            val23: null,
            val24: null,
            val25: null,
            val26: null,
            val27: null,
            val28: null,
            val29: null,
            val30: 748864562342,
            val31: null,
            val32: null,
            val33: null,
            val34: null
          }
        ]
      }
    };
    Message = ProtoBuf.loadProto(proto).build("Wrap");
    msg = new Message(originMsg);
    conv = jsbuf(protoJson);
    hex = msg.toHex();
    base64 = msg.toBase64();
    utf8str = ArrayBufferToUtf8String(msg.toArrayBuffer());
    utf8str1 = conv.queryUtf(utf8str, 'error', function(data) {
      expect(data).toEqual({
        errorno: 0,
        usermsg: 'success'
      });
      return data;
    });
    expect(utf8str1).toBe(utf8str);
    data = conv.queryUtf(utf8str, 'error');
    expect(data).toEqual({
      errorno: 0,
      usermsg: 'success'
    });
    expect(conv.queryUtf(utf8str, 'error.usermsg')).toBe('success');
    expect(conv.queryUtf(utf8str, 'data.groupInfo')).toEqual(originMsg.data.groupInfo);
    expect(conv.queryUtf(utf8str, 'data.groupInfo.0')).toEqual(originMsg.data.groupInfo[0]);
    expect(conv.queryUtf(utf8str, 'data.groupInfo.1')).toEqual(originMsg.data.groupInfo[1]);
    expect(conv.queryUtf(utf8str, 'data.groupInfo.1.val17')).toEqual(142312608);
    expect(conv.queryHex(hex, 'data.groupInfo.1.val17')).toEqual(142312608);
    expect(conv.query64(base64, 'data.groupInfo.1.val17')).toEqual(142312608);
    str1 = conv.queryUtf(utf8str, 'data.groupInfo.1.val15', function(val) {
      expect(val).toBe('ずっとずっとずっと');
      return '123';
    });
    return expect(conv.queryUtf(str1, 'data.groupInfo.1.val15')).toBe('123');
  });
});
