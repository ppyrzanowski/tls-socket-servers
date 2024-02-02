import fs from "node:fs";
import express from "express";
import { TLSSocket } from "node:tls";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// let https: typeof import("node:https");
let https;
try {
  https = await import("node:https");
} catch (err) {
  console.log("Current Node.js build has HTTPS support disabled!");
  process.exit(1);
}

const app = express();

app.get("/", (req, res) => {
  res.status(200).contentType("text").send("Hello world, served by express.\n");
});

app.get("/tls-info", (req, res) => {
  let socket = req.socket as TLSSocket;
  const ciphers = socket.getCipher();
  res.status(200).json(ciphers);
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

const port = 9443;
httpsServer.listen(port, () => {
  console.log(`HTTPS server bound at localhost:${port}\n`);
});
