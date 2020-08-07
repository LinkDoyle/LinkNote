import "./index.css";
import { DrawBoard } from "./drawing/DrawBoard";
console.log("Hello");

const drawBoardContainer = document.getElementById("draw-board");
if (drawBoardContainer) {
  const drawBoard = new DrawBoard(drawBoardContainer);
}
