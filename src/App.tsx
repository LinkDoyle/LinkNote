import React, { useRef } from "react";
import DrawBoard from "./drawing/view/DrawBoard";
import EditorView from "./editor/view/EditorView";

function App(): React.ReactElement {
  const drawboardPageRef = useRef<HTMLDivElement>(null);
  const editorPageRef = useRef<HTMLDivElement>(null);

  const activatePage = (pageId: number) => {
    const pageList = [drawboardPageRef.current, editorPageRef.current];
    for (const p of pageList) {
      if (p) {
        p.style.display = "none";
      }
    }
    const p = pageList[pageId];
    if (p) {
      p.style.display = "block";
    }
  };

  return (
    <>
      <h1>Yet Another Note</h1>
      <div className="container">
        <nav className="sidebar">
          <ul>
            <li id="sidebar-drawboard" className="sidebar-link">
              <a
                href="javascript:void(0)"
                onClick={() => {
                  activatePage(0);
                }}
              >
                DrawBoard
              </a>
            </li>
            <li id="sidebar-editor" className="sidebar-link">
              <a
                href="javascript:void(0)"
                onClick={() => {
                  activatePage(1);
                }}
              >
                NoteEditor
              </a>
            </li>
          </ul>
        </nav>
        <div className="content-container">
          <div
            className="content"
            ref={drawboardPageRef}
            style={{ display: "block" }}
          >
            <DrawBoard />
          </div>
          <div
            className="content"
            ref={editorPageRef}
            style={{ display: "none" }}
          >
            <EditorView />
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
