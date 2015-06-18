# 
describe 'test basic decoding', ->

	ProtoBuf = dcodeIO.ProtoBuf
	Long = dcodeIO.Long
	
	describe 'decode simple types', ->
		
		beforeEach -> 
			
		it 'should decode simple types(string/in32) correctly', ->
			
			basicString = """
							 message Msg01 {
				                required string str = 1;
				             }
					      """
			
			Msg01 = ProtoBuf.loadProto(basicString).build("Msg01");
			
			msg = new Msg01({
				str: 'test'
			})
			
			hex = msg.toHex()
			
			protoJson = {
				'required string str' : 1
			}
			
			conv = jsbuf(protoJson)
			
			expect(conv.fromHex(hex)).toEqual({
				str: 'test'
			})
			
	
	
		
	