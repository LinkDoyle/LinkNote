import "./index.css";
import React from "react";
import ReactDOM from "react-dom";
import { KeyCode } from "./utility";
import App from "./App";

window.addEventListener("keydown", (event: KeyboardEvent) => {
  if (event.keyCode == KeyCode.DOM_VK_BACK_SPACE) {
    event.preventDefault();
  }
});

window.onload = () => {
  ReactDOM.render(<App />, document.getElementById("root"));
};
