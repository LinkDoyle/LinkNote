import React, { ReactElement, useRef, useEffect } from "react";
import "./DrawBoard.css";
import DrawBoardContext, {
  useDrawBoardReducer,
  END_DRAWING,
  DRAW,
  BEGIN_DRAWING,
  SET_CONTEXT,
} from "../DrawBoardContext";
import ToolBar from "./Toolbar";

function DrawBoard(): ReactElement {
  const [state, dispatch] = useDrawBoardReducer();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    dispatch({
      type: SET_CONTEXT,
      context: canvasRef.current?.getContext("2d"),
    });
    return () => {
      dispatch({
        type: SET_CONTEXT,
        context: undefined,
      });
    };
  }, [canvasRef, dispatch]);
  const processPointerBegin = (ev: React.PointerEvent<HTMLCanvasElement>) => {
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      const [offsetX, offsetY] = [
        ev.nativeEvent.offsetX,
        ev.nativeEvent.offsetY,
      ];
      dispatch({
        type: BEGIN_DRAWING,
        ctx: ctx,
        pointerId: ev.pointerId,
        pointerType: ev.pointerType,
        offsetX: offsetX,
        offsetY: offsetY,
      });
    }
  };

  const processPointerMoving = (ev: React.PointerEvent<HTMLCanvasElement>) => {
    if (!state.isDrawing) {
      return;
    }
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) {
      return;
    }
    const [offsetX, offsetY] = [ev.nativeEvent.offsetX, ev.nativeEvent.offsetY];
    dispatch({
      type: DRAW,
      ctx: ctx,
      pointerId: ev.pointerId,
      pointerType: ev.pointerType,
      offsetX: offsetX,
      offsetY: offsetY,
    });
  };

  const processPointerEnd = (ev: React.PointerEvent<HTMLCanvasElement>) => {
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      const [offsetX, offsetY] = [
        ev.nativeEvent.offsetX,
        ev.nativeEvent.offsetY,
      ];
      dispatch({
        type: END_DRAWING,
        ctx: ctx,
        offsetX: offsetX,
        offsetY: offsetY,
      });
    }
  };

  return (
    <DrawBoardContext.Provider value={{ state: state, dispatch: dispatch }}>
      <div className="drawboard-container">
        <ToolBar />
        <div className="drawboard-wrapper">
          <canvas
            ref={canvasRef}
            className="drawboard-canvas"
            width="800"
            height="600"
            onPointerDown={processPointerBegin}
            onPointerMove={processPointerMoving}
            onPointerUp={processPointerEnd}
          ></canvas>
        </div>
      </div>
    </DrawBoardContext.Provider>
  );
}

export default DrawBoard;
