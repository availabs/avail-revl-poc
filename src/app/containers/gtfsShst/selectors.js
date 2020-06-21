import { createSelector } from "reselect";

import * as ss from "simple-statistics";
import * as turf from "@turf/turf";
import _ from "lodash";

import { SLICE_NAME } from "./constants";

export const selectGtfsNetworkEdges = (state) =>
  _.get(state, [SLICE_NAME, "gtfsNetworkEdges"], null);

export const getSelectedGtfsShapes = (state) =>
  _.get(state, [SLICE_NAME, "selectedGtfsShapes"], null);

export const getShstMatches = (state) =>
  _.get(state, [SLICE_NAME, "shstMatches"]);

// We'll need this for the shstMatches summary
// FIXME:
//   If shstMatches change for non-selected shapes,
//     the root shstMatches object reference will have changed,
//     causing an unnecessary recompute and rerenders.
//   Use createSelectorCreator to create a createSelector
//     that inspects whether shstMatches changed for
//     any of the selectedGtfsShapes.
//   See:
//     https://github.com/reduxjs/reselect#createselectorcreatormemoize-memoizeoptions
// export const getShstMatchesForSelectedGtfsShapes = () =>
// createSelector(
// [getSelectedGtfsShapes, getShstMatches],
// (selectedGtfsShapes, shstMatches) =>
// _.pickBy(
// shstMatches,
// (_$, shapeId) => !_.isEmpty(selectedGtfsShapes.includes(shapeId))
// )
// );

export const getGtfsShapeIds = createSelector(
  [selectGtfsNetworkEdges],
  (gtfsNetworkEdges) => {
    if (gtfsNetworkEdges === null) {
      return null;
    }

    const shapeIds = new Set();

    for (let i = 0; i < gtfsNetworkEdges.length; ++i) {
      const {
        properties: { shape_id },
      } = gtfsNetworkEdges[i];

      shapeIds.add(shape_id);
    }

    return [...shapeIds].sort();
  }
);

export const selectGtfsShapesSummary = createSelector(
  [selectGtfsNetworkEdges],
  (gtfsNetworkEdges) => {
    if (gtfsNetworkEdges === null) {
      return null;
    }

    const edgesByShape = gtfsNetworkEdges.reduce((acc, netEdge) => {
      const {
        properties: { shape_id },
      } = netEdge;

      acc[shape_id] = acc[shape_id] || [];

      acc[shape_id].push(netEdge);

      return acc;
    }, {});

    const summaryStatsByShape = _.mapValues(
      edgesByShape,
      (netEdges, shapeId) => {
        const count = netEdges.length;
        const avgLength = ss.mean(
          netEdges.map((netEdge) => turf.length(netEdge, { units: "miles" }))
        );

        return {
          shapeId,
          count,
          avgLength,
        };
      }
    );

    return summaryStatsByShape;
  }
);
