import Wenny from "./wenny";

interface Props {
  children?: [];
}

export function jsx(
  tag: string | (() => Wenny.Element),
  props: Props
): Wenny.Element {
  let element: Wenny.Element;
  if (typeof tag == "string") {
    element = {
      tag: tag,
      props: props,
    };
  } else {
    element = tag();
  }
  return element;
}

export function jsxs(
  tag: string | (() => Wenny.Element),
  props: Props
): Wenny.Element {
  return jsx(tag, props);
}
