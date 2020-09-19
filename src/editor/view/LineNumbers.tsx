import React, { ReactElement } from "react";
interface Props {
  lineNumbers: number[];
}
const LineNumberContainer = ({ lineNumbers }: Props): ReactElement => {
  return (
    <div className="editor-line-numbers">
      {lineNumbers.map((value, index) => {
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
