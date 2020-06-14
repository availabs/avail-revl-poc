// https://nodejs.org/api/repl.html#repl_starting_multiple_repl_instances_against_a_single_running_instance
// https://gist.github.com/TooTallNate/2209310
// https://medium.com/trabe/mastering-the-node-js-repl-part-3-c0374be0d1bf

import net from "net";
import repl from "repl";

import socketPath from "./socketPath";

let connections = 0;

net
  .createServer((socket) => {
    const id = `repl::${(connections += 1)}`;

    repl
      .start({
        prompt: `Node.js via Unix socket: ${id}>`,
        input: socket,
        output: socket,
        terminal: true,
      })
      .on("exit", () => {
        socket.end();
      });
  })
  .listen(socketPath);

console.log("Run `yarn repl` to connect to connect a repl to the server.");
