import _ from 'lodash'

import actionEmitter from '../actionEmitter'

const FIZZBUZZ_NUM = 'FIZZBUZZ_NUM'
const FIZZBUZZ_MSG = 'FIZZBUZZ_MSG'

const id = 'fizzBuzz'

actionEmitter.on('action', action => {
    // Don't echo action back to sender
    if (_.get(action, ['meta', '$source_id']) === id) {
        return
    }

    const { type, payload, meta: { $source_id } } = action

    switch (type) {
        case FIZZBUZZ_NUM: {
            const fizzin = !(payload % 3) ? 'fizz' : ''
            const buzzin = !(payload % 5) ? 'buzz' : ''

            const str = `${fizzin}${buzzin}` || payload

            const responseAction = { type: FIZZBUZZ_MSG, payload: str, meta: { $source_id: id, $target_id: $source_id } }

            return actionEmitter.emit('action', responseAction)
        }
        default:
    }
})

export default 'fizzBuzz'
