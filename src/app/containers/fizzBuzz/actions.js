import {INCREMENT_BY_AMOUNT, FIZZBUZZ_MESSAGE} from './constants'

export const incrementByAmount = (amount, meta = {}) => ({
  type: INCREMENT_BY_AMOUNT,
  payload: amount,
  meta
})

export const updateFizzBuzzMessage = (message, meta = {}) => ({
  type: FIZZBUZZ_MESSAGE,
  payload: message,
  meta
})
