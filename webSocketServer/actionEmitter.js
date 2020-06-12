import EventEmitter from 'events'

import {isFSA} from 'flux-standard-action'

export const INVALID_ACTION_MSG = 'Action is not valid a Flux Standard Action.'

const actionEmitter = new EventEmitter()

// https://nodejs.org/api/events.html#events_asynchronous_vs_synchronous
// "The EventEmitter calls all listeners synchronously in the order in which they were registered.
//  This ensures the proper sequencing of events and helps avoid race conditions and logic errors."
actionEmitter.on('action', action => {
  // The authoritatve enforcer. Guaranteed to be first in order.

  console.log(JSON.stringify(action, null, 4))
  if (!isFSA(action)) {
    console.error(INVALID_ACTION_MSG)
    throw new Error(INVALID_ACTION_MSG)
  }
})



export default actionEmitter
