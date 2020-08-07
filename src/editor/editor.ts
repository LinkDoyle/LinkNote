import editorTemplateString from "./editor.html";
import "./editor.css";

export class WennyEditor {
  private _container: Element;

  /**
   * @param container container to host `WennyEditor`
   */
  constructor(container: Element) {
    const template = document.createElement("template");
    template.innerHTML = editorTemplateString;
    if (!template.content.firstElementChild) {
      throw Error("Failed to parse DrawBoard template.");
    }

    this._container = template.content.firstElementChild;
    container.appendChild(this._container);
    container = this._container;
  }
}
