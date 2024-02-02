import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type Https from "node:https";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Verify https module is available
let https;
try {
  https = await import("node:https");
} catch (err) {
  console.log("Current Node.js build has TLS support disabled!");
  process.exit(1);
}

// Setup sslkeylog file
const logFile = fs.createWriteStream("./SSLKEYLOGFILE.log", { flags: "a" });
https.globalAgent.on("keylog", (line, tlsSocket) => {
  logFile.write(line);
});

// Setup request options
const options: Https.RequestOptions = {
  // method: "GET",
  // hostname: "localhost",
  // port: 9443,
  // path: "/tls-info",
  timeout: 2500,

  ca: [fs.readFileSync(path.join(__dirname, "certificates", "server-certificate.pem"))],
};

// Encapsulate req variable for access from within callback only (closure)
// Make HTTPS request to server
(() => {
  console.log("Sending request...");
  const req = https.request("https://localhost:9443/tls-info", options, (res) => {
    console.log(res.statusCode);
    res.on("data", (d) => {
      process.stdout.write(d);
    });
  });
  req.on("error", (e) => {
    console.error(e);
  });
  req.end();
})();
