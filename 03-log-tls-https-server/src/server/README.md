https://testssl.sh/openssl-iana.mapping.html

https://www.iana.org/assignments/tls-parameters/tls-parameters.xhtml#tls-parameters-4

https://stackoverflow.com/questions/8044543/how-can-i-store-an-integer-in-a-nodejs-buffer

Package `read-tls-client-hello` does not map the cipher suite byte values to their descriptive name.

Read byte values of first column in [./iana_tls_cipher_suites.csv](./iana_tls_cipher_suites.csv) as Buffer:

```js
// Buffer of size 2 bytes
let bufA = Buffer.allocUnsafe(2);
// Write 2 bytes from csv
buf.writeUInt8(0x13, 0);
buf.writeUInt8(0x01, 1);

let bufB = Buffer.allocUnsafe(2);
buf.writeUInt16BE(4865);

// bufA = bufB = <Buffer 13 01>

Buffer.from([0x13, 0x01]);
// <Buffer 13 01>

// This is the format provied by iana in the csv
Buffer.from("0x13,0x01".split(","));
// <Buffer 13 01>

Buffer.from([0x13, 0x01]).readUInt16BE();
// 4865
```
