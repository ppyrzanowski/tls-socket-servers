import fs from "node:fs";

let tls;
try {
  tls = await import("node:tls");
} catch (err) {
  console.log("Current Node.js build has TLS support disabled!");
}

const options = {
  ca: [fs.readFileSync("server/certificates/certificate.pem")],
};

const socket = tls.connect(8000, options, () => {
  console.log("connected to server; server is", socket.authorized ? "authorized" : "unauthorized");
  process.stdin.pipe(socket);
  process.stdin.resume();
});

socket.setEncoding("utf-8");

socket.on("data", (data) => {
  console.log("[server]:", data);

  setTimeout(() => {
    console.log("data listener timed out: closing connection...");
    socket.end();
  }, 3000);
});

socket.on("close", () => {
  console.log("connection closed");
});
