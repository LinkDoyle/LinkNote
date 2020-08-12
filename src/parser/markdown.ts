export class Element {}
export class Span {}
export class Line {}
export class Header {}

export class Block {}
export class Paragraph {}
export class FormulaBlock {}
export class CodeBlock {
  private _language: string;
  /**
   *
   */
  constructor() {
    this._language = "";
  }

  public get language(): string {
    return this._language;
  }
}
export class List {}
export class ListItem {}
export class Table {}
export class Image {}

export class NativeHTML {}
export class CustomElement {}
export class ExtensionElement {}

export class Document {}

export class Parser {
  /**
   * parse
   */
  public parse(markdown: string): Document {
    let document = new Document();

    return document;
  }
}
