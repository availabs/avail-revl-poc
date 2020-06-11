import {createBrowserHistory} from 'history'
import {configureStore, getDefaultMiddleware} from '@reduxjs/toolkit';
import {connectRouter, routerMiddleware} from 'connected-react-router'
import {isFSA} from 'flux-standard-action'

import _ from 'lodash'

import reduxWebsocket from '@giantmachines/redux-websocket'
import * as reduxWebSocketEvents from './reduxWebSocketEvents'

import counterReducer from '../features/counter/counterSlice';
import fizzBuzzReducer from '../features/fizzBuzz/fizzBuzzSlice';

export const history = createBrowserHistory()

const {WEBSOCKET_MESSAGE} = reduxWebSocketEvents

// Flux Standard Actions sent from WebSocket server
//   get extracted from redux-websocket MESSAGE actions
//   and dispatched on their own.
const extractServerSideAction = _store => next => action => {
  const {type} = action

  if (type === WEBSOCKET_MESSAGE) {
    const {payload: {message = null} = {}} = action

    if (typeof message === 'string') {
      try {
        const serverDispatchedAction = JSON.parse(message)

        return next(
          isFSA(serverDispatchedAction) ?
            next(serverDispatchedAction) :
            action
        )
      } catch (err) {
        console.error(err)
        return next(action)
      }
    }
  } else {
    return next(action)
  }
}


export default configureStore({
  reducer: {
    router: connectRouter(history),
    counter: counterReducer,
    fizzBuzz: fizzBuzzReducer
  },
  middleware: [routerMiddleware(history), reduxWebsocket(), extractServerSideAction, ...getDefaultMiddleware({
    // https://github.com/giantmachines/redux-websocket/issues/101#issuecomment-615936023
    serializableCheck: {
      // https://github.com/giantmachines/redux-websocket/issues/101
      ignoredActions: _.values(reduxWebSocketEvents),
    },
  })]
});
