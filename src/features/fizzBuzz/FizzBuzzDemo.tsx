import React from "react";
import plugin from './plugin.png'
import { FizzBuzz } from './FizzBuzz';

// Image from https://commons.wikimedia.org/wiki/File:Plug-in_Noun_project_4032.svg

export default function WebSocketDemo() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={plugin} alt="logo" />
        <FizzBuzz />
      </header>
    </div>
  );
}
