import {createSlice} from '@reduxjs/toolkit';

export const fizzBuzzSlice = createSlice({
  name: 'fizzBuzz',
  initialState: {
    value: 0,
    fizzBuzz: ''
  },
  reducers: {
    // Redux Toolkit allows us to write "mutating" logic in reducers. It
    // doesn't actually mutate the state because it uses the Immer library,
    // which detects changes to a "draft state" and produces a brand new
    // immutable state based off those changes
    _incrementByAmount: (state, action) => {
      state.value += action.payload;
    },
  },
  extraReducers: builder => {
    // https://redux-toolkit.js.org/api/createslice#the-builder-callback-api-for-extrareducers
    builder.addCase(
      'FIZZBUZZ_MSG', (state, {payload}) => {
        state.fizzBuzz = payload
      }
    )
  }
  ,
});

const {_incrementByAmount} = fizzBuzzSlice.actions;

export const selectCount = state => state.fizzBuzz.value;
export const selectFizzBuzz = ({fizzBuzz: {fizzBuzz}}) => fizzBuzz

export const incrementByAmount = amount => (dispatch, getState) => {
  dispatch(_incrementByAmount(amount))

  const count = selectCount(getState())

  dispatch({type: 'FIZZBUZZ_NUM', payload: count})
}

export default fizzBuzzSlice.reducer;
