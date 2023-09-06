import { TOP_PANEL_OPTIONS } from "./TopPanel";

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

export const hex2rgb = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  return { r, g, b };
};

export const getCords = (e: PointerEvent) => {
  const xCord = e.clientX;
  const yCord = e.clientY;

  return { xCord, yCord };
};

export const bytesToHexString = (bytes: Uint8Array) => {
  return Array.from(bytes)
    .map((byte) => `0${byte.toString(16)}`.slice(-2))
    .join("");
};

export const blobToArrayBuffer = (blob: Blob): Promise<ArrayBuffer> => {
  if ("arrayBuffer" in blob) {
    return blob.arrayBuffer();
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (!event.target?.result) {
        return reject(new Error("Couldn't convert blob to ArrayBuffer"));
      }
      resolve(event.target.result as ArrayBuffer);
    };
    reader.readAsArrayBuffer(blob);
  });
};

export const generateIdFromFile = async (file: File) => {
  try {
    const hashBuffer = await window.crypto.subtle.digest(
      "SHA-1",
      await blobToArrayBuffer(file)
    );
    return bytesToHexString(new Uint8Array(hashBuffer));
  } catch (error) {
    console.error(error);
    return URL.createObjectURL(file).substr(-40);
  }
};

export const loadImage = (
  e: Event,
  onImageLoad: (
    img: HTMLImageElement,
    width: number,
    height: number,
    dataUrl: string,
    fileId: string
  ) => void
) => {
  const target = e.target as HTMLInputElement;
  const imageFile = target.files?.[0];

  if (imageFile) {
    const fileIdPromise = generateIdFromFile(imageFile);
    const reader = new FileReader();

    reader.addEventListener("load", () => {
      const img = new Image();

      img.onload = async function () {
        const imgWidth = img.naturalWidth;
        const imgHeight = img.naturalHeight;
        const aspectRatio = imgWidth / imgHeight;
        const width = 200;
        const height = width / aspectRatio;
        const fileId = await fileIdPromise;

        onImageLoad(img, width, height, reader.result as string, fileId);
      };
      img.src = reader.result as string;
    });

    reader.readAsDataURL(imageFile);
  }
};

export const getStorageData = () => {
  const data = localStorage.getItem("data");

  if (!data) {
    return [];
  }

  return JSON.parse(data) as ReturnType<typeof createDataObj>[];
};

export const resetStorageData = () => {
  localStorage.removeItem("data");
};

export const setStorageData = (data: object) => {
  localStorage.setItem("data", JSON.stringify(data));
};

export const createDataObj = (
  selectedTool: string,
  context: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  path: number[][],
  text: string,
  width: number,
  height: number,
  fileId: string
) => {
  const { lineWidth, globalAlpha, strokeStyle, fillStyle } = context;

  return {
    type: selectedTool,
    x1,
    y1,
    x2,
    y2,
    dash: context.getLineDash(),
    lineWidth,
    globalAlpha,
    strokeStyle,
    fillStyle,
    path,
    text,
    width,
    height,
    fileId,
  };
};

export const storeDataObj = (
  selectedTool: string,
  context: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  path: number[][],
  updateLast = false,
  text: string = "",
  width: number = 0,
  height: number = 0,
  fileId: string = ""
) => {
  const drawingObj = createDataObj(
    selectedTool,
    context,
    Math.floor(x1),
    Math.floor(y1),
    Math.floor(x2),
    Math.floor(y2),
    path,
    text,
    Math.floor(width),
    Math.floor(height),
    fileId
  );

  const data = getStorageData();

  if (updateLast) {
    data.pop();
  }

  data.push(drawingObj);

  setStorageData(data);
};

export const handleEraser = (x: number, y: number, reDraw: () => void) => {
  const data = getStorageData();

  if (data.length > 0) {
    const reversedData = [...data].reverse();

    const index = reversedData.findIndex(
      ({ x1, x2, y1, y2, height, width, type, fillStyle }) => {
        if (
          (type === RECTANGLE && fillStyle !== "rgba(0, 0, 0, 0)") ||
          type === ADD_IMAGE
        ) {
          if (!x2) {
            x2 = x1 + width;
          }
          if (!y2) {
            y2 = y1 + height;
          }
          if (x >= x1 && x <= x2 && y >= y1 && y <= y2) {
            return true;
          }
        } else if (type === RECTANGLE) {
          if (
            (x1 === x && y >= y1 && y <= y2) ||
            (x2 === x && y >= y1 && y <= y2) ||
            (y1 === y && x >= x1 && x <= x2) ||
            (y2 === y && x >= x1 && x <= x2)
          ) {
            return true;
          }
        }
      }
    );

    if (index !== -1) {
      reversedData.splice(index, 1);
      setStorageData(reversedData.reverse());
      reDraw();
    }
  }
};
