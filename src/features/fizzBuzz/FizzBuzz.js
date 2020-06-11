import React, {useState} from 'react';
import {useSelector, useDispatch} from 'react-redux';

import {
  incrementByAmount,
  selectCount,
  selectFizzBuzz,
} from './fizzBuzzSlice';

import styles from './FizzBuzz.module.css';

export function FizzBuzz() {
  const count = useSelector(selectCount);
  const fizzBuzz = useSelector(selectFizzBuzz)

  const dispatch = useDispatch();

  const [incrementAmount, setIncrementAmount] = useState('2');

  return (
    <div>
      <div className={styles.row}>
        <button
          className={styles.button}
          aria-label="Increment value"
          onClick={() => dispatch(incrementByAmount(1))}
        >
          +
        </button>
        <span className={styles.value}>{count}</span>
        <button
          className={styles.button}
          aria-label="Decrement value"
          onClick={() => dispatch(incrementByAmount(-1))}
        >
          -
        </button>
      </div>
      <div className={styles.row}>
        <input
          className={styles.textbox}
          aria-label="Set increment amount"
          value={incrementAmount}
          onChange={e => setIncrementAmount(e.target.value)}
        />
        <button
          className={styles.button}
          onClick={() =>
            dispatch(incrementByAmount(Number(incrementAmount) || 0))
          }
        >
          Add Amount
        </button>
        <span className={styles.value} style={{position: 'absolute', top: 200}}>{fizzBuzz}</span>
      </div>
    </div>
  );
}


