import _ from "lodash";

import { SLICE_NAME } from "./constants";

export const selectGtfsNetworkEdge = (state) =>
  _.get(state, [SLICE_NAME, "gtfsNetworkEdge"], null);

export const selectShstMatches = (state) =>
  _.get(state, [SLICE_NAME, "shstMatches"], null);
