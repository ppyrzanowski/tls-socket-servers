import fs from "node:fs";

// Verify Node.js was build with TLS support.
let tls;
try {
  tls = await import("node:tls");
} catch (err) {
  console.log("Current Node.js build has TLS support disabled!");
  // Termiante Node.js.
  process.exit(1);
}

// Location of private-key and self-signed server-certificate.
const options = {
  key: fs.readFileSync("server/certificates/key.pem"),
  cert: fs.readFileSync("server/certificates/certificate.pem"),
  // Do not use client certificate authentication for now.
  requestCert: false,
};

// Callback parameter (`secureConnectionListener`) is internaly set as listener/handler
// for "secureConnection" event, called on every new finalized TLS connection.
const server = tls.createServer(options, (socket) => {
  console.log(
    "[new connection established]: client is",
    socket.authorized ? "authenticated" : "unauthenticated"
  );

  socket.write("welcome!\n");
  socket.setEncoding("utf-8");
  socket.pipe(socket);

  // Client closed their side of the connection.
  socket.on("end", () => {
    console.log("[client closed connection]");
  });

  // Connection is terminated on both ends.
  socket.on("close", () => {
    console.log("[connection closed]");
  });
});

const port = 8000;
server.listen(port, () => {
  console.log(`socket server bound to port ${port}; waiting for connections...\n`);
});
