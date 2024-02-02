import fs from "node:fs";

let tls;
try {
  tls = await import("node:tls");
} catch (err) {
  console.log("Current Node.js build has TLS support disabled!");
}

const logFile = fs.createWriteStream("./SSLKEYLOGFILE.log", { flags: "a" });

const options = {
  ca: [fs.readFileSync("server/certificates/certificate.pem")],
};

const socket = tls.connect(8000, options);

socket.setEncoding("utf-8");

socket.on("keylog", (line) => {
  logFile.write(line);
  console.log("[keylog]", line.toString("utf8"));
});

socket.on("secureConnect", () => {
  console.log("connected to server; server is", socket.authorized ? "authorized" : "unauthorized");

  // Kill connection after 500ms
  setTimeout(() => {
    console.log("closing connection...");
    socket.end();
  }, 500);
});

socket.on("data", (data) => {
  console.log("[server]:", data);
});

socket.on("close", () => {
  console.log("connection closed");
});
