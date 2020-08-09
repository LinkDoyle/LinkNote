namespace Wenny {
  export interface Element {
    tag: string;
    props: {
      children?: Element[];
      [name: string]: any;
    };
  }

  export function createElement(
    type: string,
    props?: any,
    ...children: Element[]
  ): Element {
    let element: Element = {
      tag: type,
      props: {
        children: children,
      },
    };

    return element;
  }

  export abstract class Component<P = {}, S = {}> {
    private _props: P | {} = {};
    private _state: S | {} = {};
    abstract render(): Node | JSX.IntrinsicElements;
  }
}

export default Wenny;
