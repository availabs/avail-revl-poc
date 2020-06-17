// Redux Toolkit allows us to write "mutating" logic in reducers. It
// doesn't actually mutate the state because it uses the Immer library,
// which detects changes to a "draft state" and produces a brand new
// immutable state based off those changes
import { createSlice } from "@reduxjs/toolkit";

import { SLICE_NAME, MATCHED } from "./constants";

export const storeSlice = createSlice({
  name: SLICE_NAME,
  initialState: {
    gtfsNetworkEdge: null,
    shstMatches: null,
  },

  // https://redux-toolkit.js.org/api/createslice#the-builder-callback-api-for-extrareducers
  extraReducers: (builder) => {
    builder.addCase(
      MATCHED,
      (state, { payload: { gtfsNetworkEdge, shstMatches } }) => {
        state.gtfsNetworkEdge = gtfsNetworkEdge;
        state.shstMatches = shstMatches;
      }
    );
  },
});

export const gtfsShstStoreSliceName = SLICE_NAME;

export default storeSlice.reducer;
