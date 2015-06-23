###
    use jsbuf/Protobuf.js to decode utf-8 encoded strings
    
    And convert to js object based on proto-json (inspired by pomelo-protobuf project)
###

# helper functions
    
# utf8str -> jsstr http://ecmanaut.blogspot.jp/2006/07/encoding-decoding-utf8-in-javascript.html
utf8StrToStr = (str) -> decodeURIComponent(escape(str))

# jsstr -> utf8str
strToUtf8str = (str) -> unescape(encodeURIComponent(str))  
 
# string -> hex http://stackoverflow.com/questions/21647928/javascript-unicode-string-to-hex
# http://stackoverflow.com/questions/14603205/how-to-convert-hex-string-into-a-bytes-array-and-a-bytes-array-in-the-hex-strin            
strToHex = `function (str) {
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
}`

# hex -> string http://stackoverflow.com/questions/3745666/how-to-convert-from-hex-to-ascii-in-javascript?lq=1
hexToStr = `function (hexx) {
    var hex = hexx.toString();
    var str = '';
    for (var i = 0; i < hex.length; i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}`

# utf8str/number -> jsString/number
parseSimpleType = (str, type) ->
        switch type
            when 'string'
                return utf8StrToStr(str)
            when 'float','double','int32','uint32','uInt32','sint32','sInt32','int64','uint64','uInt64','sint64','sInt64'
                return parseFloat(utf8StrToStr(str))
            when 'bool'
                return !!str


# strings bool int, not object not array
SimpleTypes = [
                'string', 'bool', 'float', 'double'
                'int32', 'int64',
                'uint32', 'uint64', 'uInt32','uInt64'
                'sint32', 'sint64', 'sInt32','sInt64',
                'bytes' 
              ]
              
# convert utf8str to jsobject
# takes (protojson, utf8str) -> jsobject
decObj = (protoJson, utf8str) ->
    parsed = Protobuf.decode(utf8str)
    outMsg = {}

    for keys, index of protoJson
    
        infos = keys.split(' ')
        
        if infos.length isnt 3 then continue
        
        rule = infos[0]
        type = infos[1]
        name = infos[2]
        
        # filter items that is index
        filterOut = (item for item in parsed when item[0] is index)
            
        # if there is no result fill null
        if filterOut.length is 0
            if rule isnt 'repeated' then outMsg[name] = null
            else  outMsg[name] = []
            continue

        # simpleTypes and single values
        if rule isnt 'repeated' and type in SimpleTypes 
            parsedVal = filterOut[0][2]
            outMsg[name] = parseSimpleType(parsedVal, type)
            
        # array of simple types
        else if rule is 'repeated' and type in SimpleTypes 
            outMsg[name] = []
            for item in filterOut
                outMsg[name].push parseSimpleType(item[2], type)
        
        # array of objects
        else if rule is 'repeated'
            curKey = "message #{type}"
            outMsg[name] = []
            for item in filterOut
                outMsg[name].push decObj(protoJson[curKey], item[2])
                
        # object        
        else 
            curKey = "message #{type}"
            parsedVal = filterOut[0][2]
            outMsg[name] = decObj(protoJson[curKey], parsedVal)
                
    return outMsg



# jsString/number -> utf8str/number
backSimpleType = (str, type) ->
    switch type
        when 'string', 'bytes' 
            return strToUtf8str(str)
        when 'float','double','int32','int64','uint32','uint64','uInt32','uInt64','sint32','sint64','sInt32','sInt64'
            return str
        when 'bool'
             if str then return '1' else return '0'


# convert jsobject to  utf8str
# takes (protojson, jsobject) -> utf8str
encObj = (protoJson, obj) ->
    outarr = []
    
    for keys, index of protoJson
        
        infos = keys.split(' ')
        
        if infos.length isnt 3 then continue
    
        rule = infos[0]
        type = infos[1]
        name = infos[2]
        
        # if there is no result go on
        if not obj[name]? then continue

        # simpleTypes and single values
        if rule isnt 'repeated' and type in SimpleTypes 
            outarr.push [index, type, backSimpleType(obj[name], type)]
            
        # array of simple types
        else if rule is 'repeated' and type in SimpleTypes 
            for item in obj[name]
                outarr.push [index, type, backSimpleType(item, type)]
                
        # array of objects        
        else if rule is 'repeated'
            curKey = "message #{type}"
            for item in obj[name]
                outarr1 = encObj(protoJson[curKey], item)
                outarr.push [index, 'string', outarr1]
            
        else 
            curKey = "message #{type}"
            outarr1 = encObj(protoJson[curKey], obj[name])
            outarr.push [index, 'string', outarr1]

    return Protobuf.encode(outarr)
 

typeIsArray = Array.isArray || ( value ) -> return Object.prototype.toString.call(value) is '[object Array]'

   
# query or change specified protobuf values 
# only change the specified part without side effects
# selector is like 'data.groupInfo.2' which can by split by dot
query = (protoJson, utf8str, selectorInput, callback) ->
    
    selectors = selectorInput.split('.')
    # currentJson file
    curProtoJson = protoJson
    # 
    decodeData = Protobuf.decode(utf8str)
    curDecodeData = decodeData

    for selector, i in selectors
    
        if docontinue 
           docontinue = false 
           continue

        # assgin type to decodeData
        # and find current protoJsonKey
        protoJsonKey = do (selector) ->
            
            for key, index of curProtoJson
                infos = key.split(' ')
                if infos.length isnt 3 then continue
                
                rule = infos[0]
                type = infos[1]
                name = infos[2]
                
                filterOut = (item for item in curDecodeData when item[0] is index)
                
                # assgin type into filterOut
                if rule is 'repeated' or type not in SimpleTypes
                    filterOutItem[1] = 'string' for filterOutItem in filterOut
                else 
                    filterOutItem[1] = type for filterOutItem in filterOut
            
                if name is selectors[i] then protoJsonKey = key
                
             return protoJsonKey 
                
        # console.log protoJsonKey, selectors[i]
        matchResult = protoJsonKey.split(' ');
        
        rule = matchResult[0]
        type = matchResult[1]
        index = curProtoJson[protoJsonKey]

        filterOut = (item for item in curDecodeData when item[0] is index)
        
        _protoJson = curProtoJson["message #{type}"]
        
        # simpleTypes and single values
        if rule isnt 'repeated' and type in SimpleTypes 
            if i is selectors.length - 1
                # utf8str -> jsstr -> callback Convert -> utf8str
                filterOut[0][2] = backSimpleType(callback(parseSimpleType(filterOut[0][2], type)), type)
                break
                
        # array of simple types
        else if rule is 'repeated' and type in SimpleTypes 
            if i is selectors.length - 1
                outArr = (parseSimpleType(filterItem[2], type) for filterItem in filterOut)
                outArrConverted = callback(outArr)
                # assgin back
                filterOut[i][2] = backSimpleType(valueConverted, type) for valueConverted, i in outArrConverted
                break
      
        # array of objects
        else if rule is 'repeated'
            # the entire array of objects
            if i is selectors.length - 1
                outarr = []
                for filterOutItem in filterOut
                    outarr.push decObj(_protoJson, filterOutItem[2])
                    
                outarrNew = callback(outarr)
                
                for filterOutItem, j in filterOut
                    filterOut[j][2] = encObj(_protoJson, outarrNew[j])
                break
                
            # one object in the array    
            else if i is selectors.length - 2
               i += 1
               inobj = decObj(_protoJson, filterOut[selectors[i]][2])
               outobj = callback(inobj)
               filterOut[selectors[i]][2] = encObj(_protoJson, outobj)
               break    
               
            # has more info, shallow decode and pass through   
            else if i < selectors.length - 2
               i += 1  
               filterOut[selectors[i]][2] = Protobuf.decode(filterOut[selectors[i]][2])
               curDecodeData = filterOut[selectors[i]][2]
               docontinue = true
                
        # object        
        else 
            if i is selectors.length - 1
                inobj = decObj(_protoJson, filterOut[i][2])
                outobj = callback(inobj)
                filterOut[i][2] = encObj(_protoJson, outobj)
                break;
            else 
                filterOut[i][2] = Protobuf.decode(filterOut[i][2])
                curDecodeData = filterOut[i][2]
           
        #shift curProtoJson
        #curProtoJson = curProtoJson["message #{type}"]
        curProtoJson = _protoJson
        
    #console.log(decodeData, 'dec')
    
    packArr = (decodeData) ->
        for datarow in decodeData
            if typeIsArray(datarow[2])
                datarow[2] = packArr(datarow[2])
        return Protobuf.encode(decodeData)
        
     return packArr(decodeData)

class jsbuf extends Protobuf

  constructor: (@protoJson) ->
    if this not instanceof jsbuf
        return new jsbuf(@protoJson)
        
  #utf8str -> json
  fromUtf8: (utf8str) -> decObj(@protoJson, utf8str) 
  
  #json -> utf8str
  toUtf8: (obj) -> encObj(@protoJson, obj)
  
  #hex -> json    
  fromHex: (hex) ->
    utf8str = hexToStr(hex)
    decObj(@protoJson, utf8str)
  
  #json -> hex  
  toHex: (obj) ->
    utf8str = encObj(@protoJson, obj)
    strToHex(utf8str)
    
  #base64str -> json  
  frombase64: (base64str) ->
    utf8str = window.atob?(base64str) or base64.decode(base64str)
    decObj(@protoJson, utf8str) 
  
  #json -> base64str  
  tobase64: (obj) ->
    utf8str = encObj(@protoJson, obj)
    utfstr = window.btoa?(utf8str) or base64.encode(utf8str)
    return utfstr
    
  queryUtf: (utf8str, selector, callback) ->
    if callback   
        return query(@protoJson, utf8str, selector, callback)
    else 
        val = null
        query(@protoJson, utf8str, selector, (data) -> 
            val = data 
            return data
        )
        return val
        
  queryHex: (hex, selector, callback) ->
      utf8str = hexToStr(hex)
      return this.queryUtf(utf8str, selector, callback)
  
  query64: (base64str, selector, callback) ->
      utf8str = window.atob?(base64str) or base64.decode(base64str)
      return this.queryUtf(utf8str, selector, callback) 
  

#exports to window
this.jsbuf = jsbuf