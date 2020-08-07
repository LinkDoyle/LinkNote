import drawBoardTemplateString from "./DrawBoard.html";
import "./DrawBoard.css";

interface Point {
  x: number;
  y: number;
}

interface Command {
  /**
   * draw
   */
  execute(ctx: CanvasRenderingContext2D): void;
  save(): object;
  load(state: object): void;
}

class PenCommand implements Command {
  private _lineWidth: number;
  private _color: string;
  private _track: Point[];
  /**
   *
   */
  constructor(lineWidth: number, color: string, track: Point[]) {
    this._lineWidth = lineWidth;
    this._color = color;
    this._track = track;
  }

  execute(ctx: CanvasRenderingContext2D): void {
    if (this._track.length === 0) {
      return;
    }
    ctx.save();
    ctx.lineWidth = this._lineWidth;
    ctx.strokeStyle = this._color;
    if (this._track.length === 1) {
      const { x, y } = this._track[0];
      ctx.moveTo(x, y);
      ctx.stroke();
    } else {
      ctx.beginPath();
      for (let i = 0; i < this._track.length - 1; ++i) {
        const { x: x0, y: y0 } = this._track[i];
        ctx.moveTo(x0, y0);
        const { x: x1, y: y1 } = this._track[i + 1];
        ctx.lineTo(x1, y1);
      }
      ctx.closePath();
      ctx.stroke();
    }
    ctx.restore();
  }

  save(): object {
    throw new Error("Method not implemented.");
  }

  load(state: object) {
    const { lineWidth, color, track } = state as {
      lineWidth: number;
      color: string;
      track: Point[];
    };
    [this._lineWidth, this._color, this._track] = [lineWidth, color, track];
  }
}

class TextCommand implements Command {
  execute(ctx: CanvasRenderingContext2D): void {
    throw new Error("Method not implemented.");
  }
  save(): object {
    throw new Error("Method not implemented.");
  }
  load(state: object): void {
    throw new Error("Method not implemented.");
  }
}

class ImageCommand implements Command {
  execute(ctx: CanvasRenderingContext2D): void {
    throw new Error("Method not implemented.");
  }
  save(): object {
    throw new Error("Method not implemented.");
  }
  load(state: object): void {
    throw new Error("Method not implemented.");
  }
}

class ClearCommand implements Command {
  execute(ctx: CanvasRenderingContext2D): void {
    ctx?.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }
  save(): object {
    throw new Error("Method not implemented.");
  }
  load(state: object): void {
    throw new Error("Method not implemented.");
  }
}

enum Mode {
  PenDrawing,
  Text,
  Select,
  Erase,
}

class DrawBoardStorage {
  public save() {
    throw new Error("Method not implemented.");
  }

  public load() {
    throw new Error("Method not implemented.");
  }
}

export class DrawBoard {
  private readonly _container: Element;
  private readonly _canvas: HTMLCanvasElement;
  private readonly _cmdPen: HTMLInputElement;
  private readonly _cmdInsert: HTMLInputElement;
  private readonly _cmdSelect: HTMLInputElement;
  private readonly _cmdErase: HTMLInputElement;
  private readonly _cmdColor: HTMLButtonElement;
  private readonly _cmdLineWidth: HTMLButtonElement;
  private readonly _cmdUndo: HTMLButtonElement;
  private readonly _cmdRedo: HTMLButtonElement;
  private readonly _cmdClear: HTMLButtonElement;

  private _mode: Mode = Mode.PenDrawing;
  public get mode(): Mode {
    return this._mode;
  }
  public set mode(v: Mode) {
    this._mode = v;
  }
  public get eraseMode(): boolean {
    return this._mode === Mode.Erase;
  }

  public set eraseMode(enabled: boolean) {
    this._mode = enabled ? Mode.Erase : Mode.PenDrawing;
  }

  private _isDrawing: boolean;
  private _currentPointerId?: number;

  private _history: Command[] = [];
  private _historyCurrentIndex: number = -1;
  /**
   * record
   */
  private record(command: Command) {
    this._history[++this._historyCurrentIndex] = command;
    // erase history after current index
    this._history.length = this._historyCurrentIndex + 1;
    this._cmdUndo.disabled = false;
    this._cmdRedo.disabled = true;
  }

  /**
   * undo
   */
  public undo() {
    if (this._historyCurrentIndex >= 0) {
      this._historyCurrentIndex -= 1;
    }
    const ctx = this._canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      for (let i = 0; i <= this._historyCurrentIndex; ++i) {
        const command = this._history[i];
        command.execute(ctx);
      }
    }
    this._cmdUndo.disabled = this._historyCurrentIndex <= -1;
    this._cmdRedo.disabled = false;
  }

  /**
   * redo
   */
  public redo() {
    if (this._historyCurrentIndex < this._history.length) {
      this._historyCurrentIndex += 1;
    }
    const ctx = this._canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      for (let i = 0; i <= this._historyCurrentIndex; ++i) {
        const command = this._history[i];
        command.execute(ctx);
      }
    }
    this._cmdUndo.disabled = false;
    this._cmdRedo.disabled =
      this._historyCurrentIndex + 1 >= this._history.length;
  }

  private _currentTrack: { x: number; y: number }[];

  private _currentLineWidth = 2.0;
  public get currentLineWidth(): number {
    return this._currentLineWidth;
  }

  public set currentLineWidth(width: number) {
    this._currentLineWidth = width;
  }

  private _currentColor = "#000000";
  public get currentColor(): string {
    return this._currentColor;
  }

  public set currentColor(v: string) {
    this._currentColor = v;
  }

  private _currentFont = "";
  public get currentFont(): string {
    return this._currentFont;
  }
  public set currentFont(v: string) {
    this._currentFont = v;
  }

  private _currentFontSize = 24;
  public get currentFontSize(): number {
    return this._currentFontSize;
  }
  public set currentFontSize(v: number) {
    this._currentFontSize = v;
  }

  private _currentFontBold = false;
  public get currentFontBold(): boolean {
    return this._currentFontBold;
  }
  public set currentFontBold(v: boolean) {
    this._currentFontBold = v;
  }

  private _currentFontUnderline = false;
  public get currentFontUnderline(): boolean {
    return this._currentFontUnderline;
  }
  public set currentFontUnderline(v: boolean) {
    this._currentFontUnderline = v;
  }

  private _currentFontItalic = false;
  public get currentFontItalic(): boolean {
    return this._currentFontItalic;
  }
  public set currentFontItalic(v: boolean) {
    this._currentFontItalic = v;
  }

  /**
   * @param canvasId canvas id
   */
  constructor(container: Element) {
    this._isDrawing = false;
    this._currentTrack = [];
    this._currentPointerId = undefined;

    const template = document.createElement("template");
    template.innerHTML = drawBoardTemplateString;
    if (!template.content.firstElementChild) {
      throw Error("Failed to parse DrawBoard template.");
    }
    this._container = template.content.firstElementChild;
    container.replaceWith(this._container);
    container = this._container;

    this._cmdPen = container.querySelector(
      ".drawboard-pen"
    ) as HTMLInputElement;
    this._cmdInsert = container.querySelector(
      ".drawboard-insert"
    ) as HTMLInputElement;
    this._cmdSelect = container.querySelector(
      ".drawboard-select"
    ) as HTMLInputElement;
    this._cmdErase = container.querySelector(
      ".drawboard-erase"
    ) as HTMLInputElement;
    this._cmdColor = container.querySelector(
      ".drawboard-color"
    ) as HTMLButtonElement;
    this._cmdLineWidth = container.querySelector(
      ".drawboard-linewidth"
    ) as HTMLButtonElement;
    this._cmdUndo = container.querySelector(
      ".drawboard-undo"
    ) as HTMLButtonElement;
    this._cmdRedo = container.querySelector(
      ".drawboard-redo"
    ) as HTMLButtonElement;
    this._cmdClear = container.querySelector(
      ".drawboard-clear"
    ) as HTMLButtonElement;
    this._canvas = container.querySelector("canvas") as HTMLCanvasElement;
    if (
      [
        this._cmdPen,
        this._cmdInsert,
        this._cmdSelect,
        this._cmdErase,
        this._cmdColor,
        this._cmdLineWidth,
        this._cmdUndo,
        this._cmdRedo,
        this._cmdClear,
        this._canvas,
      ].some((v) => v === null)
    ) {
      throw Error("Cannot initialize DrawBoard element.");
    }

    this._cmdPen.onclick = () => (this.mode = Mode.PenDrawing);
    this._cmdInsert.onclick = () => (this.mode = Mode.Text);
    this._cmdSelect.onclick = () => (this.mode = Mode.Select);
    this._cmdErase.onclick = () => (this.mode = Mode.Erase);
    this._cmdUndo.onclick = () => this.undo();
    this._cmdRedo.onclick = () => this.redo();
    this._cmdClear.onclick = () => this.clear();

    this._canvas.onpointerdown = this.processPointerBegin.bind(this);
    this._canvas.onpointermove = this.processPointerMoving.bind(this);
    this._canvas.onpointerleave = this.processPointerEnd.bind(this);
    this._canvas.onpointerup = this.processPointerEnd.bind(this);
  }

  private processPointerBegin(ev: PointerEvent) {
    console.debug(
      `onpointerdown: ${ev.offsetX},${ev.offsetY},
pointerId: ${ev.pointerId},
pointerType: ${ev.pointerType},
button: ${ev.button}, buttons: ${ev.buttons}`
    );
    if (this._isDrawing) {
      return;
    }

    switch (this.mode) {
      case Mode.PenDrawing:
        {
          this._isDrawing = true;
          this._currentPointerId = ev.pointerId;
          this._currentTrack.push({ x: ev.offsetX, y: ev.offsetY });

          const ctx = this._canvas.getContext("2d");
          if (!ctx) {
            return;
          }
          ctx.lineWidth = this.currentLineWidth;
          ctx.strokeStyle = this.currentColor;
        }
        break;
      default:
        break;
    }
  }

  private processPointerMoving(ev: PointerEvent) {
    if (!this._isDrawing || this._currentPointerId !== ev.pointerId) {
      return;
    }

    switch (this.mode) {
      case Mode.PenDrawing:
        {
          this._currentTrack.push({ x: ev.offsetX, y: ev.offsetY });
          const ctx = this._canvas.getContext("2d");
          if (!ctx) {
            return;
          }
          ctx.beginPath();
          const { x: x0, y: y0 } = this._currentTrack[
            this._currentTrack.length - 2
          ];
          ctx.moveTo(x0, y0);
          const { x: x1, y: y1 } = this._currentTrack[
            this._currentTrack.length - 1
          ];
          ctx.lineTo(x1, y1);
          ctx.closePath();
          ctx.stroke();
        }
        break;
      default:
        break;
    }
  }

  private processPointerEnd(ev: PointerEvent) {
    console.debug(`process pointer end ${ev.offsetX},${ev.offsetY}`);
    if (!this._isDrawing) {
      return;
    }
    this._isDrawing = false;
    this._currentPointerId = undefined;

    switch (this.mode) {
      case Mode.PenDrawing: {
        const command = new PenCommand(
          this.currentLineWidth,
          this.currentColor,
          this._currentTrack
        );
        this.record(command);
        this._currentTrack = [];
        break;
      }
      case Mode.Text: {
        // TODO
        break;
      }
      case Mode.Erase: {
        // TODO
        break;
      }
      default:
        break;
    }
  }

  /**
   * clear
   */
  public clear() {
    const ctx = this._canvas.getContext("2d");
    ctx?.clearRect(0, 0, this._canvas.width, this._canvas.height);
    this.record(new ClearCommand());
  }
}
