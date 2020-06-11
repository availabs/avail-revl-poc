import React from "react";
import {
  Switch,
  Route,
  Link,
} from "react-router-dom";

import {useDispatch} from 'react-redux';

import {connect } from '@giantmachines/redux-websocket'

import { webSocketServerPort } from './config'

import ReduxDemo from './ReduxDemo'
import WebSocketDemo from './WebSocketDemo'

import './App.css';

export default function App() {
  const dispatch = useDispatch();

  dispatch(connect(`ws://localhost:${webSocketServerPort}`))

  return (
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/redux-demo">Redux Demo</Link>
            </li>
            <li>
              <Link to="/websocket-demo">WebSocket Demo</Link>
            </li>
          </ul>
        </nav>

        {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
        <Switch>
          <Route path="/redux-demo" component={ReduxDemo} />
          <Route path="/websocket-demo" component={WebSocketDemo} />
          <Route path="/" component={Home} />
        </Switch>
      </div>
  );
}

function Home() {
  return <h2>Home</h2>;
}
