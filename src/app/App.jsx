import React from "react";
import { Switch, Route, Link } from "react-router-dom";

import FizzBuzz from "./containers/fizzBuzz/index";
import GtfsShst from "./containers/gtfsShst/index";

import "./App.css";

function Home() {
  return <h2>Home</h2>;
}

export default function App() {
  return (
    <div>
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/websocket-demo">WebSocket Demo</Link>
          </li>
          <li>
            <Link to="/gtfs-shst">GTFS SharedStreets Matching</Link>
          </li>
        </ul>
      </nav>

      {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
      <Switch>
        <Route exact path="/" component={Home} />
        <Route exact path="/websocket-demo" component={FizzBuzz} />
        <Route exact path="/gtfs-shst" component={GtfsShst} />
      </Switch>
    </div>
  );
}
