import { hostname } from 'os'
import EventEmitter from 'events'
import { execSync } from 'child_process'
import {existsSync, mkdirSync, createWriteStream, createReadStream, unlinkSync} from 'fs'
import { join, relative } from 'path'
import pump from 'pump'
import split from 'split2'
import through from 'through2'

import exitHook from 'exit-hook'

import {isFSA} from 'flux-standard-action'

interface Action<Payload> {
  type: string;
  payload: Payload;
  error?: boolean;
  meta?: Object;
}

const logDir = join(__dirname, 'logs')
mkdirSync(logDir, { recursive: true })

const actionsLogPath = join(logDir, 'tmpActionLogsFifo')
const actionsInputPipePath = join(logDir, 'tmpInputFifo')

if (existsSync(actionsLogPath)) {
  unlinkSync(actionsLogPath)
}

if (existsSync(actionsInputPipePath)) {
  unlinkSync(actionsInputPipePath)
}

const relOutPath = relative(process.cwd(), actionsLogPath)
console.log()
console.log('Actions output FIFO pipe:', relOutPath)
console.log(`     jq . ${relOutPath}`)
console.log()

const id = `${hostname() || ''}::inputFifo`

const relInPath = relative(process.cwd(), actionsInputPipePath)
console.log('Actions input FIFO pipe:', relInPath)
console.log(`     echo '{"type":"repl/ECHO","payload":"hi","meta":{"$source_id":"${id}"}}' > ${relInPath}`)
console.log()

// https://github.com/ccnokes/node-fifo-example/blob/197268e4921246a8e85fbaef341d21ea5500a7ee/index.js#L12
execSync(`mkfifo ${actionsLogPath}`)
execSync(`mkfifo ${actionsInputPipePath}`)

const outputStream = createWriteStream(actionsLogPath)

// https://stackoverflow.com/a/40390938/3970755
const inputStream = createReadStream(actionsInputPipePath, { flags: 'r+'})

pump(
  inputStream,
  split(),
  through.obj((line, _$:any, cb: ()=>void) => {
    try {
      const action:Action<any> = JSON.parse(line)
      actionEmitter.emit('action', action)
    } catch (err) {
      console.error(err.message)
    } finally {
    cb()
    }
  }),
  (err:Error) => {
    if (err) {
      console.error(err)
    }
  }
)

exitHook(() => {
  try {
    unlinkSync(actionsLogPath)
    unlinkSync(actionsInputPipePath)
  } catch (err) {
    console.error(err)
  }
})

export const INVALID_ACTION_MSG = 'Action is not valid a Flux Standard Action.'

const actionEmitter = new EventEmitter()

// https://nodejs.org/api/events.html#events_asynchronous_vs_synchronous
// "The EventEmitter calls all listeners synchronously in the order in which they were registered.
//  This ensures the proper sequencing of events and helps avoid race conditions and logic errors."
actionEmitter.on('action', action => {
  // The authoritatve enforcer. Guaranteed to be first in order.

  outputStream.write(`${JSON.stringify(action)}\n`)

  if (!isFSA(action)) {
    console.error(INVALID_ACTION_MSG)
    throw new Error(INVALID_ACTION_MSG)
  }
}
)

export default {
  subscribe: (fn:(...args: any[]) => void) => actionEmitter.on('action', fn),
  dispatch: (action:Action<any>) => actionEmitter.emit('action', action)
}
