import React, { ReactElement } from "react";

const LineNumberContainer = (props: {
  lineNumbers: number[];
}): ReactElement => {
  return (
    <div className="editor-line-numbers">
      {props.lineNumbers.map((value, index) => {
        return (
          <div className="editor-line-number" key={index}>
            {value}
          </div>
        );
      })}
    </div>
  );
};

export default LineNumberContainer;
