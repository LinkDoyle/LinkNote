import { Command, IDrawer, ExtractPayload } from "./commands";

export class Drawer implements IDrawer {
  private _context: CanvasRenderingContext2D | null | undefined;

  public get context(): CanvasRenderingContext2D | null | undefined {
    return this._context;
  }
  public set context(v: CanvasRenderingContext2D | null | undefined) {
    this._context = v;
  }

  constructor(context: CanvasRenderingContext2D | null | undefined) {
    this._context = context;
  }

  execute(command: Command): void {
    switch (command.type) {
      case "CLEAR":
        return this.CLEAR();
      case "PEN":
        return this.PEN(command.payload);
    }
  }

  CLEAR(): void {
    const ctx = this._context;
    if (!ctx) {
      return;
    }
    ctx?.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  PEN({ lineWidth, color, tracks }: ExtractPayload<"PEN">): void {
    const ctx = this._context;
    if (!ctx || tracks.length === 0) {
      return;
    }
    ctx.save();
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = color;
    if (tracks.length === 1) {
      const { x, y } = tracks[0];
      ctx.moveTo(x, y);
      ctx.stroke();
    } else {
      ctx.beginPath();
      for (let i = 0; i < tracks.length - 1; ++i) {
        const { x: x0, y: y0 } = tracks[i];
        ctx.moveTo(x0, y0);
        const { x: x1, y: y1 } = tracks[i + 1];
        ctx.lineTo(x1, y1);
      }
      ctx.closePath();
      ctx.stroke();
    }
    ctx.restore();
  }
}
