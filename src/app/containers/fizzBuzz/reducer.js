// Redux Toolkit allows us to write "mutating" logic in reducers. It
// doesn't actually mutate the state because it uses the Immer library,
// which detects changes to a "draft state" and produces a brand new
// immutable state based off those changes
import {createSlice} from '@reduxjs/toolkit';

import {SLICE_NAME, INCREMENT_BY_AMOUNT, FIZZBUZZ_MESSAGE} from './constants'

export const fizzBuzzSlice = createSlice({
  name: SLICE_NAME,
  initialState: {
    count: 0,
    message: ''
  },

  // https://redux-toolkit.js.org/api/createslice#the-builder-callback-api-for-extrareducers
  extraReducers: builder => {
    builder.addCase(
      INCREMENT_BY_AMOUNT,
      (state, action) => {
        state.count += action.payload;
      })

    builder.addCase(
      FIZZBUZZ_MESSAGE,
      (state, {payload}) => {
        state.message = payload
      }
    )
  }
});

export default fizzBuzzSlice.reducer;
