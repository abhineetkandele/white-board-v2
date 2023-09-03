import { Cache } from "./Cache";
import { TOP_PANEL_OPTIONS } from "./TopPanel";
import { getStorageData } from "./utils";

const {
  RECTANGLE,
  TRIANGLE,
  CIRCLE,
  DIAMOND,
  LINE,
  ARROW,
  PENCIL,
  ADD_TEXT,
  ADD_IMAGE,
} = TOP_PANEL_OPTIONS;

export const drawArrow = (
  context: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  t = 0.9
) => {
  const arrow = {
    dx: x2 - x1,
    dy: y2 - y1,
  };
  const middle = {
    x: arrow.dx * t + x1,
    y: arrow.dy * t + y1,
  };
  const tip = {
    dx: x2 - middle.x,
    dy: y2 - middle.y,
  };
  context.beginPath();
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.lineTo(middle.x + 0.5 * tip.dy, middle.y - 0.5 * tip.dx);
  context.moveTo(x2, y2);
  context.lineTo(middle.x - 0.5 * tip.dy, middle.y + 0.5 * tip.dx);
  context.closePath();
  context.stroke();
};

export const drawTriangle = (
  context: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number
) => {
  context.beginPath(); // why we need 2 begin path
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.lineTo(x1 * 2 - x2, y2);
  context.closePath();
};

export const drawDiamond = (
  context: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number
) => {
  context.beginPath(); // why we need 2 begin path
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.lineTo(x1, y1 + (y2 - y1) * 2);
  context.lineTo(x1 * 2 - x2, y2);
  context.closePath();
};

export const drawCircle = (
  context: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number
) => {
  context.beginPath();
  const radius = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
  context.arc(x1, y1, radius, 0, 2 * Math.PI);
};

export const drawRectangle = (
  context: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number
) => {
  context.fillRect(x1, y1, x2 - x1, y2 - y1);
  context.strokeRect(x1, y1, x2 - x1, y2 - y1);
};

export const drawShape = (context: CanvasRenderingContext2D) => {
  context.fill();
  context.stroke();
};

export const drawText = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  value: string,
  textArea: HTMLTextAreaElement | null,
  width: number,
  color: string
) => {
  textArea?.remove();

  if (value) {
    ctx.font = `${
      width * 6
    }px LatoWeb, Helvetica Neue, Helvetica, Arial, sans-serif`;
    ctx.fillStyle = color;

    const lines = value.split("\n");
    for (let i = 0; i < lines.length; i++)
      ctx.fillText(lines[i], x, y + i * width * 5);
  }
};

export const handleAddText = (
  xCoord: number,
  yCoord: number,
  width: number,
  opacity: number,
  color: string,
  contextRef: React.MutableRefObject<
    CanvasRenderingContext2D | null | undefined
  >,
  onTextDrawn: (text: string, width: number, height: number) => void
) => {
  const textArea = document.createElement("textarea");
  textArea.wrap = "off";
  textArea.dir = "auto";
  textArea.tabIndex = 0;
  textArea.setAttribute(
    "style",
    `
        position: absolute;
        background: transparent;
        left: ${xCoord}px;
        top: ${yCoord - width * 5.5}px;
        opacity: ${opacity / 100};
        color: ${color};
        font-size: ${width * 6}px;
        height: ${width * 10}px;
        max-width: ${window.innerWidth - xCoord}px;
        white-space: pre;
        margin: 0px;
        padding: 0px;
        border: none;
        outline: none;
        resize: none;
        overflow: hidden;
        word-break: normal;
        width: 20px;
        white-space: pre;
        backface-visibility: hidden;
        overflow-wrap: break-word;
        font-family: LatoWeb, Helvetica Neue, Helvetica, Arial, sans-serif;
        box-sizing: content-box;`
  );

  textArea.oninput = () => {
    textArea.style.width = textArea.scrollWidth + "px";
  };

  textArea.onblur = (e) => {
    drawText(
      contextRef.current!,
      xCoord,
      yCoord,
      (e.target as HTMLTextAreaElement).value,
      textArea,
      width,
      color
    );
    onTextDrawn(
      (e.target as HTMLTextAreaElement).value,
      textArea.scrollWidth,
      textArea.scrollHeight
    );
  };
  document.body.appendChild(textArea);
  setTimeout(() => textArea.focus(), 0);
};

const redrawImage = (
  ctx: CanvasRenderingContext2D,
  indexDB: IDBDatabase,
  x: number,
  y: number,
  width: number,
  height: number,
  fileId: string
) => {
  console.log("image redrawn");
  const cachedData = Cache.checkCache(fileId);

  if (cachedData) {
    ctx.drawImage(cachedData, x, y, width, height);
    return;
  }

  return new Promise((resolve) => {
    const tx = indexDB.transaction("files", "readonly");
    const store = tx.objectStore("files");
    const data = store.get(fileId);

    data.onsuccess = () => {
      if (data?.result) {
        // ctx.putImageData(data.result[0], 0, 0);
        const img = new Image();

        img.onload = function () {
          // const imgWidth = img.naturalWidth;
          // const imgHeight = img.naturalHeight;
          // const aspectRatio = imgWidth / imgHeight;
          // const width = 200;
          // const height = width / aspectRatio;
          ctx.drawImage(img, x, y, width, height);
          Cache.setCache(fileId, img);
          resolve("");
        };
        img.src = data.result.dataUrl as string;
      }
    };
  });
};

export const redrawShapes = async (
  ctx: CanvasRenderingContext2D,
  indexDB: IDBDatabase
) => {
  const data = getStorageData();
  console.log("redrawShapes", data);

  for (const shapeObj of data) {
    const {
      type: selectedTool,
      x1: x,
      y1: y,
      x2: xCord,
      y2: yCord,
      dash,
      lineWidth,
      globalAlpha,
      strokeStyle,
      fillStyle,
      path,
      text,
      width,
      height,
      fileId,
    } = shapeObj;

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.fillStyle = fillStyle;
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = lineWidth;
    ctx.globalAlpha = globalAlpha;

    ctx.setLineDash(dash);

    ctx.beginPath();

    switch (selectedTool) {
      case ADD_IMAGE:
        await redrawImage(ctx, indexDB, x, y, width, height, fileId);
        break;
      case ADD_TEXT:
        drawText(ctx, x, y, text, null, lineWidth, strokeStyle as string);
        break;
      case PENCIL:
        ctx.moveTo(x, y);
        path.forEach(([xPath, yPath]) => {
          ctx.lineTo(xPath, yPath);
        });
        ctx.stroke();
        break;
      case LINE:
        ctx.moveTo(x, y);
        path.forEach(([xPath, yPath]) => {
          ctx.lineTo(xPath, yPath);
        });
        if (
          Math.abs(x - path[path.length - 1][0]) < 10 &&
          Math.abs(y - path[path.length - 1][1]) < 10
        ) {
          ctx.closePath();
        }
        ctx.fill();
        ctx.stroke();
        break;
      case RECTANGLE:
        drawRectangle(ctx, x, y, xCord, yCord);
        break;

      case CIRCLE:
        drawCircle(ctx, x, y, xCord, yCord);
        drawShape(ctx);
        break;

      case DIAMOND:
        drawDiamond(ctx, x, y, xCord, yCord);
        drawShape(ctx);
        break;

      case TRIANGLE:
        drawTriangle(ctx, x, y, xCord, yCord);
        drawShape(ctx);
        break;

      case ARROW:
        drawArrow(ctx, x, y, xCord, yCord);
        break;
    }
  }
};

export const redrawCanvas = (
  board: HTMLDivElement,
  onPointerDown: (e: PointerEvent) => void,
  onPointerUp: (e: PointerEvent) => void,
  onPointerMove: (e: PointerEvent) => void,
  indexDB: IDBDatabase
) => {
  const canvas = document.createElement("canvas");
  canvas.onpointerdown = onPointerDown;
  canvas.onpointerup = onPointerUp;
  canvas.onpointermove = onPointerMove;

  // canvasRef.current = canvas;

  const { devicePixelRatio: ratio = 1 } = window;

  const ctx = canvas.getContext("2d", {
    willReadFrequently: true, // When we want to read data frequently
    desynchronized: true,
  })!;
  // contextRef.current = ctx;

  if (ctx) {
    console.log("canvas redrwan");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // boardRef.current!.innerHTML = "";
  // boardRef.current?.appendChild(canvas);
  board.innerHTML = "";
  board.appendChild(canvas);

  requestAnimationFrame(() => {
    const { width, height } = canvas.getBoundingClientRect();

    canvas.width = width * ratio;
    canvas.height = height * ratio;
    ctx.scale(ratio, ratio);
    redrawShapes(ctx, indexDB);
  });

  return {
    canvas,
    ctx,
  };
};
