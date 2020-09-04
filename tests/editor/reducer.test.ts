import {
  useTextAreaReducer,
  TextRange,
  INSERT_TEXT,
  DELETE_TEXT,
  SET_TEXT,
  UPDATE_CARETS,
} from "../../src/editor/editorReducer";
import { renderHook, act } from "@testing-library/react-hooks";

describe("useTextAreaReducer", () => {
  describe("set text", () => {
    test("set empty text", () => {
      const { result } = renderHook(() => useTextAreaReducer());
      let [state, dispatch] = result.current;

      const text = "";
      act(() => {
        dispatch({
          type: SET_TEXT,
          text: text,
        });
      });

      [state, dispatch] = result.current;
      expect(state.lineNumbers.length).toEqual(1);
      expect(state.lines[0]).toBe("");
    });

    test("set one line texts", () => {
      const { result } = renderHook(() => useTextAreaReducer());
      let [state, dispatch] = result.current;

      const text = "Actions speak louder than words.";
      act(() => {
        dispatch({
          type: SET_TEXT,
          text: text,
        });
      });

      [state, dispatch] = result.current;
      expect(state.lineNumbers.length).toEqual(1);
      expect(state.lines[0]).toBe(text);
    });

    test("set multiline texts", () => {
      const { result } = renderHook(() => useTextAreaReducer());
      let [state, dispatch] = result.current;

      const text =
        "Actions speak louder than words.\nActions speak louder than words.\n";
      act(() => {
        dispatch({
          type: SET_TEXT,
          text: text,
        });
      });

      [state, dispatch] = result.current;
      expect(state.lineNumbers.length).toBe(3);
      expect(state.lines[0]).toBe("Actions speak louder than words.");
      expect(state.lines[1]).toBe("Actions speak louder than words.");
      expect(state.lines[2]).toBe("");
    });
  });

  describe("insert line", () => {
    test("insert text in the line", () => {
      const { result } = renderHook(() => useTextAreaReducer());
      let [state, dispatch] = result.current;

      const text = `Line1
Line2
`;
      act(() => {
        dispatch({
          type: SET_TEXT,
          text: text,
        });
      });

      [state, dispatch] = result.current;
      const oldLine = state.lines[0];
      const oldLength = state.lines.length;
      act(() => {
        dispatch({ type: INSERT_TEXT, line: 0, offset: 0, text: "Hello " });
      });

      [state, dispatch] = result.current;
      expect(state.lines.length).toEqual(oldLength);
      expect(state.lines.length).toEqual(state.lineNumbers.length);
      expect(state.lines[0]).toBe("Hello " + oldLine);
    });

    test("insert blank line", () => {
      const { result } = renderHook(() => useTextAreaReducer());
      const text = `Line1
Line2
`;
      let [state, dispatch] = result.current;
      act(() => {
        dispatch({
          type: SET_TEXT,
          text: text,
        });
      });

      [state, dispatch] = result.current;
      const oldLine = state.lines[0];
      const oldLength = state.lines.length;
      act(() => {
        dispatch({ type: INSERT_TEXT, line: 0, offset: 0, text: "\n" });
      });

      [state, dispatch] = result.current;
      expect(state.lines.length).toEqual(state.lineNumbers.length);
      expect(state.lines.length).toEqual(oldLength + 1);
      expect(state.lines[0]).toBe("");
      expect(state.lines[1]).toBe(oldLine);
    });
  });

  describe("delete line", () => {
    test("delete text in the line", () => {
      const { result } = renderHook(() => useTextAreaReducer());
      let [state, dispatch] = result.current;
      const text = `Line1
Line2
`;
      act(() => {
        dispatch({
          type: SET_TEXT,
          text: text,
        });
      });

      act(() => {
        dispatch({ type: DELETE_TEXT, ranges: new TextRange(0, 2) });
      });

      [state, dispatch] = result.current;
      expect(state.lineNumbers.length).toEqual(state.lines.length);
      expect(state.lines[0]).toBe("Lie1");
    });
  });

  describe("update carets", () => {
    test("in the range", () => {
      const { result } = renderHook(() => useTextAreaReducer());
      let [state, dispatch] = result.current;
      const text = `Line1
Line2
`;
      act(() => {
        dispatch({
          type: SET_TEXT,
          text: text,
        });
      });

      act(() => {
        dispatch({
          type: UPDATE_CARETS,
          carets: [{ line: 0, offset: 0 }],
        });
      });
      [state, dispatch] = result.current;
      expect(state.carets[0]).toStrictEqual({ line: 0, offset: 0 });

      act(() => {
        dispatch({
          type: UPDATE_CARETS,
          carets: [{ line: 2, offset: 0 }],
        });
      });
      [state, dispatch] = result.current;
      expect(state.carets[0]).toStrictEqual({ line: 2, offset: 0 });
    });
  });
});
