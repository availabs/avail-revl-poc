// Redux Toolkit allows us to write "mutating" logic in reducers. It
// doesn't actually mutate the state because it uses the Immer library,
// which detects changes to a "draft state" and produces a brand new
// immutable state based off those changes
import { createSlice } from "@reduxjs/toolkit";

import _ from "lodash";

import {
  SLICE_NAME,
  GTFS_NETWORK_RECEIVED,
  GTFS_SHAPES_SELECTED,
  SHST_MATCHES_REQUESTED,
  SHST_MATCHES_RECEIVED,
  GTFS_SHAPES_SELECTED_RESET,
} from "./constants";

const initialState = {
  gtfsNetworkEdges: [],
  selectedGtfsShapes: [],
  // { <pp_shape_id>: { <pp_shape_index>: [...matchFeatures ordered by <pp_match_index>] } }
  shstMatches: {},
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
      GTFS_NETWORK_RECEIVED,
      (state, { payload: gtfsNetworkEdges }) => {
        state.gtfsNetworkEdges = gtfsNetworkEdges;
        state.selectedGtfsShapes = getAllGtfsShapes(state.gtfsNetworkEdges);
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

    builder.addCase(
      SHST_MATCHES_REQUESTED,
      (state, { payload: requestedGtfsShapes }) => {
        if (!Array.isArray(requestedGtfsShapes)) {
          throw new Error("gtfsShapes must be an Array");
        }

        for (let i = 0; i < requestedGtfsShapes.length; ++i) {
          const shapeId = requestedGtfsShapes[i];

          // setting to null signifies request in progress, do not send again
          state.shstMatches[shapeId] = state.shstMatches[shapeId] || null;
        }
      }
    );

    builder.addCase(
      SHST_MATCHES_RECEIVED,
      (state, { payload: shstMatches }) => {
        if (!_.isEmpty(shstMatches)) {
          _.merge(state.shstMatches, shstMatches);
        }
      }
    );
  },
});

export const gtfsShstStoreSliceName = SLICE_NAME;

export default storeSlice.reducer;
