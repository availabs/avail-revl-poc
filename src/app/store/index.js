import { configureStore, } from '@reduxjs/toolkit';

import createReducer from './reducers'
import middleware from './middlewares'

const store = configureStore({
    reducer: createReducer(),
    middleware
})

// https://github.com/react-boilerplate/react-boilerplate/blob/d19099afeff64ecfb09133c06c1cb18c0d40887e/app/configureStore.js#L50
// Make reducers hot reloadable, see http://mxs.is/googmo
if (module.hot) {
    module.hot.accept('./reducers', () => {
        store.replaceReducer(createReducer(store.injectedReducers));
    });
}

export default store
