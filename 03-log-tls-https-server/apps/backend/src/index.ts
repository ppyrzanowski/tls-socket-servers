import fs from "node:fs";
import express from "express";
import { TLSSocket } from "node:tls";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { trackClientHellos } from "read-tls-client-hello";
import { getCipherMappings } from "./cipherMappings.js";
import { TlsCipherSuiteDTO } from "dto-types";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const resolve = (...paths: string[]) => path.resolve(__dirname, ...paths);

const cipherMappings = await getCipherMappings();

// let https: typeof import("node:https");
let https;
try {
  https = await import("node:https");
} catch (err) {
  console.log("Current Node.js build has HTTPS support disabled!");
  process.exit(1);
}

const app = express();

// React frontend bundle
app.use(express.static(resolve("public", "client")));

app.get("/my-cipher-suites", (req, res) => {
  let socket = req.socket as TLSSocket;
  const fingerprintData = socket.tlsClientHello?.fingerprintData;

  if (!fingerprintData) {
    throw new Error("No fingerprint data available");
  }

  const [_tlsVersion, cipherHexValueUint16Array, _extensions, _groups, _curveFormats] =
    fingerprintData;

  const clientCipherSuitesDto: TlsCipherSuiteDTO[] =
    cipherHexValueUint16Array.map<TlsCipherSuiteDTO>((cipherHexValueUint16) => {
      const cipherSuite = cipherMappings.get(cipherHexValueUint16);
      if (!cipherSuite) {
        throw new Error(
          `Couldn't find mapping of cipher-hex-value-uint16 (${cipherHexValueUint16}) to cipher-suite`
        );
      }
      // Convert cipher-hex-bytes buffer `<Buffer 13 01> to array of two uint8 values `[19,1]`
      const hexValueUint8Array = Array.from(cipherSuite.value);
      if (hexValueUint8Array.length !== 2) {
        throw new Error(`Invalid cipher-hex-bytes buffer conversion, recievd length: \
        ${hexValueUint8Array.length}`);
      }
      // Convert uint8 array `[19,1]` to string `0x13,0x01`
      const hexValueStr = hexValueUint8Array.map((b: number) => `0x${b.toString(16)}`).join(",");

      return {
        hex_value_uint16: cipherHexValueUint16,
        hex_value_uint8_array: [hexValueUint8Array[0], hexValueUint8Array[1]],
        hex_value_str: hexValueStr,
        description: cipherSuite.description,
        recommended: cipherSuite.recommended,
        reference: cipherSuite.reference,
      } as TlsCipherSuiteDTO;
    });

  console.log("client ciphers:", clientCipherSuitesDto);

  res.status(200).json(clientCipherSuitesDto);
});

app.get("/tls-info", (req, res) => {
  let socket = req.socket as TLSSocket;

  const clientHello = socket.tlsClientHello;
  const clientCiphers = socket.tlsClientHello?.fingerprintData[1].map((cipherHexValueAsDec) =>
    cipherMappings.get(cipherHexValueAsDec)
  );

  // exclude:
  //   - `tlsSocket.authorized`,
  //   - `tlsSocket.getPeerCertificate()`,
  //   - `tlsSocket.getPeerX509Certificate()`
  //   because we dont expect certificate from clients
  // TODO: incooperate `tlsSocket.enableTrace()` if it makes snese
  // TODO: `tlsSocket.exportKeyingMaterial()`

  // Certificate of server
  const serverCertificate = socket.getCertificate();

  const negotiatedCipherSuite = socket.getCipher();

  const serverFinishedMessage = socket.getFinished();

  const clientFinishedMessage = socket.getPeerFinished();

  const protocol = socket.getProtocol();

  const tlsSession = socket.getSession();

  const sharedSignatureAlgorithms = socket.getSharedSigalgs();

  const sessionResued = socket.isSessionReused();

  const serverAddress = socket.localAddress;

  const serverPort = socket.localPort;

  const clientAddress = socket.remoteAddress;

  const clientPort = socket.remotePort;

  const clientIpFamily = socket.remoteFamily;

  const response = {
    clientHello,
    serverCertificate,
    negotiatedCipherSuite,
    serverFinishedMessage,
    clientFinishedMessage,
    protocol,
    tlsSession,
    sharedSignatureAlgorithms,
    sessionResued,
    serverAddress,
    serverPort,
    clientAddress,
    clientPort,
    clientIpFamily,
    clientCiphers,
  };

  res.status(200).json(response);
});

// let the react app to handle any unknown routes
// serve up the index.html if express does'nt recognize the route
app.get("/*", (req, res) => {
  res.sendFile(resolve("public", "client", "index.html"));
});

// Primitive request handler (usage without ExpressJS):
//
// const app = (req, res) => {
//   res.writeHead(200);
//   res.end("Hello world\n");
// }

const options = {
  key: fs.readFileSync(path.join(__dirname, "certificates", "key.pem")),
  cert: fs.readFileSync(path.join(__dirname, "certificates", "certificate.pem")),
  // Do not use client certificate authentication for now
  requestCert: false,
};

// https://expressjs.com/de/4x/api.html#app.listen
const httpsServer = https.createServer(options, app);

// httpsServer.on("connection", (socket) => {
//   console.log("connection", socket);
// });

// httpsServer.on("newSession", (sessionId, sessionData, cb: () => void) => {
//   console.log("new-session:", sessionData, sessionId);
//   cb();
// });

trackClientHellos(httpsServer);

const port = 9443;
httpsServer.listen(port, () => {
  console.log(`HTTPS server bound at localhost:${port}\n`);
});
