/**
 * Singleton service managing the main drawing canvas element,
 * its 2D rendering context, and DPI-aware scaling.
 */
export class CanvasService {
  private static canvas: HTMLCanvasElement;
  private static context: CanvasRenderingContext2D;

  static createCanvas(
    container: HTMLElement,
    onPointerDown: (e: PointerEvent) => void,
    onPointerUp: (e: PointerEvent) => void,
    onPointerMove: (e: PointerEvent) => void,
  ): void {
    this.canvas = document.createElement("canvas");
    this.canvas.onpointerdown = onPointerDown;
    this.canvas.onpointerup = onPointerUp;
    this.canvas.onpointermove = onPointerMove;

    this.createContext();
    this.bindAndScale(container);
  }

  static getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  static getContext(): CanvasRenderingContext2D {
    return this.context;
  }

  private static createContext(): void {
    this.context = this.canvas.getContext("2d", { desynchronized: true })!;
    this.context.fillStyle = "#ffffff";
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private static bindAndScale(container: HTMLElement): void {
    container.innerHTML = "";
    container.appendChild(this.canvas);

    const { width, height } = this.canvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio ?? 1;

    this.canvas.width = width * ratio;
    this.canvas.height = height * ratio;
    this.context.scale(ratio, ratio);
  }
}
