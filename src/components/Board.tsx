import { useCallback, useContext, useEffect, useRef } from "react";
import { AppContext } from "../context";
import {
  drawArrow,
  drawCircle,
  drawDiamond,
  drawRectangle,
  drawShape,
  drawTriangle,
  handleAddText,
  redrawCanvas,
} from "../utils/canvasUtils";
import {
  getCords,
  getStorageData,
  handleEraser,
  loadImage,
  resetStorage,
  setStorageData,
  storeDataObj,
} from "../utils/utils";
import { IndexDB } from "../utils/IndexDB";
import { Canvas } from "../utils/Canvas";
import UndoRedo from "./UndoRedo";
import { TOP_PANEL_OPTIONS, lineDash } from "../utils/constants";
import EditBoard from "./EditBoard";

const {
  RECTANGLE,
  TRIANGLE,
  CIRCLE,
  DIAMOND,
  LINE,
  ARROW,
  ADD_IMAGE,
  ADD_TEXT,
  PENCIL,
  ERASER,
  CLEAR,
  SELECTION,
} = TOP_PANEL_OPTIONS;

const Board = () => {
  const [
    {
      type,
      strokeStyle,
      fillStyle,
      lineWidth,
      strokePattern,
      globalAlpha,
      selectedElement,
    },
    setState,
    resetState,
  ] = useContext(AppContext);

  const boardRef = useRef<HTMLDivElement>(null);
  const isDrawing = useRef(false);
  const isNewLine = useRef(true);
  const startingCords = useRef<{ x: number; y: number }>();
  const snapshotRef = useRef<ImageData>();
  const imageDataRef = useRef<{
    img: HTMLImageElement;
    width: number;
    height: number;
    fileId: string;
  }>();
  const cursorCords = useRef<number[][]>([]);
  const countRef = useRef<number>(0);

  const onPointerMove = useCallback(
    (e: PointerEvent) => {
      const { xCord, yCord } = getCords(e);

      const ctx = Canvas.getContext();

      if (type === ADD_IMAGE && imageDataRef.current) {
        ctx.putImageData(snapshotRef.current!, 0, 0);

        const { img, width, height } = imageDataRef.current;

        if (img) {
          ctx.globalAlpha = globalAlpha / 100;
          ctx.drawImage(img, xCord, yCord, width, height);
        }
        return;
      }

      if (!isDrawing.current) return;

      if (type !== ERASER && type !== SELECTION) {
        ctx.putImageData(snapshotRef.current!, 0, 0);
      }
      const { x, y } = startingCords.current!;

      switch (type) {
        case ERASER:
          handleEraser(Math.floor(xCord), Math.floor(yCord), handleResize);
          break;
        case PENCIL:
          if (x === xCord && y === yCord) {
            ctx.lineTo(xCord - 1, yCord - 1);
            cursorCords.current.push([xCord - 1, yCord - 1]);
          }
          ctx.lineTo(xCord, yCord);
          cursorCords.current.push([xCord, yCord]);
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
    },
    [globalAlpha, type]
  );

  const onPointerDown = useCallback(
    (e: PointerEvent) => {
      e.stopPropagation();
      const { xCord, yCord } = getCords(e);

      isDrawing.current = true;

      const canvas = Canvas.getCanvas();
      const ctx = Canvas.getContext();

      if (type === ADD_TEXT) {
        handleAddText(
          xCord,
          yCord,
          lineWidth,
          globalAlpha,
          strokeStyle,
          ctx,
          (text, width, height) => {
            isDrawing!.current = false;
            if (text) {
              storeDataObj(
                type,
                xCord,
                yCord,
                0,
                0,
                [],
                false,
                text,
                width,
                height
              );
            }
          }
        );
      }

      ctx.fillStyle = fillStyle;
      ctx.strokeStyle = strokeStyle;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.globalAlpha = globalAlpha / 100;
      ctx.globalCompositeOperation = "source-over";

      ctx.setLineDash(lineDash[strokePattern]);

      if (type === ADD_IMAGE && imageDataRef.current) {
        const { img, width, height, fileId } = imageDataRef.current;

        ctx.drawImage(img, xCord, yCord, width * 3, height * 3);

        storeDataObj(
          type,
          xCord,
          yCord,
          0,
          0,
          cursorCords.current,
          false,
          "",
          width * 3,
          height * 3,
          fileId
        );

        imageDataRef.current = {
          img: imageDataRef.current!.img,
          width: 0,
          height: 0,
          fileId: "",
        };
      }

      if (type !== LINE || isNewLine.current) {
        startingCords.current = {
          x: xCord,
          y: yCord,
        };
        ctx.beginPath();
      }

      if (type === LINE) {
        countRef.current += 1;

        ctx.lineTo(xCord, yCord);
        cursorCords.current.push([xCord, yCord]);
        ctx.stroke();
        ctx.save();

        const { x = Infinity, y = Infinity } = startingCords.current || {};
        if (!isNewLine.current) {
          storeDataObj(type, x, y, xCord, yCord, cursorCords.current, true);
        } else {
          storeDataObj(type, x, y, xCord, yCord, cursorCords.current);
        }
        isNewLine.current = false;

        if (
          Math.abs(x - xCord) < 10 &&
          Math.abs(y - yCord) < 10 &&
          countRef.current > 2
        ) {
          ctx.closePath();
          cursorCords.current.push([x, y]);
          ctx.fill();
          ctx.stroke();
          countRef.current = 0;
          isNewLine.current = true;

          storeDataObj(type, x, y, xCord, yCord, cursorCords.current, true);
          cursorCords.current = [];
        }
      } else {
        isNewLine.current = true;
      }

      snapshotRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
      onPointerMove(e);
    },
    [
      fillStyle,
      strokeStyle,
      onPointerMove,
      globalAlpha,
      type,
      strokePattern,
      lineWidth,
    ]
  );

  const onPointerUp = useCallback(
    (e: PointerEvent) => {
      const { xCord, yCord } = getCords(e);

      const { x, y } = startingCords.current!;

      const captureOnUp = [TRIANGLE, ARROW, PENCIL];

      if (
        (type === RECTANGLE || type === CIRCLE || type === DIAMOND) &&
        (x !== xCord || y !== yCord)
      ) {
        let x1 = x;
        let y1 = y;
        let x2 = xCord;
        let y2 = yCord;

        if (x1 > x2 && y1 < y2) {
          x1 = xCord;
          x2 = x;
        } else if (x1 < x2 && y1 > y2) {
          y1 = yCord;
          y2 = y;
        } else if (x1 > x2 && y1 > y2) {
          x1 = xCord;
          y1 = yCord;
          x2 = x;
          y2 = y;
        }

        storeDataObj(type, x1, y1, x2, y2, cursorCords.current);

        cursorCords.current = [];
      } else if (type === TRIANGLE && (x !== xCord || y !== yCord)) {
        let x1 = x;
        let x2 = xCord;

        if (x1 > x2) {
          x1 = xCord;
          x2 = x;
        }

        storeDataObj(type, x1, y, x2, yCord, cursorCords.current);

        cursorCords.current = [];
      } else if (
        captureOnUp.includes(type) &&
        (type === PENCIL || x !== xCord || y !== yCord)
      ) {
        storeDataObj(type, x, y, xCord, yCord, cursorCords.current);

        cursorCords.current = [];
      }

      if (type === ADD_IMAGE) {
        setState({ type: PENCIL });
      }

      isDrawing.current = false;
    },
    [type, setState]
  );

  useEffect(() => {
    startingCords.current = undefined;

    const canvas = Canvas.getCanvas();

    let input: HTMLInputElement;

    const resetSelection = () => setState({ type: PENCIL });

    const handleLoadedImage = (
      img: HTMLImageElement,
      width: number,
      height: number,
      dataUrl: string,
      fileId: string
    ) => {
      imageDataRef.current = {
        img,
        width,
        height,
        fileId,
      };
      snapshotRef.current = Canvas.getContext().getImageData(
        0,
        0,
        canvas.width,
        canvas.height
      );
      IndexDB.saveFileToDB({ dataUrl, fileId });
    };

    const handleInputChange = (e: Event) => {
      loadImage(e, handleLoadedImage);
    };

    if (type === CLEAR) {
      resetStorage();
      resetSelection();
      resetState();
    } else if (type === ADD_IMAGE) {
      input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.click();

      input.addEventListener("change", handleInputChange);
      input.addEventListener("cancel", resetSelection);
      input.remove();
    }

    return () => {
      input?.removeEventListener("change", handleInputChange);
      input?.removeEventListener("cancel", resetSelection);
    };
  }, [type, setState, resetState]);

  const handleResize = useCallback(() => {
    redrawCanvas(boardRef.current!, onPointerDown, onPointerUp, onPointerMove);
  }, [onPointerDown, onPointerMove, onPointerUp]);

  useEffect(() => {
    let idbDatabaseRef: IDBDatabase;
    const handleSuccess = (e: Event) => {
      idbDatabaseRef = (e.target as IDBOpenDBRequest).result;
      handleResize();
    };

    IndexDB.getRequest(handleSuccess);

    window.addEventListener("resize", handleResize);

    return () => {
      idbDatabaseRef?.close();
      window.removeEventListener("resize", handleResize);
    };
  }, [handleResize]);

  useEffect(() => {
    if (selectedElement) {
      const storage = getStorageData();
      const index = storage.findIndex((el) => el.id === selectedElement);

      if (index >= 0) {
        const item = storage[index];
        item.strokeStyle = strokeStyle;
        item.fillStyle = fillStyle;
        item.lineWidth = lineWidth;
        item.globalAlpha = globalAlpha / 100;
        item.dash = lineDash[strokePattern];

        storage[index] = item;
        setStorageData(storage);
      }
    }
  }, [
    strokeStyle,
    fillStyle,
    lineWidth,
    strokePattern,
    globalAlpha,
    selectedElement,
  ]);

  return (
    <>
      <div id="board" ref={boardRef} />
      {type === SELECTION && <EditBoard handleResize={handleResize} />}
      <UndoRedo handleResize={handleResize} />
    </>
  );
};

export default Board;
