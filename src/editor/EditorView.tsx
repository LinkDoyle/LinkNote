import { Wenny } from "../wenny";

export function EditorView(): Wenny.Element {
  return (
    <div class="editor-container">
      <div class="editor-line-number">
        {[1, 2, 3].map((v) => {
          return <div>{v}</div>;
        })}
      </div>
      <div class="editor-content">
        <div contenteditable="true">
          <div>Hello WennyEditor</div>
        </div>
      </div>
    </div>
  );
}
