import Wenny from "./wenny";

export function render(element: Wenny.Element, container: HTMLElement): void {
  const node = document.createElement(element.tag);
  for (const name in element.props) {
    if (name === "children") {
      break;
    }
    node.setAttribute(name, element.props[name]);
  }
  console.log(element.props.children);
  element.props.children?.map((e) => render(e, node));
  // console.log(container);
  // console.log(element);
  container.append(node);
}

export default WennyDOM;
