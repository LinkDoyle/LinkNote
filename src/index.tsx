import "./index.css";
import React from "react";
import ReactDOM from "react-dom";
import { KeyCode } from "./utility";
import App from "./App";
import rootReducer from "./reducers";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";

const store = configureStore({
  reducer: rootReducer,
});

window.addEventListener("keydown", (event: KeyboardEvent) => {
  if (event.keyCode == KeyCode.DOM_VK_BACK_SPACE) {
    event.preventDefault();
  }
});

window.onload = () => {
  ReactDOM.render(
    <Provider store={store}>
      <App />
    </Provider>,
    document.getElementById("root")
  );
};
