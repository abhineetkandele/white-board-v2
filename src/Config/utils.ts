export const hex2rgb = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  return { r, g, b };
};

export const getCords = (e: PointerEvent) => {
  const xCord = e.clientX; // || e.changedTouches?.[0].clientX;
  const yCord = e.clientY; // || e.changedTouches?.[0].clientY;

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

  // Safari
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

export const createIndexDBConnection = (
  dbName: string,
  storeName: string,
  storeOptions: IDBObjectStoreParameters
) => {
  if (!indexedDB) {
    console.warn(
      "IndexedDB could not be found in this browser. Data will be lost on page refresh"
    );
    return;
  }

  const request = indexedDB.open(dbName, 1);

  request.onerror = (error) => console.warn("Error occured", error);

  request.onupgradeneeded = () => {
    const db = request.result;

    if (!db.objectStoreNames.contains(storeName)) {
      db.createObjectStore(storeName, storeOptions);
    }
  };

  return request;
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
    x1,
    y1,
    x2,
    y2,
    path,
    text,
    width,
    height,
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
  console.log("xCord, yCord", x, y);
  // requestAnimationFrame(() => {
  const data = getStorageData();

  if (data.length > 0) {
    const reversedData = [...data].reverse();

    const index = reversedData.findIndex(
      ({ x1, x2, y1, y2, height, width }) => {
        if (!x2) {
          x2 = x1 + width;
        }
        if (!y2) {
          y2 = y1 + height;
        }
        if (x >= x1 && x <= x2 && y >= y1 && y <= y2) {
          return true;
        }
      }
    );
    console.log("index", index);
    if (index !== -1) {
      console.log("reversedData", reversedData);
      reversedData.splice(index, 1);
      console.log("reversedData", reversedData);
      setStorageData(reversedData);
      requestAnimationFrame(() => reDraw());
      reDraw();
      // });
    }
  }
  // });
};
