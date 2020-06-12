import React from "react";
import {
  Switch,
  Route,
  Link,
} from "react-router-dom";

import FizzBuzz from './containers/fizzBuzz/index'

import './App.css';

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
          </ul>
        </nav>

        {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/websocket-demo" component={FizzBuzz} />
        </Switch>
      </div>
  );
}

function Home() {
  return <h2>Home</h2>;
}
