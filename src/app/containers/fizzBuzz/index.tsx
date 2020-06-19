import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import { incrementByAmount } from "./actions";
import { selectCount, selectMessage } from "./selectors";

import styles from "./style.module.css";

import icon from "./images/plugin.png";

// Image from https://commons.wikimedia.org/wiki/File:Plug-in_Noun_project_4032.svg
export default function FizzBuzzView() {
  const count = useSelector(selectCount);
  const fizzBuzz = useSelector(selectMessage);

  const dispatch = useDispatch();

  const [incrementAmount, setIncrementAmount] = useState("2");

  return (
    <div className="App">
      <header className="App-header">
        <img src={icon} alt="logo" />
        <div className={styles.row}>
          <button
            type="button"
            className={styles.button}
            aria-label="Increment value"
            onClick={() => dispatch(incrementByAmount(1))}
          >
            +
          </button>
          <span className={styles.value}>{count}</span>
          <button
            type="button"
            className={styles.button}
            aria-label="Decrement value"
            onClick={() => dispatch(incrementByAmount(-1))}
          >
            -
          </button>
        </div>
        <div className={styles.row}>
          <input
            type="button"
            className={styles.textbox}
            aria-label="Set increment amount"
            value={incrementAmount}
            onChange={(e) => setIncrementAmount(e.target.value)}
          />
          <button
            type="button"
            className={styles.button}
            onClick={() =>
              dispatch(incrementByAmount(Number(incrementAmount) || 0))
            }
          >
            Add Amount
          </button>
          <span
            className={styles.value}
            style={{ position: "absolute", top: 200 }}
          >
            {fizzBuzz}
          </span>
        </div>
      </header>
    </div>
  );
}
