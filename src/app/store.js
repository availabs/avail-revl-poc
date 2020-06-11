import {createBrowserHistory} from 'history'
import {configureStore, getDefaultMiddleware} from '@reduxjs/toolkit';
import {connectRouter, routerMiddleware} from 'connected-react-router'

import counterReducer from '../features/counter/counterSlice';

export const history = createBrowserHistory()

export default configureStore({
  reducer: {
    router: connectRouter(history),
    counter: counterReducer,
  },
  middleware: [routerMiddleware(history), ...getDefaultMiddleware()]
});
