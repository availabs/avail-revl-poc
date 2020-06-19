import {
  ITERATE,
  NETWORK_REQUESTED,
  NETWORK_RECEIVED,
  GTFS_SHAPES_SELECTED,
  GTFS_SHAPES_SELECTED_RESET,
  NEXT,
  RETRIEVED_NETEDGE,
  MATCHED,
  CLOSE,
  CLOSED,
  DONE,
  RESTART,
} from "./constants";

export const iterateGtfsNetworkEdgeMatches = (meta) => {
  return {
    type: ITERATE,
    meta,
  };
};

export const requestGtfsNetwork = (meta = {}) => ({
  type: NETWORK_REQUESTED,
  meta,
});

export const sendNetwork = (network, meta = {}) => ({
  type: NETWORK_RECEIVED,
  payload: network,
  meta,
});

export const gtfsShapesSelected = (selectedGtfsShapes, meta = {}) => ({
  type: GTFS_SHAPES_SELECTED,
  payload: selectedGtfsShapes,
  meta,
});

export const gtfsShapesSelectedReset = (meta = {}) => ({
  type: GTFS_SHAPES_SELECTED_RESET,
  meta,
});

export const nextGtfsNetworkEdgeMatch = (meta = {}) => ({
  type: NEXT,
  meta,
});

export const retrievedGtfsNetworkEdge = (gtfsNetworkEdge, meta = {}) => ({
  type: RETRIEVED_NETEDGE,
  payload: { gtfsNetworkEdge },
  meta,
});

export const matchedGtfsNetworkEdge = (
  gtfsNetworkEdge,
  shstMatches,
  meta = {}
) => ({
  type: MATCHED,
  payload: { gtfsNetworkEdge, shstMatches },
  meta,
});

export const gtfsNetworkEdgeIteratorDone = (meta = {}) => ({
  type: DONE,
  meta,
});

export const closeGtfsNetworkEdgeIterator = (meta = {}) => ({
  type: CLOSE,
  meta,
});

export const gtfsNetworkEdgeIteratorClosed = (meta = {}) => ({
  type: CLOSED,
  meta,
});

export const restartGtfsNetworkEdgeIterator = (meta = {}) => ({
  type: RESTART,
  meta,
});
