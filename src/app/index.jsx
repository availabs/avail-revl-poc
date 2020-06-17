import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { ConnectedRouter } from "connected-react-router";

import { ThemeProvider } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";

import store from "./store";
import App from "./App";

import history from "./utils/history";

import * as serviceWorker from "./serviceWorker";
import theme from "./theme";

// https://material-ui.com/getting-started/installation/#roboto-font
// https://material-ui.com/components/typography/#general
import "fontsource-roboto";

// https://github.com/mui-org/material-ui/blob/master/examples/create-react-app/src/index.js
ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      {/* https://material-ui.com/components/css-baseline/#global-reset */}
      <CssBaseline />
      <Provider store={store}>
        <ConnectedRouter history={history}>
          <App />
        </ConnectedRouter>
      </Provider>
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

export default null;
