import React from "react";
import { v4 as uuid } from "uuid";
import { BoardElement } from "../types/types";
import { Data } from "./Data";
import { detectPointLocation } from "./detectPointLocation";
import { Canvas } from "./Canvas";

export const hex2rgb = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  return { r, g, b };
};

export const getCords = (
  e: PointerEvent | React.PointerEvent<HTMLCanvasElement>,
  isRound = true
) => {
  const xCord = isRound ? Math.floor(e.clientX) : e.clientX;
  const yCord = isRound ? Math.floor(e.clientY) : e.clientY;

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

  return JSON.parse(data) as BoardElement[];
};

export const resetStorage = () => {
  localStorage.removeItem("data");
  Data.resetData();
};

export const setStorageData = (data: object) => {
  localStorage.setItem("data", JSON.stringify(data));
};

export const createDataObj = (
  selectedTool: string,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  path: number[][],
  text: string,
  width: number,
  height: number,
  fileId: string,
  id: string
): BoardElement => {
  const context = Canvas.getContext();
  const { lineWidth, globalAlpha, strokeStyle, fillStyle } = context;

  return {
    id: id ? id : uuid(),
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
  const data = getStorageData();
  let oldObj;

  if (updateLast) {
    oldObj = data.pop();
  }

  const drawingObj = createDataObj(
    selectedTool,
    x1,
    y1,
    x2,
    y2,
    [...path],
    text,
    Math.floor(width),
    Math.floor(height),
    fileId,
    oldObj?.id || ""
  );

  Data.addHistoryItem(drawingObj);
  data.push(drawingObj);

  setStorageData(data);
};

export const handleEraser = (x: number, y: number, reDraw: () => void) => {
  const index = detectPointLocation(x, y);

  if (index !== -1) {
    const data = getStorageData();
    const reversedData = [...data].reverse();
    const deletedElement = reversedData.splice(index, 1);
    Data.addHistoryItem(deletedElement[0]);
    setStorageData(reversedData.reverse());
    reDraw();
  }
};
