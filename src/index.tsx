import "./index.css";
import { DrawBoard } from "./drawing/DrawBoard";
import { WennyEditor } from "./editor/editor";
import EditorView from "./editor/view/EditorView";
import React from "react";
import ReactDOM from "react-dom";
import { KeyCode } from "./utility";

console.log("Hello");

window.addEventListener("keydown", (event: KeyboardEvent) => {
  if (event.keyCode == KeyCode.DOM_VK_BACK_SPACE) {
    event.preventDefault();
  }
});

window.onload = () => {
  let drawBoard: DrawBoard;
  let editor: WennyEditor;

  const drawboardButton = document.getElementById("sidebar-drawboard")!;
  const editorButton = document.getElementById("sidebar-editor")!;

  const drawboardPage = document.getElementById("content-drawboard")!;
  const editorPage = document.getElementById("content-editor")!;

  const pageList = [drawboardPage, editorPage];

  const activatePage = (page: HTMLElement) => {
    for (const p of pageList) {
      p.style.display = "none";
    }
    page.style.display = "block";
  };

  drawboardButton.onclick = (ev) => {
    activatePage(drawboardPage);
    if (!drawBoard) {
      drawBoard = new DrawBoard(drawboardPage);
    }
  };

  editorButton.onclick = (ev) => {
    activatePage(editorPage);
    ReactDOM.render(<EditorView />, editorPage);
  };

  editorButton.click();

  const sidebar = document.getElementsByClassName("sidebar")[0] as HTMLElement;
  const container = document.getElementsByClassName(
    "container"
  )[0] as HTMLDivElement;
};
