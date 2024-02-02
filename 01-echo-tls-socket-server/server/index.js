import fs from "node:fs";

let tls;
try {
  tls = await import("node:tls");
} catch (err) {
  console.log("Current Node.js build has TLS support disabled!");
}

const options = {
  key: fs.readFileSync("server/certificates/key.pem"),
  cert: fs.readFileSync("server/certificates/certificate.pem"),
  // Do not use client certificate authentication for now
  requestCert: false,
};

// callback parameter (secureConnectionListener) is set as listener for "secureConnection" event
const server = tls.createServer(options, (socket) => {
  console.log(
    "new connection established; client is",
    socket.authorized ? "authorized" : "unauthorized"
  );

  socket.write("welcome!\n");
  socket.setEncoding("utf-8");
  socket.pipe(socket);

  socket.on("end", () => {
    console.log("client closed connection");
  });

  socket.on("close", () => {
    console.log("connection closed\n");
  });
});

server.listen(8000, () => {
  console.log("server bound\n");
});
