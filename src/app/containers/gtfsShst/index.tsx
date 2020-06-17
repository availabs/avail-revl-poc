import React from "react";
import { useSelector, useDispatch } from "react-redux";

import { nextGtfsNetworkEdgeMatch } from "./actions";
import { selectGtfsNetworkEdge, selectShstMatches } from "./selectors";

import styles from "./style.module.css";

import icon from "./images/plugin.png";

// Image from https://commons.wikimedia.org/wiki/File:Plug-in_Noun_project_4032.svg
export default function GtfsShstView() {
  const gtfsNetworkEdge = useSelector(selectGtfsNetworkEdge);
  const shstMatches = useSelector(selectShstMatches);

  const dispatch = useDispatch();

  console.log({ gtfsNetworkEdge, shstMatches });

  return (
    <div className="App">
      <header className="App-header">
        <img src={icon} alt="logo" />
        <div className={styles.row}>
          <button
            type="button"
            className={styles.button}
            aria-label="Send Next Match"
            onClick={() => dispatch(nextGtfsNetworkEdgeMatch())}
          >
            NEXT
          </button>
        </div>
      </header>
    </div>
  );
}
