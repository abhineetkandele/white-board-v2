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
} from "../Config/canvasUtils";
import { TOP_PANEL_OPTIONS } from "../Config/TopPanel";
import {
  getCords,
  handleEraser,
  loadImage,
  resetStorageData,
  storeDataObj,
} from "../Config/utils";
import { IndexDB } from "../Config/IndexDB";
import { Canvas } from "../Config/Canvas";

const {
  RECTANGLE,
  TRIANGLE,
  CIRCLE,
  DIAMOND,
  DOWNLOAD,
  LINE,
  ARROW,
  ADD_IMAGE,
  ADD_TEXT,
  PENCIL,
  ERASER,
  CLEAR,
} = TOP_PANEL_OPTIONS;

const Board = () => {
  const [
    { selectedTool, color, backgroundColor, width, strokeStyle, opacity },
    setState,
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

      if (selectedTool === ADD_IMAGE && imageDataRef.current) {
        ctx.putImageData(snapshotRef.current!, 0, 0);

        const { img, width, height } = imageDataRef.current;

        if (img) {
          ctx.globalAlpha = opacity / 100;
          ctx.drawImage(img, xCord, yCord, width, height);
        }
        return;
      }

      if (!isDrawing.current) return;

      if (selectedTool !== ERASER) {
        ctx.putImageData(snapshotRef.current!, 0, 0);
      }
      const { x, y } = startingCords.current!;

      switch (selectedTool) {
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
    [opacity, selectedTool]
  );

  const onPointerDown = useCallback(
    (e: PointerEvent) => {
      e.stopPropagation();
      const { xCord, yCord } = getCords(e);

      isDrawing.current = true;

      const canvas = Canvas.getCanvas();
      const ctx = Canvas.getContext();

      if (selectedTool === ADD_TEXT) {
        handleAddText(
          xCord,
          yCord,
          width,
          opacity,
          color,
          ctx,
          (text, width, height) => {
            isDrawing!.current = false;
            if (text) {
              storeDataObj(
                selectedTool,
                ctx,
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

      ctx.fillStyle = backgroundColor;
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.globalAlpha = opacity / 100;
      ctx.globalCompositeOperation = "source-over";

      if (strokeStyle === "Dashed") {
        ctx.setLineDash([10, 15]);
      } else if (strokeStyle === "Dotted") {
        ctx.setLineDash([1, 15]);
      } else {
        ctx.setLineDash([]);
      }

      if (selectedTool === ADD_IMAGE && imageDataRef.current) {
        const { img, width, height, fileId } = imageDataRef.current;

        ctx.drawImage(img, xCord, yCord, width * 3, height * 3);

        storeDataObj(
          selectedTool,
          ctx,
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

      if (selectedTool !== LINE || isNewLine.current) {
        startingCords.current = {
          x: xCord,
          y: yCord,
        };
        ctx.beginPath();
      }

      if (selectedTool === LINE) {
        countRef.current += 1;

        ctx.lineTo(xCord, yCord);
        cursorCords.current.push([xCord, yCord]);
        ctx.stroke();
        ctx.save();

        const { x = Infinity, y = Infinity } = startingCords.current || {};
        if (!isNewLine.current) {
          storeDataObj(
            selectedTool,
            ctx,
            x,
            y,
            xCord,
            yCord,
            cursorCords.current,
            true
          );
        } else {
          storeDataObj(
            selectedTool,
            ctx,
            x,
            y,
            xCord,
            yCord,
            cursorCords.current
          );
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

          storeDataObj(
            selectedTool,
            ctx,
            x,
            y,
            xCord,
            yCord,
            cursorCords.current,
            true
          );
          cursorCords.current = [];
        }
      } else {
        isNewLine.current = true;
      }

      snapshotRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
      onPointerMove(e);
    },
    [
      backgroundColor,
      color,
      onPointerMove,
      opacity,
      selectedTool,
      strokeStyle,
      width,
    ]
  );

  const onPointerUp = useCallback(
    (e: PointerEvent) => {
      const { xCord, yCord } = getCords(e);

      const { x, y } = startingCords.current!;

      const captureOnUp = [RECTANGLE, CIRCLE, TRIANGLE, DIAMOND, ARROW, PENCIL];

      if (
        captureOnUp.includes(selectedTool) &&
        (selectedTool === PENCIL || x !== xCord || y !== yCord)
      ) {
        storeDataObj(
          selectedTool,
          Canvas.getContext(),
          x,
          y,
          xCord,
          yCord,
          cursorCords.current
        );

        cursorCords.current = [];
      }

      if (selectedTool === ADD_IMAGE) {
        setState({ selectedTool: PENCIL });
      }

      isDrawing.current = false;
    },
    [selectedTool, setState]
  );

  useEffect(() => {
    startingCords.current = undefined;
    const canvas = Canvas.getCanvas();

    let input: HTMLInputElement;

    const resetSelection = () => setState({ selectedTool: PENCIL });

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

    if (selectedTool === CLEAR) {
      resetStorageData();
      resetSelection();
    } else if (selectedTool === DOWNLOAD) {
      const link = document.createElement("a");
      link.download = `${Date.now()}.jpg`;
      link.href = canvas.toDataURL();
      link.click();
      resetSelection();
      link.remove();
    } else if (selectedTool === ADD_IMAGE) {
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
  }, [selectedTool, setState]);

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

  return (
    <>
      <div id="board" ref={boardRef} />
    </>
  );
};

export default Board;
