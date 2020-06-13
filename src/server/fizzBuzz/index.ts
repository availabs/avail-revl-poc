import _ from 'lodash'

import {updateFizzBuzzMessage} from '../../app/containers/fizzBuzz/actions'
import {selectCount} from '../../app/containers/fizzBuzz/selectors'

import {STORE_CHANGE} from '../../app/store/revl/constants'

import actionEmitter from '../actionEmitter'

const id = 'server::fizzBuzz'

actionEmitter.subscribe(action => {
  // Don't echo action back to sender
  if (_.get(action, ['meta', '$source_id']) === id) {
    return
  }

  const {type, payload, meta: {$source_id}} = action

  switch (type) {
    case STORE_CHANGE: {
      const newCount = selectCount(payload)

      if (_.isNil(newCount)) {
        return
      }

      const fizzin = !(newCount % 3) ? 'fizz' : ''
      const buzzin = !(newCount % 5) ? 'buzz' : ''

      const message = `${fizzin}${buzzin}` || newCount
      const meta = {$source_id: id, $target_id: $source_id}

      const reaction = updateFizzBuzzMessage(message, meta)

      return actionEmitter.dispatch(reaction)
    }
    default:
  }
})

export default id
