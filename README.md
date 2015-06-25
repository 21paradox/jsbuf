# jsbuf [![Build Status](https://travis-ci.org/21paradox/jsbuf.svg?branch=master)](https://travis-ci.org/21paradox/jsbuf) 

[![Sauce Test Status](https://saucelabs.com/browser-matrix/21paradox.svg)](https://saucelabs.com/u/21paradox)

Front-end [Google's Protocol Buffers][protobuf] decoding/encoding. This project is based on [kolorahl/jsbuf][kolorahl/jsbuf] for internal decode/encode.


Basic features are:

 * decoding/encoding protobuf data hex/base64/utf8-string 
 * only query/change the part you need, instead of decoding the whole data

protoJson:

You need to define a protoJson file for mapping the protobuf to json. Like below.

```js
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
                "optional string authorName" : 1,
                "optional string authorPortrait" : 2
              },
              "repeated Path path": 9,
              "optional int32 flo1": 10,
              "repeated string repText": 11,
              "optional int64 bigint": 12
        }

```
protoJson is inspired by [pomelo-protobuf].


### Usage

 ```js
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
                "optional string authorName" : 1,
                "optional string authorPortrait" : 2,
                "optional int32 createTime" : 3,
                "optional int32 maxMemberNum" : 4,
                "optional int32 memberNum" : 5,
                "optional int32 groupType" : 6,
              },
              "repeated Path path": 9,
              "optional int32 flo1": 10,
              "repeated string repText": 11,
              "optional int64 bigint": 12
 }
        
var conv = jsbuf(protoJson);

var hex = '0a0a6d6f726e696e67213f3a1211e697a9e4b88ae5a5bd21d4bee280b8d4be1a0ce3818ae381afe38288e38186280030033a100a0ce4b8ade69687e7bc96e7a081107b4203e9a29d4a0a0a0018be94c3a90530014a0a0a0018c894c3a905300150be94c3a9055a06e4bda0e5a5bd5a0575696173645a0ce38184e381a1e381b0e38293609deae4f1e9a2aa01';

var jsonout = conv.fromHex(hex)
		
var base64 = 'Cgptb3JuaW5nIT86EhHml6nkuIrlpb0h1L7igLjUvhoM44GK44Gv44KI44GGKAAwAzoQCgzkuK3mlofnvJbnoIEQe0ID6aKdSgoKABi+lMOpBTABSgoKABjIlMOpBTABUL6Uw6kFWgbkvaDlpb1aBXVpYXNkWgzjgYTjgaHjgbDjgpNgnerk8emiqgE=';

var jsonout = conv.frombase64(base64)

```

## API

### jsbuf(protojson)
create a jsbuf instance.

### conv.fromHex(hex)
convert hex string to Json object

### conv.toHex(json)
convert Json object to hex

### conv.frombase64(base64str)
convert base64 string to Json object

### conv.tobase64(json)
convert Json object to base64 string

### conv.fromUtf8(utf8str)
convert utf8 string to Json object

### conv.toUtf8(json)
convert Json object to hex

### conv.queryUtf(utf8str, selector, callback)
1. pick the part youneed to decode, based on selector
2. if callback provided, callback is called with the selector value, and return the str that changed.
3. if callback not provided, return the selector value.

### conv.queryHex(utf8str, selector, callback)
query hex

### conv.query64(utf8str, selector, callback)
query base64

```js
var str1 = conv.queryUtf(utf8str, 'data.groupInfo.1.val15', function (val) {
	return '123';	
});

var hex = conv.queryHex(hex, 'data.groupInfo.1.val17')

```

### Contribute
Contributions are very very welcome!!!

License
=======
[The X11 (“MIT”) License](LICENSE)


[protobuf]: https://developers.google.com/protocol-buffers/
[kolorahl/jsbuf]: https://github.com/kolorahl/jsbuf
[pomelo-protobuf]: https://github.com/pomelonode/pomelo-protobuf


