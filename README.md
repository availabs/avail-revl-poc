# AVAIL Reactive Exploration and Visualization Loop (REVL) Proof of Concept

This project is a proof of concept.
It will very likely be scrapped for parts in the near future.

It is an attempt to extend the ideas in Mike Bostock's
[A Better Way to Code](https://medium.com/@mbostock/a-better-way-to-code-2b1d2876a3a0)
all the way to the server, replacing the notebook with one's dev environment.

It uses [Create React App](https://github.com/facebook/create-react-app)
to serve [hot](https://webpack.js.org/concepts/hot-module-replacement/) visualizations
during one's REPLing.
The Node WebSocket server can be used to interactively inspect datasources and codebases.

## Usage

You can set the WebSocket server port in the [config](src/config.js).

### To start the server

```bash
yarn startSocketServer
```

The server will write additional instructions to STDOUT once running.

### To start the client

```bash
yarn start
```

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits to either the browser code.
