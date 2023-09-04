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
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>();
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
      console.log("onPointerMove");
      const { xCord, yCord } = getCords(e);

      const ctx = contextRef.current!;

      if (selectedTool === ADD_IMAGE && imageDataRef.current) {
        console.log("here in  adding image");
        ctx.putImageData(snapshotRef.current!, 0, 0);

        const { img, width, height } = imageDataRef.current;

        if (img) {
          ctx.globalAlpha = opacity / 100;
          ctx.drawImage(img, xCord, yCord, width, height);
        }
        return;
      }

      if (!isDrawing.current) return;

      ctx.putImageData(snapshotRef.current!, 0, 0);
      const { x, y } = startingCords.current!;

      switch (selectedTool) {
        case ERASER:
          handleEraser(xCord, yCord, handleResize);
          break;
        case PENCIL:
          if (x === xCord && y === yCord) {
            ctx.lineTo(xCord - 1, yCord - 1);
            cursorCords.current.push([xCord - 0.1, yCord - 0.1]);
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

        // case "Add Text": // font family
        // undo redo
        // in mobile content is not visible when drawn but visible when downloaded
        // retain aspect ratio of canvas after resizing
        // add theme light and dark
        // check handleWheel for moving canvas
        // add cache for fast image load - Done
        // add eraser support
        // add resize
      }
    },
    [opacity, selectedTool]
  );

  const onPointerDown = useCallback(
    (e: PointerEvent) => {
      e.stopPropagation();
      console.log("onPointerDown");
      const { xCord, yCord } = getCords(e);

      isDrawing.current = true;

      const canvas = canvasRef.current!;
      const ctx = contextRef.current!;

      if (selectedTool === ADD_TEXT) {
        handleAddText(
          xCord,
          yCord,
          width,
          opacity,
          color,
          contextRef,
          (text, width, height) => {
            isDrawing!.current = false;
            if (text) {
              storeDataObj(
                selectedTool,
                contextRef.current!,
                xCord,
                yCord,
                width,
                height,
                [],
                false,
                text
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
        console.log("here in  adding image 1");
        const { img, width, height, fileId } = imageDataRef.current;

        ctx.drawImage(img, xCord, yCord, width * 3, height * 3);

        storeDataObj(
          selectedTool,
          contextRef.current!,
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
        console.log("startingCords set", xCord, yCord);
        startingCords.current = {
          x: xCord,
          y: yCord,
        };
        ctx.beginPath();
      }
      console.log("isNewLine.current", isNewLine.current);
      if (selectedTool === LINE) {
        countRef.current += 1;

        ctx.lineTo(xCord, yCord);
        cursorCords.current.push([xCord, yCord]);
        console.log("cursorCords", cursorCords.current);
        ctx.stroke();
        ctx.save();

        const { x = Infinity, y = Infinity } = startingCords.current || {};
        if (!isNewLine.current) {
          storeDataObj(
            selectedTool,
            contextRef.current!,
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
            contextRef.current!,
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
            contextRef.current!,
            x,
            y,
            xCord,
            yCord,
            cursorCords.current
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
      console.log("onPointerUp", startingCords.current);
      const { xCord, yCord } = getCords(e);

      const { x, y } = startingCords.current!;

      const captureOnUp = [RECTANGLE, CIRCLE, TRIANGLE, DIAMOND, ARROW, PENCIL];

      if (captureOnUp.includes(selectedTool)) {
        storeDataObj(
          selectedTool,
          contextRef.current!,
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
    console.log("startingCords.current reste", selectedTool);
    startingCords.current = undefined;
    const canvas = canvasRef.current!;
    const ctx = contextRef.current!;
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
      snapshotRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
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
    const { canvas, ctx } = redrawCanvas(
      boardRef.current!,
      onPointerDown,
      onPointerUp,
      onPointerMove
    );
    canvasRef.current = canvas;
    contextRef.current = ctx;
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
