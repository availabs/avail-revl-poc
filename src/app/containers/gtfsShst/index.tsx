import React from "react";
import { useSelector, useDispatch } from "react-redux";

import Button from "@material-ui/core/Button";
import { nextGtfsNetworkEdgeMatch } from "./actions";
import { selectGtfsNetworkEdge, selectShstMatches } from "./selectors";

// Image from https://commons.wikimedia.org/wiki/File:Plug-in_Noun_project_4032.svg
export default function GtfsShstView() {
  const gtfsNetworkEdge = useSelector(selectGtfsNetworkEdge);
  const shstMatches = useSelector(selectShstMatches);

  const dispatch = useDispatch();

  console.log({ gtfsNetworkEdge, shstMatches });

  return (
    <Button
      variant="contained"
      color="primary"
      onClick={() => dispatch(nextGtfsNetworkEdgeMatch())}
    >
      NEXT
    </Button>
  );
}
