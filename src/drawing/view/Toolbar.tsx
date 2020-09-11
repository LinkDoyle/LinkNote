import React, { ReactElement, useContext } from "react";
import "./DrawBoard.css";
import DrawBoardContext, { UNDO, REDO, CLEAR } from "../DrawBoardContext";

export default function ToolBar(): ReactElement {
  const { state, dispatch } = useContext(DrawBoardContext);

  const handlePenClick = (): void => {
    // TODO
  };
  const handleInsertClick = (): void => {
    // TODO
  };
  const handleSelectClick = (): void => {
    // TODO
  };
  const handleEraseClick = (): void => {
    // TODO
  };

  const handleColorClick = (): void => {
    // TODO
  };
  const handleLineWidthClick = (): void => {
    // TODO
  };
  const handleUndoClick = (): void => {
    dispatch({ type: UNDO });
  };
  const handleRedoClick = (): void => {
    dispatch({ type: REDO });
  };
  const handleClearClick = (): void => {
    dispatch({ type: CLEAR });
  };

  return (
    <div className="drawboard-toolbar">
      <input
        type="radio"
        name="drawboard-mode"
        id="drawboard-pen"
        className="drawboard-radio drawboard-pen"
        defaultChecked={true}
      />
      <label htmlFor="drawboard-pen">Pen</label>
      <input
        type="radio"
        name="drawboard-mode"
        id="drawboard-insert"
        className="drawboard-radio drawboard-insert"
      />
      <label htmlFor="drawboard-insert">Insert</label>
      <input
        type="radio"
        name="drawboard-mode"
        id="drawboard-select"
        className="drawboard-radio drawboard-select"
      />
      <label htmlFor="drawboard-select">Select</label>
      <input
        type="radio"
        name="drawboard-mode"
        id="drawboard-erase"
        className="drawboard-radio drawboard-erase"
      />
      <label htmlFor="drawboard-erase">Erase</label>
      <button
        className="drawboard-button drawboard-color"
        onClick={handleColorClick}
      >
        Color
      </button>
      <button
        className="drawboard-button drawboard-linewidth"
        onClick={handleLineWidthClick}
      >
        LineWidth
      </button>
      <button
        className="drawboard-button drawboard-undo"
        onClick={handleUndoClick}
        disabled={!state.history.cmdUndoAvailable}
      >
        Undo
      </button>
      <button
        className="drawboard-button drawboard-redo"
        onClick={handleRedoClick}
        disabled={!state.history.cmdRedoAvailable}
      >
        Redo
      </button>
      <button
        className="drawboard-button drawboard-clear"
        onClick={handleClearClick}
      >
        Clear
      </button>
    </div>
  );
}
