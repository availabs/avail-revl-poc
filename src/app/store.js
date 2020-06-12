import {createBrowserHistory} from 'history'
import {configureStore, getDefaultMiddleware} from '@reduxjs/toolkit';
import {connectRouter, routerMiddleware} from 'connected-react-router'

import {v4 as uuidv4} from 'uuid'

import {isFSA} from 'flux-standard-action'

import _ from 'lodash'

import reduxWebsocket, {send} from '@giantmachines/redux-websocket'
import * as reduxWebSocketEvents from './reduxWebSocketEvents'

import counterReducer from '../features/counter/counterSlice';
import fizzBuzzReducer from '../features/fizzBuzz/fizzBuzzSlice';

export const history = createBrowserHistory()

const {WEBSOCKET_MESSAGE} = reduxWebSocketEvents

const id = `BROWSER::${uuidv4()}`

// Flux Standard Actions sent from WebSocket server
//   get extracted from redux-websocket MESSAGE actions
//   and dispatched on their own.
const extractServerSideAction = store => next => action => {
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
    next(action)
  }

  if (isFSA(action) && !type.startsWith('REDUX_WEBSOCKET')) {
    const _action = {...action}
    _action.meta = action.meta ? {...action.meta} : {}
    _action.meta.$source_id = id

    store.dispatch(send(_action))
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
