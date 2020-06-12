import WebSocket from 'ws'

import actionEmitter, {INVALID_ACTION_MSG} from './actionEmitter'

import * as registry from './registry'

import {webSocketServerPort} from '../src/config'

// This is just to "inject" the "reducers"
console.log('Registered "reducers":')
Object.keys(registry).forEach(reducerName => console.log('  ', reducerName))
console.log()

const wss = new WebSocket.Server({port: webSocketServerPort})

wss.on('connection', ws => {
  let id

  actionEmitter.on('action', action => {
    const {meta: {$source_id, $target_id, broadcast}} = action

    // Don't echo action back to sender
    if ($source_id === id) {
      return
    }

    if ($target_id && id !== $target_id) {
      return
    }

    // Came from the browser but not for broadcast
    if (!$target_id && !broadcast) {
      return
    }

    ws.send(JSON.stringify(action))
  })

  ws.on('message', function incoming(serializedAction) {
    try {
      const action = JSON.parse(serializedAction)

      if (!id) {
        const {meta: {$source_id}} = action

        id = $source_id
      }

      try {
        actionEmitter.emit('action', action)
      } catch (err) {
        if (err.message === INVALID_ACTION_MSG) {
          throw err
        }
        console.error(err)
      }
    } catch (err) {
      const errAction = {
        type: 'WEBSOCKET_SERVER::BAD_REQUEST_ERROR',
        payload: err,
        error: true,
        meta: {code: 400}
      }

      return ws.send(JSON.stringify(errAction))
    }
  });
})

