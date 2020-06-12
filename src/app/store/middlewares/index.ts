import { getDefaultMiddleware } from '@reduxjs/toolkit';
import { routerMiddleware } from 'connected-react-router'

import reduxWebsocket from '@giantmachines/redux-websocket'
import reduxWebSocketEvents from './reduxWebSocketEvents'

import history from '../../utils/history';

import revl from './revl'

export default [routerMiddleware(history), reduxWebsocket(), revl, ...getDefaultMiddleware({
  // https://github.com/giantmachines/redux-websocket/issues/101#issuecomment-615936023
  serializableCheck: {
      // https://github.com/giantmachines/redux-websocket/issues/101
      ignoredActions: reduxWebSocketEvents,
  },
})]
