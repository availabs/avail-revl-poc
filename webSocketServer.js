#!/usr/bin/env node

console.log('WebSocket Server')

const WebSocket = require('ws')

const { webSocketServerPort } = require('./src/config')

const wss = new WebSocket.Server({ port: webSocketServerPort })

const FIZZBUZZ_NUM = 'FIZZBUZZ_NUM'
const FIZZBUZZ_MSG = 'FIZZBUZZ_MSG'

wss.on('connection', ws => {
    ws.on('message', function incoming(action) {
        try {
            const { type, payload } = JSON.parse(action)

            switch (type) {
                case FIZZBUZZ_NUM: {
                    const fizzin = !(payload % 3) ? 'fizz' : ''
                    const buzzin = !(payload % 5) ? 'buzz' : ''

                    const str = `${fizzin}${buzzin}` || payload

                    const action = { type: FIZZBUZZ_MSG, payload: str }

                    return ws.send(JSON.stringify(action))
                }
                default:
            }
        } catch (err) {
            const errAction = {
                type: 'WEBSOCKET_SERVER::BAD_REQUEST_ERROR',
                payload: err,
                error: true,
                meta: { code: 400 }
            }

            return ws.send(JSON.stringify(errAction))
        }
    });
})
