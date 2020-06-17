// Modified https://github.com/react-boilerplate/react-boilerplate/blob/d19099afeff64ecfb09133c06c1cb18c0d40887e/app/reducers.js

/**
 * Combine all reducers in this file and export the combined reducers.
 */

import { combineReducers } from "redux";
import { connectRouter } from "connected-react-router";

import history from "../utils/history";

import fizzBuzzReducer, {
  fizzBuzzStoreSliceName,
} from "../containers/fizzBuzz/reducer";

import gtfsShstReducer, {
  gtfsShstStoreSliceName,
} from "../containers/gtfsShst/reducer";

/**
 * Merges the main reducer with the router state and dynamically injected reducers
 */
export default (injectedReducers = {}) =>
  combineReducers({
    [fizzBuzzStoreSliceName]: fizzBuzzReducer,
    [gtfsShstStoreSliceName]: gtfsShstReducer,
    router: connectRouter(history),
    ...injectedReducers,
  });
