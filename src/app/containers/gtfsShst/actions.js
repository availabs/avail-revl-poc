import {
  ITERATE,
  NEXT,
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

export const nextGtfsNetworkEdgeMatch = (meta = {}) => ({
  type: NEXT,
  meta,
});

export const matchedGtfsNetworkEdge = (match, meta = {}) => ({
  type: MATCHED,
  payload: match,
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
