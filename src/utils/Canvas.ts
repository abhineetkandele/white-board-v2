export class Canvas {
  private static canvas: HTMLCanvasElement;
  private static context: CanvasRenderingContext2D;

  static bindAndScaleCanvas(element: HTMLElement) {
    element.innerHTML = "";
    element.appendChild(this.canvas);

    const { width, height } = this.canvas.getBoundingClientRect();
    const { devicePixelRatio: ratio = 1 } = window;

    this.canvas.width = width * ratio;
    this.canvas.height = height * ratio;
    this.context.scale(ratio, ratio);
  }

  static createContext() {
    this.context = this.canvas.getContext("2d", { desynchronized: true })!;

    this.context.fillStyle = "#ffffff";
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  static createCanvas(
    board: HTMLElement,
    onPointerDown: (e: PointerEvent) => void,
    onPointerUp: (e: PointerEvent) => void,
    onPointerMove: (e: PointerEvent) => void
  ) {
    this.canvas = document.createElement("canvas");
    this.canvas.onpointerdown = onPointerDown;
    this.canvas.onpointerup = onPointerUp;
    this.canvas.onpointermove = onPointerMove;
    this.createContext();
    this.bindAndScaleCanvas(board);
  }

  static getContext() {
    return this.context;
  }

  static getCanvas() {
    return this.canvas;
  }
}
