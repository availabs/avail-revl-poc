import watch from "redux-watch";

import { connect, send } from "@giantmachines/redux-websocket";

import diff, { applyChange } from "deep-diff";
import _ from "lodash";

import { isFSA } from "flux-standard-action";

import { host, webSocketServerPort } from "../../../config";
import {
  WEBSOCKET_OPEN,
  WEBSOCKET_CLOSED,
  WEBSOCKET_MESSAGE,
  STORE_CHANGE,
} from "./constants";

import id from "../../constants/id";

const connectToSocketServer = _.once((dispatch) =>
  dispatch(connect(`ws://${host}:${webSocketServerPort}`))
);

let socketIsOpen = false;
const actionsQueue = [];

// Flux Standard Actions sent from WebSocket server
//   get extracted from redux-websocket MESSAGE actions
//   and dispatched on their own.
export const revlMiddleware = (store) => (next) => (action) => {
  const { type } = action;

  connectToSocketServer(store.dispatch);

  if (type === WEBSOCKET_OPEN) {
    socketIsOpen = true;
    while (socketIsOpen && actionsQueue.length) {
      const _action = actionsQueue.shift();

      store.dispatch(send(_action));
    }
  }

  if (type === WEBSOCKET_CLOSED) {
    socketIsOpen = false;
  }

  if (type === WEBSOCKET_MESSAGE) {
    const { payload: { message = null } = {} } = action;

    if (typeof message === "string") {
      try {
        const serverDispatchedAction = JSON.parse(message);

        return next(
          isFSA(serverDispatchedAction) ? serverDispatchedAction : action
        );
      } catch (err) {
        console.error(err);
        return next(action);
      }
    }
  }

  next(action);

  // Send action to the mother ship iff it originated here.
  const $source_id = _.get(action, ["meta", "$source_id"], id);
  if (
    isFSA(action) &&
    !type.startsWith("REDUX_WEBSOCKET") &&
    $source_id === id
  ) {
    const _action = { ...action };
    _action.meta = action.meta ? { ...action.meta } : {};
    _action.meta.$source_id = $source_id;

    if (socketIsOpen) {
      store.dispatch(send(_action));
    } else {
      actionsQueue.push(_action);
    }
  }

  return null;
};

// Need this because the "store" passed to middleware does not include the subscribe method.
export const watchStore = (store) => {
  const w = watch(store.getState);

  store.subscribe(
    w((newVal, oldVal) => {
      const differences = diff(oldVal, newVal);

      if (Array.isArray(differences) && differences.length) {
        const delta = differences.reduce((acc, d) => {
          applyChange(acc, d);
          return acc;
        }, {});

        store.dispatch({
          type: STORE_CHANGE,
          payload: delta,
          meta: { $source_id: id, timestamp: Date.now() },
        });
      }
    })
  );
};
