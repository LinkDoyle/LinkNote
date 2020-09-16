import React, { ReactElement } from "react";
import "./DrawBoard.css";
import { useSelector } from "react-redux";
import { RootState } from "../../reducers";

interface ToolBarProps {
  onUndoClick?: () => void;
  onRedoClick?: () => void;
  onClearClick?: () => void;
}

export default function ToolBar({
  onUndoClick,
  onRedoClick,
  onClearClick,
}: ToolBarProps): ReactElement {
  const { cmdUndoAvailable, cmdRedoAvailable } = useSelector(
    (state: RootState) => state.drawing.history
  );

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

  return (
    <div className="drawboard-toolbar">
      <input
        type="radio"
        name="drawboard-mode"
        id="drawboard-pen"
        className="drawboard-radio drawboard-pen"
        defaultChecked={true}
        onClick={() => handlePenClick()}
      />
      <label htmlFor="drawboard-pen">Pen</label>
      <input
        type="radio"
        name="drawboard-mode"
        id="drawboard-insert"
        className="drawboard-radio drawboard-insert"
        onClick={() => handleInsertClick()}
      />
      <label htmlFor="drawboard-insert">Insert</label>
      <input
        type="radio"
        name="drawboard-mode"
        id="drawboard-select"
        className="drawboard-radio drawboard-select"
        onClick={() => handleSelectClick()}
      />
      <label htmlFor="drawboard-select">Select</label>
      <input
        type="radio"
        name="drawboard-mode"
        id="drawboard-erase"
        className="drawboard-radio drawboard-erase"
        onClick={() => handleEraseClick()}
      />
      <label htmlFor="drawboard-erase">Erase</label>
      <button
        className="drawboard-button drawboard-color"
        onClick={() => handleColorClick()}
      >
        Color
      </button>
      <button
        className="drawboard-button drawboard-linewidth"
        onClick={() => handleLineWidthClick()}
      >
        LineWidth
      </button>
      <button
        className="drawboard-button drawboard-undo"
        onClick={() => onUndoClick?.()}
        disabled={!cmdUndoAvailable}
      >
        Undo
      </button>
      <button
        className="drawboard-button drawboard-redo"
        onClick={() => onRedoClick?.()}
        disabled={!cmdRedoAvailable}
      >
        Redo
      </button>
      <button
        className="drawboard-button drawboard-clear"
        onClick={() => onClearClick?.()}
      >
        Clear
      </button>
    </div>
  );
}
