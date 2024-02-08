import fs from "node:fs";

// Verify Node.js was build with TLS support.
let tls;
try {
  tls = await import("node:tls");
} catch (err) {
  console.log("Current Node.js build has TLS support disabled!");
  // Terminate Node.js.
  process.exit(0);
}

const options = {
  ca: [fs.readFileSync("server/certificates/certificate.pem")],
};

// Connect to server
const socket = tls.connect(8000, options, () => {
  console.log(
    "[connected to server]: server is",
    socket.authorized ? "authenticated" : "unauthenticated"
  );
  process.stdin.pipe(socket);
  process.stdin.resume();
});

socket.setEncoding("utf-8");

// Event dispatched when server sent data
socket.on("data", (data) => {
  console.log("[server]:", data);

  // Uncomment this `setTimeout` call if you want to automatically close the connection after 3 sec.
  // setTimeout(() => {
  //   console.log("data listener timed out: closing connection...");
  //   socket.end();
  // }, 3000);
});

socket.on("close", () => {
  console.log("[connection closed]");
});
