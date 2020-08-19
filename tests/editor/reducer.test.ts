import { useTextAreaReducer, TextRange } from "../../src/editor/editorReducer";
import { renderHook, act } from "@testing-library/react-hooks";

describe("useTextAreaReducer", () => {
  describe("insert line", () => {
    test("insert text in the line", () => {
      const { result } = renderHook(() => useTextAreaReducer());

      let [state, dispatch] = result.current;
      const oldLine = state.lines[0];
      act(() => {
        dispatch({ type: "insert", line: 0, offset: 0, text: "Hello " });
      });

      [state, dispatch] = result.current;
      expect(state.lineNumbers.length).toEqual(state.lines.length);
      expect(state.lines[0]).toBe("Hello " + oldLine);
    });
    test("insert blank line", () => {
      const { result } = renderHook(() => useTextAreaReducer());

      let [state, dispatch] = result.current;
      const oldLine = state.lines[0];
      const oldLineNumbersLength = state.lineNumbers.length;
      act(() => {
        dispatch({ type: "insert", line: 0, offset: 0, text: "\n" });
      });

      [state, dispatch] = result.current;
      expect(state.lineNumbers.length).toEqual(state.lines.length);
      expect(state.lineNumbers.length).toEqual(oldLineNumbersLength + 1);
      console.log(state.lines);
      expect(state.lines[0]).toBe("");
      expect(state.lines[1]).toBe(oldLine);
    });
  });

  describe("delete line", () => {
    test("delete text in the line", () => {
      const { result } = renderHook(() => useTextAreaReducer());

      let [state, dispatch] = result.current;
      const oldLine = state.lines[0];
      act(() => {
        dispatch({ type: "delete", ranges: new TextRange(1, 2) });
      });

      [state, dispatch] = result.current;
      expect(state.lineNumbers.length).toEqual(state.lines.length);
      expect(state.lines[0]).toBe("Hello " + oldLine);
    });
  });
});
