import { createSelector } from "reselect";
import * as ss from "simple-statistics";
import * as turf from "@turf/turf";
import _ from "lodash";

import { SLICE_NAME } from "./constants";

export const selectGtfsNetworkEdges = (state) =>
  _.get(state, [SLICE_NAME, "gtfsNetworkEdges"], null);

export const selectGtfsNetworkEdge = (state) =>
  _.get(state, [SLICE_NAME, "gtfsNetworkEdge"], null);

export const selectShstMatches = (state) =>
  _.get(state, [SLICE_NAME, "shstMatches"], null);

export const getSelectedGtfsShapes = (state) =>
  _.get(state, [SLICE_NAME, "selectedGtfsShapes"], null);

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
