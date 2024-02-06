import fs from "node:fs";
import express from "express";
import { TLSSocket } from "node:tls";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { trackClientHellos } from "read-tls-client-hello";
import { getCipherMappings } from "./cipherMappings.js";

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

app.get("/cipher-list", (req, res) => {
  let socket = req.socket as TLSSocket;

  const clientCiphers = socket.tlsClientHello?.fingerprintData[1].map((cipherHexValueAsDec) => {
    const cipher = cipherMappings.get(cipherHexValueAsDec);
    if (!cipher) {
      throw new Error("someting went wrong mapping cipher byte value");
    }
    // const cipherValueInBytes = cipher.value.toString("hex"); // missing byte seperation
    const valueAsTwoBytes = Array.from(cipher.value)
      .map((b: any) => `0x${b.toString(16)}`)
      .join(",");

    return `${cipherHexValueAsDec} (${valueAsTwoBytes}) ${cipher.description}`;
  });

  console.log("client ciphers:", clientCiphers);

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>
  <code>${clientCiphers?.join("<br>")}</code>
  
</body>
</html>
  `;
  res.status(200).send(html);
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
