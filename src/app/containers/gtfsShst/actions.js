import _ from "lodash";

import {
  GTFS_NETWORK_REQUESTED,
  GTFS_NETWORK_RECEIVED,
  GTFS_SHAPES_SELECTED,
  GTFS_SHAPES_SELECTED_RESET,
  SHST_MATCHES_REQUESTED,
  SHST_MATCHES_RECEIVED,
} from "./constants";

import { getShstMatches } from "./selectors";

const SHST_MATCHES_REQUEST_LIMIT = 5;

export const requestGtfsNetwork = (meta = {}) => (dispatch) =>
  dispatch({
    type: GTFS_NETWORK_REQUESTED,
    meta,
  });

export const gtfsNetworkReceived = (network, meta = {}) => (dispatch) =>
  dispatch({
    type: GTFS_NETWORK_RECEIVED,
    payload: network,
    meta,
  });

export const requestShstMatches = (gtfsShapesIds, meta = {}) => (
  dispatch,
  getState
) => {
  const shstMatches = getShstMatches(getState());

  const reqGtfsShapes =
    Array.isArray(gtfsShapesIds) && gtfsShapesIds.length > 0
      ? gtfsShapesIds.filter((shapeId) => _.isUndefined(shstMatches[shapeId]))
      : [];

  return reqGtfsShapes.length > 0
    ? dispatch({
        type: SHST_MATCHES_REQUESTED,
        payload: reqGtfsShapes,
        meta,
      })
    : Promise.resolve();
};

export const gtfsShapesSelected = (selectedGtfsShapes, meta = {}) => async (
  dispatch
) => {
  await dispatch({
    type: GTFS_SHAPES_SELECTED,
    payload: selectedGtfsShapes,
    meta,
  });

  if (Array.isArray(selectedGtfsShapes)) {
    if (selectedGtfsShapes.length <= SHST_MATCHES_REQUEST_LIMIT) {
      await dispatch(requestShstMatches(selectedGtfsShapes, meta));
    } else {
      console.warn(
        `SharedStreets matches requests limited to ${SHST_MATCHES_REQUEST_LIMIT} GTFS shapes.`
      );
    }
  }
};

export const gtfsShapesSelectedReset = (meta = {}) => (dispatch) =>
  dispatch({
    type: GTFS_SHAPES_SELECTED_RESET,
    meta,
  });

export const shstMatchesReceived = (shstMatches, meta = {}) => (dispatch) =>
  dispatch({
    type: SHST_MATCHES_RECEIVED,
    payload: shstMatches,
    meta,
  });
