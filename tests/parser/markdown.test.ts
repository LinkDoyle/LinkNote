import { Parser } from "../../src/parser/markdown";

const parser = new Parser();
test("parser is not null", () => {
  expect(parser).not.toBeNull();
});
