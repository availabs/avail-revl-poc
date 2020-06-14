import net from "net";

import socketPath from "./socketPath";

const socket = net.createConnection(socketPath);

process.stdin.pipe(socket);
socket.pipe(process.stdout);

socket.on("connect", () => {
  process.stdin.setRawMode(true);
});

socket.on("close", () => {
  process.exit(0);
});

// process.on("exit", () => {
// console.log("Done");
// });
