describe('test basic decoding', function() {
  var Long, ProtoBuf;
  ProtoBuf = dcodeIO.ProtoBuf;
  Long = dcodeIO.Long;
  return describe('decode simple types', function() {
    beforeEach(function() {});
    return it('should decode simple types(string/in32) correctly', function() {
      var Msg01, basicString, conv, hex, msg, protoJson;
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
      return expect(conv.fromHex(hex)).toEqual({
        str: 'test'
      });
    });
  });
});
