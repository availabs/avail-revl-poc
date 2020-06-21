/* eslint-disable import/first, no-restricted-syntax, no-continue, no-loop-func, no-await-in-loop */
import { join } from "path";

process.env.AVL_GTFS_CONFLATION_OUTPUT_DIR = join(
  __dirname,
  "../../managerie/gtfs-conflation-pipeline/output/cdta/"
);

import _ from "lodash";

import {
  GTFS_NETWORK_REQUESTED,
  SHST_MATCHES_REQUESTED,
} from "../../app/containers/gtfsShst/constants";

import {
  gtfsNetworkReceived,
  shstMatchesReceived,
} from "../../app/containers/gtfsShst/actions";

import actionEmitter from "../actionEmitter";

import GtfsNetworkDaoFactory from "../../managerie/gtfs-conflation-pipeline/src/daos/GtfsNetworkDAOFactory";
import GtfsOsmNetworkDaoFactory from "../../managerie/gtfs-conflation-pipeline/src/daos/GtfsOsmNetworkDaoFactory";

const id = "server::gtfsShst";

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
    payload,
    meta: { $source_id },
  } = action;

  if (!$source_id) {
    return dispatchNoSourceError();
  }

  const reactionMeta = {
    $source_id: id,
    $target_id: $source_id,
  };

  if (type === GTFS_NETWORK_REQUESTED) {
    console.log(GTFS_NETWORK_REQUESTED);
    const gtfsNetworkDAO = GtfsNetworkDaoFactory.getDAO();

    const network = gtfsNetworkDAO.getNetwork();

    console.log(network.length);
    gtfsNetworkReceived(network, reactionMeta)(actionEmitter.dispatch);
  }

  if (type === SHST_MATCHES_REQUESTED) {
    console.log(SHST_MATCHES_REQUESTED);

    const gtfsOsmNetworkDAO = GtfsOsmNetworkDaoFactory.getDAO();

    const requestedGtfsShapes = payload;

    const shstMatches = gtfsOsmNetworkDAO.getShstMatchesForShapes(
      requestedGtfsShapes
    );

    shstMatchesReceived(shstMatches, reactionMeta)(actionEmitter.dispatch);
  }

  return null;
});

export default id;
