/**
 * Singleton service managing the main drawing canvas element,
 * its 2D rendering context, and DPI-aware scaling.
 */
export class CanvasService {
  private static canvas: HTMLCanvasElement;
  private static context: CanvasRenderingContext2D;
  private static ratio = window.devicePixelRatio ?? 1;
  private static viewport = {
    scale: 1,
    offsetX: 0,
    offsetY: 0,
  };

  private static readonly MIN_SCALE = 0.2;
  private static readonly MAX_SCALE = 6;

  static createCanvas(
    container: HTMLElement,
    onPointerDown: (e: PointerEvent) => void,
    onPointerUp: (e: PointerEvent) => void,
    onPointerMove: (e: PointerEvent) => void,
    onWheel?: (e: WheelEvent) => void
  ): void {
    this.canvas = document.createElement("canvas");
    this.canvas.onpointerdown = onPointerDown;
    this.canvas.onpointerup = onPointerUp;
    this.canvas.onpointermove = onPointerMove;
    this.canvas.oncontextmenu = (e) => e.preventDefault();

    if (onWheel) {
      this.canvas.onwheel = onWheel;
    }

    this.createContext();
    this.bindAndScale(container);
  }

  static getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  static getContext(): CanvasRenderingContext2D {
    return this.context;
  }

  static getViewport() {
    return { ...this.viewport };
  }

  static panBy(deltaX: number, deltaY: number): void {
    this.viewport.offsetX += deltaX;
    this.viewport.offsetY += deltaY;
    this.applyViewportTransform();
  }

  static zoomAt(screenX: number, screenY: number, zoomFactor: number): void {
    const oldScale = this.viewport.scale;
    const nextScale = Math.min(
      this.MAX_SCALE,
      Math.max(this.MIN_SCALE, oldScale * zoomFactor)
    );

    if (nextScale === oldScale) return;

    const worldX = (screenX - this.viewport.offsetX) / oldScale;
    const worldY = (screenY - this.viewport.offsetY) / oldScale;

    this.viewport.scale = nextScale;
    this.viewport.offsetX = screenX - worldX * nextScale;
    this.viewport.offsetY = screenY - worldY * nextScale;
    this.applyViewportTransform();
  }

  static screenToWorld(x: number, y: number): { x: number; y: number } {
    return {
      x: (x - this.viewport.offsetX) / this.viewport.scale,
      y: (y - this.viewport.offsetY) / this.viewport.scale,
    };
  }

  static worldToScreen(x: number, y: number): { x: number; y: number } {
    return {
      x: x * this.viewport.scale + this.viewport.offsetX,
      y: y * this.viewport.scale + this.viewport.offsetY,
    };
  }

  static resetAndClear(): void {
    this.context.setTransform(1, 0, 0, 1, 0, 0);
    this.context.fillStyle = "#ffffff";
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.applyViewportTransform();
  }

  static applyViewportTransform(
    ctx: CanvasRenderingContext2D = this.context
  ): void {
    ctx.setTransform(
      this.ratio * this.viewport.scale,
      0,
      0,
      this.ratio * this.viewport.scale,
      this.ratio * this.viewport.offsetX,
      this.ratio * this.viewport.offsetY
    );
  }

  private static createContext(): void {
    this.context = this.canvas.getContext("2d", { desynchronized: true })!;
  }

  private static bindAndScale(container: HTMLElement): void {
    container.innerHTML = "";
    container.appendChild(this.canvas);

    const { width, height } = this.canvas.getBoundingClientRect();
    this.ratio = window.devicePixelRatio ?? 1;

    this.canvas.width = width * this.ratio;
    this.canvas.height = height * this.ratio;
    this.resetAndClear();
  }
}
