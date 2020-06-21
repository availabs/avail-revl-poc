import WebSocket from "ws";

import exitHook from "exit-hook";
import actionEmitter, { INVALID_ACTION_MSG } from "./actionEmitter";

import { webSocketServerPort } from "../config";

// TODO: Look into using UNIX Domain Sockets
//   https://github.com/websockets/ws/blob/master/doc/ws.md#unix-domain-sockets
const wss = new WebSocket.Server({ port: webSocketServerPort });

// https://github.com/websockets/ws/blob/master/doc/ws.md#serverclosecallback
exitHook(() => {
  try {
    wss.close();
  } catch (err) {
    console.error(err);
  }
});

interface Meta {
  $source_id: string;
  $target_id: string;
  broadcast?: boolean;
  [key: string]: any;
}
interface Action<Payload> {
  type: string;
  payload: Payload;
  error?: boolean;
  meta: Meta;
}

wss.on("connection", (ws) => {
  let id: string;

  actionEmitter.subscribe((action: Action<any>) => {
    const {
      meta: { $source_id, $target_id, broadcast },
    } = action;

    // Don't echo action back to sender
    if ($source_id === id) {
      return;
    }

    // Targe is specified,
    if ($target_id && id !== $target_id) {
      return;
    }

    // Came from the browser but not for broadcast
    if (!$target_id && !broadcast) {
      return;
    }

    ws.send(JSON.stringify(action));
  });

  ws.on("message", function incoming(serializedAction: string) {
    try {
      const action: Action<any> = JSON.parse(serializedAction);

      if (!id) {
        const {
          meta: { $source_id },
        } = action;

        id = $source_id;
      }

      try {
        return actionEmitter.dispatch(action);
      } catch (err) {
        if (err.message === INVALID_ACTION_MSG) {
          throw err;
        }
        console.error(err);
        return null;
      }
    } catch (err) {
      const errAction = {
        type: "WEBSOCKET_SERVER::BAD_REQUEST_ERROR",
        payload: err,
        error: true,
        meta: { code: 400 },
      };

      return ws.send(JSON.stringify(errAction));
    }
  });
});
