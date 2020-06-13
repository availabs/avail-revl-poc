import EventEmitter from 'events'
import { execSync } from 'child_process'
import {mkdirSync, createWriteStream, unlinkSync} from 'fs'
import { join } from 'path'

import nodeCleanup from 'node-cleanup'

import {isFSA} from 'flux-standard-action'

const logDir = join(__dirname, 'logs')
mkdirSync(logDir, { recursive: true })

const actionLogPath = join(logDir, 'tmpActionLogsFifo')

nodeCleanup(() => {
  try {
    unlinkSync(actionLogPath)
  } catch (err) {
    //
  }
})

console.log()
console.log('To watch the action log:')
console.log(`     jq . ${actionLogPath}`)
console.log()

// https://github.com/ccnokes/node-fifo-example/blob/197268e4921246a8e85fbaef341d21ea5500a7ee/index.js#L12
execSync(`mkfifo ${actionLogPath}`)
const logger = createWriteStream(actionLogPath)

export const INVALID_ACTION_MSG = 'Action is not valid a Flux Standard Action.'


const actionEmitter = new EventEmitter()

// https://nodejs.org/api/events.html#events_asynchronous_vs_synchronous
// "The EventEmitter calls all listeners synchronously in the order in which they were registered.
//  This ensures the proper sequencing of events and helps avoid race conditions and logic errors."
actionEmitter.on('action', action => {
  // The authoritatve enforcer. Guaranteed to be first in order.

  logger.write(`${JSON.stringify(action)}\n`)

  if (!isFSA(action)) {
    console.error(INVALID_ACTION_MSG)
    throw new Error(INVALID_ACTION_MSG)
  }
})



export default actionEmitter
