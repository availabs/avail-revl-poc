/* eslint-disable import/first, no-restricted-syntax, no-continue, no-loop-func */
import { join } from "path";

process.env.AVL_GTFS_CONFLATION_OUTPUT_DIR = join(
  __dirname,
  "../../managerie/gtfs-conflation-pipeline/output/cdta/"
);

import _ from "lodash";

import { NEXT, CLOSE } from "../../app/containers/gtfsShst/constants";

import {
  matchedGtfsNetworkEdge,
  gtfsNetworkEdgeIteratorDone,
  gtfsNetworkEdgeIteratorClosed,
} from "../../app/containers/gtfsShst/actions";

import actionEmitter from "../actionEmitter";

import GtfsNetworkDAOFactory from "../../managerie/gtfs-conflation-pipeline/src/daos/GtfsNetworkDAOFactory";

import { matchSegmentedShapeFeatures } from "../../managerie/gtfs-conflation-pipeline/src/daos/GtfsOsmNetworkDaoFactory/GtfsOsmNetworkDAO/SharedStreetsMatcher";

const id = "server::gtfsShst";

async function* matchesIter() {
  const gtfsNetworkDAO = GtfsNetworkDAOFactory.getDAO();

  const gtfsNetworkIter = gtfsNetworkDAO.makeShapeSegmentsIterator();

  const networkEdges: Array<any> = [];
  let networkEdgesSorted: any;

  function* tap() {
    for (const edge of gtfsNetworkIter) {
      networkEdges.push(edge);
      networkEdgesSorted = false;
      yield edge;
    }
  }

  let prevNetEdge: any = null;
  const shstMatches: any[] = [];

  // matchSegmentedShapeFeatures returns the batched matches sorted by networkEdge ID
  for await (const { matchFeature } of matchSegmentedShapeFeatures(tap())) {
    if (!networkEdgesSorted) {
      networkEdges.sort((a: any, b: any) => a.id.localeCompare(b.id)).reverse(); // so we can use pop rather than unshift
      networkEdgesSorted = true;
      prevNetEdge = networkEdges.pop();
    }

    const {
      properties: { pp_id: netEdgeId },
    } = matchFeature;

    while (netEdgeId !== prevNetEdge.id) {
      yield {
        gtfsNetworkEdge: prevNetEdge,
        shstMatches: shstMatches.length ? shstMatches : null,
      };

      shstMatches.length = 0;
      prevNetEdge = networkEdges.pop();
    }

    shstMatches.push(matchFeature);
  }

  if (prevNetEdge) {
    yield { gtfsNetworkEdge: prevNetEdge, shstMatches };
  }

  let unmatchedEdge = networkEdges.pop();
  while (unmatchedEdge) {
    yield { gtfsNetworkEdge: unmatchedEdge, shstMatches: null };
    unmatchedEdge = networkEdges.pop();
  }
}

const matchesIterators = {};

const returnIterator = (iter: any) => {
  try {
    // https://github.com/JoshuaWise/better-sqlite3/issues/78#issuecomment-342001014
    iter.return();
  } catch (err) {
    //
  }
};

const dispatchNoSourceError = () =>
  actionEmitter.dispatch({
    type: "ERROR",
    payload: new Error("No $source_id in action metadata"),
    error: true,
    meta: { $source_id: id },
  });

actionEmitter.subscribe(async (action) => {
  // Don't echo action back to sender
  if (_.get(action, ["meta", "$source_id"]) === id) {
    return null;
  }

  const {
    type,
    meta: { $source_id },
  } = action;

  const reactionMeta = {
    $source_id: id,
    $target_id: $source_id,
  };

  switch (type) {
    case NEXT: {
      if (!$source_id) {
        return dispatchNoSourceError();
      }

      if (!matchesIterators[$source_id]) {
        matchesIterators[$source_id] = matchesIter();
      }

      const { value: matchedNetEdge, done } = await matchesIterators[
        $source_id
      ].next();

      if (done) {
        returnIterator(matchesIterators[$source_id]);
        delete matchesIterators[$source_id];

        const reaction = gtfsNetworkEdgeIteratorDone(reactionMeta);
        return actionEmitter.dispatch(reaction);
      }

      const reaction = matchedGtfsNetworkEdge(matchedNetEdge, reactionMeta);

      return actionEmitter.dispatch(reaction);
    }

    case CLOSE: {
      if (!$source_id) {
        return dispatchNoSourceError();
      }

      if (matchesIterators[$source_id]) {
        returnIterator(matchesIterators[$source_id]);
      }

      returnIterator(matchesIterators[$source_id]);
      delete matchesIterators[$source_id];

      const reaction = gtfsNetworkEdgeIteratorClosed(reactionMeta);
      return actionEmitter.dispatch(reaction);
    }
    default:
      return null;
  }
});

export default id;
