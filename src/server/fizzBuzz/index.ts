import _ from 'lodash'

import {updateFizzBuzzMessage} from '../../containers/fizzBuzz/actions'

import actionEmitter from '../actionEmitter'

const FIZZBUZZ_NUM = 'FIZZBUZZ_NUM'

const id = 'fizzBuzz'

actionEmitter.on('action', action => {
  // Don't echo action back to sender
  if (_.get(action, ['meta', '$source_id']) === id) {
    return
  }

  const {type, payload, meta: {$source_id}} = action

  switch (type) {
    case FIZZBUZZ_NUM: {
      const fizzin = !(payload % 3) ? 'fizz' : ''
      const buzzin = !(payload % 5) ? 'buzz' : ''

      const message = `${fizzin}${buzzin}` || payload

      const reaction = updateFizzBuzzMessage(message, {$source_id: id, $target_id: $source_id})

      return actionEmitter.emit('action', reaction)
    }
    default:
  }
})

export default 'fizzBuzz'
