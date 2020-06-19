import { getDefaultMiddleware } from "@reduxjs/toolkit";
import { routerMiddleware } from "connected-react-router";

import reduxWebsocket from "@giantmachines/redux-websocket";

import history from "../../utils/history";

import { revlMiddleware } from "../revl";

export default [
  routerMiddleware(history),
  reduxWebsocket(),
  revlMiddleware,
  ...getDefaultMiddleware({
    // https://github.com/reduxjs/redux-toolkit/issues/415#issuecomment-596812204
    immutableCheck: false,
    // https://github.com/giantmachines/redux-websocket/issues/101#issuecomment-615936023
    serializableCheck: false,
  }),
];
