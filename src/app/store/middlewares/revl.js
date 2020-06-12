import {connect, send} from '@giantmachines/redux-websocket'
import {isFSA} from 'flux-standard-action'
import {v4 as uuidv4} from 'uuid'
import _ from 'lodash'

import {MESSAGE} from './reduxWebSocketEvents'

import {webSocketServerPort} from '../../../config'

const id = `BROWSER::${uuidv4()}`

const connectToSocketServer = _.once(dispatch => dispatch(connect(`ws://localhost:${webSocketServerPort}`)))

// Flux Standard Actions sent from WebSocket server
//   get extracted from redux-websocket MESSAGE actions
//   and dispatched on their own.
const extractServerSideAction = store => next => action => {
  const {type} = action

  connectToSocketServer(store.dispatch)

  if (type === MESSAGE) {
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

export default extractServerSideAction
