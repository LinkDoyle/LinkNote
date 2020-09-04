export interface Element {
  tag: string;
  props: {
    children?: Element[];
    [name: string]: unknown;
  };
}

export function createElement(
  type: string,
  props?: unknown,
  ...children: Element[]
): Element {
  const element: Element = {
    tag: type,
    props: {
      children: children,
    },
  };

  return element;
}

export abstract class Component<
  P = Record<string, unknown>,
  S = Record<string, unknown>
> {
  private _props: P | Record<string, unknown> = {};
  private _state: S | Record<string, unknown> = {};
  abstract render(): Node | JSX.IntrinsicElements;
}
