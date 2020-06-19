// Redux Toolkit allows us to write "mutating" logic in reducers. It
// doesn't actually mutate the state because it uses the Immer library,
// which detects changes to a "draft state" and produces a brand new
// immutable state based off those changes
import { createSlice } from "@reduxjs/toolkit";

import _ from "lodash";

import {
  SLICE_NAME,
  NETWORK_RECEIVED,
  MATCHED,
  GTFS_SHAPES_SELECTED,
  GTFS_SHAPES_SELECTED_RESET,
} from "./constants";

const initialState = {
  gtfsNetworkEdges: [],
  selectedGtfsShapes: [],
  gtfsNetworkEdge: null,
  shstMatches: null,
};

const getAllGtfsShapes = (gtfsNetworkEdges) =>
  Array.isArray(gtfsNetworkEdges)
    ? gtfsNetworkEdges
        .map((edge) => _.get(edge, ["properties", "shape_id"], null))
        .filter((shapeId) => shapeId)
    : [];

export const storeSlice = createSlice({
  name: SLICE_NAME,
  initialState,

  // https://redux-toolkit.js.org/api/createslice#the-builder-callback-api-for-extrareducers
  extraReducers: (builder) => {
    builder.addCase(
      NETWORK_RECEIVED,
      (state, { payload: gtfsNetworkEdges }) => {
        console.log(NETWORK_RECEIVED);
        state.gtfsNetworkEdges = gtfsNetworkEdges;
        state.selectedGtfsShapes = getAllGtfsShapes(state.gtfsNetworkEdges);
      }
    );

    builder.addCase(
      MATCHED,
      (state, { payload: { gtfsNetworkEdge, shstMatches } }) => {
        state.gtfsNetworkEdge = gtfsNetworkEdge;
        state.shstMatches = shstMatches;
      }
    );

    builder.addCase(
      GTFS_SHAPES_SELECTED,
      (state, { payload: selectedGtfsShapes }) => {
        state.selectedGtfsShapes = selectedGtfsShapes;
      }
    );

    builder.addCase(GTFS_SHAPES_SELECTED_RESET, (state) => {
      state.selectedGtfsShapes = getAllGtfsShapes(state.gtfsNetworkEdges);
    });
  },
});

export const gtfsShstStoreSliceName = SLICE_NAME;

export default storeSlice.reducer;
