import React, { ReactElement } from "react";

function DebugView(props: { children: ReactElement[] }): ReactElement {
  return <div className="editor-debug-view">{props.children}</div>;
}

export default DebugView;
