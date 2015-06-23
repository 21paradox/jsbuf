describe 'test query', ->

	ProtoBuf = dcodeIO.ProtoBuf
	Long = dcodeIO.Long

	ArrayBufferToUtf8String = (buffer) ->
		return String.fromCharCode.apply(null, Array.prototype.slice.apply(new Uint8Array(buffer)))
	
	beforeEach -> 
	
	it 'should works correct with query', ->
		
		proto = """
		message Wrap1 {
                repeated GroupInfo groupInfo = 1;
            }
            
            message Wrap {
            	optional Error error = 1;
            	optional Wrap1 data = 2;
            }
            
            message Error {
                optional int32 errorno = 1;
                optional string usermsg = 2;
            }
            
            message GroupInfo {
                optional int32 val1 = 1;
                optional int32 val2 = 2;
                optional string val3 = 3;
                optional string val4 = 4;
                optional string val5 = 5;
                optional string val6 = 6;
                optional string val7 = 7;
                optional double val8 = 8;
                optional double val9 = 9;
                optional string val10 = 10;
                optional string val11 = 11;
                optional int32 val12 = 12;
                optional int32 val13 = 13;
                optional int32 val14 = 14;
                optional string val15 = 15;
                optional string val16 = 16;
                optional int32 val17 = 17;
                optional int32 val18 = 18;
                optional int32 val19 = 19;
                optional int32 val20 = 20;
                optional int64 val21 = 21;
                optional int32 val22 = 22;
                optional int32 val23 = 23;   
                optional int32 val24 = 24;
                optional string val25 = 25; 
                optional string val26 = 26;
                optional int32 val27 = 27;
                optional int32 val28 = 28; 
                optional int32 val29 = 29;
                optional int64 val30 = 30;
                optional string val31 = 31;
                optional int32 val32 = 32;
                optional int32 val33 = 33;
                optional int32 val34 = 34;
            } 
			
			"""
			
		protoJson = {
			
	       "message Error": {
	            "optional int32 errorno": 1,
	            "optional string usermsg": 2
	        },
			"optional Error error": 1,
			
			"message Wrap1": {
	            "message GroupInfo": {
	                "optional int32 val1" : 1,
	                "optional int32 val2" : 2,
	                "optional string val3" : 3,
	                "optional string val4" : 4,
	                "optional string val5" : 5,
	                "optional string val6" : 6,
	                "optional string val7" : 7,
	                "optional double val8" : 8,
	                "optional double val9" : 9,
	                "optional string val10" : 10,
	                "optional string val11" : 11,
	                "optional int32 val12" : 12,
	                "optional int32 val13" : 13,
	                "optional int32 val14" : 14,
	                "optional string val15" : 15,
	                "optional string val16" : 16,
	                "optional int32 val17" : 17,
	                "optional int32 val18" : 18,
	                "optional int32 val19" : 19,
	                "optional int32 val20" : 20,
	                "optional int32 val21" : 21,
	                "optional int32 val22" : 22,
	                "optional int32 val23" : 23,   
	                "optional int32 val24" : 24,
	                "optional string val25" : 25, 
	                "optional string val26" : 26,
	                "optional int32 val27" : 27,
	                "optional int32 val28" : 28, 
	                "optional int32 val29" : 29,
	                "optional int64 val30" : 30,
	                "optional string val31" : 31,
	                "optional int32 val32" : 32,
	                "optional int32 val33" : 33,
	                "optional int32 val34" : 34
	            },
				"repeated GroupInfo groupInfo": 1  
			},
			"optional Wrap1 data": 2
        }
		
		originMsg = {
        
	        error: {
	            errorno: 0,
	            usermsg: 'success'
	        },
			
			data: 
				groupInfo: [{
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
				},
				  
				{
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
				},
			  
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
					val30: 748864562342,
					val31: null,
					val32: null,
					val33: null,
					val34: null
				}]		
		}			
		        
		Message = ProtoBuf.loadProto(proto).build("Wrap");	
		msg = new Message(originMsg)
		conv = jsbuf(protoJson)
		
		hex = msg.toHex()
		base64 = msg.toBase64()
		utf8str = ArrayBufferToUtf8String(msg.toArrayBuffer())
		
		utf8str1 = conv.queryUtf utf8str, 'error', (data) ->
			
			expect(data).toEqual({
	            errorno: 0,
	            usermsg: 'success'
	        });
			
			return data
			
		expect(utf8str1).toBe(utf8str)
		
		data = 	conv.queryUtf(utf8str, 'error')
		
		expect(data).toEqual({
            errorno: 0,
            usermsg: 'success'
	    })
		
		expect(conv.queryUtf(utf8str, 'error.usermsg')).toBe('success')
		
		expect(conv.queryUtf(utf8str, 'data.groupInfo')).toEqual(originMsg.data.groupInfo)
		expect(conv.queryUtf(utf8str, 'data.groupInfo.0')).toEqual(originMsg.data.groupInfo[0])
	
		expect(conv.queryUtf(utf8str, 'data.groupInfo.1')).toEqual(originMsg.data.groupInfo[1])
		
		expect(conv.queryUtf(utf8str, 'data.groupInfo.1.val17')).toEqual(142312608)
		
		expect(conv.queryHex(hex, 'data.groupInfo.1.val17')).toEqual(142312608)
		expect(conv.query64(base64, 'data.groupInfo.1.val17')).toEqual(142312608)
		
		str1 = conv.queryUtf(utf8str, 'data.groupInfo.1.val15', (val)->
			expect(val).toBe('ずっとずっとずっと');
			return '123';	
		)
		
		expect(conv.queryUtf(str1, 'data.groupInfo.1.val15')).toBe('123')