import { useCallback, useContext, useEffect, useRef } from "react";
import { AppContext } from "../context";
import { TOOLS } from "../constants";
import { LINE_DASH } from "../constants/styles";
import { CanvasService, IndexedDBService, StorageService } from "../services";
import {
  drawArrow,
  drawCircle,
  drawDiamond,
  drawRectangle,
  drawTriangle,
  fillAndStroke,
  createTextInput,
  redrawCanvas,
  redrawAllElements,
} from "../drawing";
import { getPointerCoords, handleEraser, loadImage } from "../utils";

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
} = TOOLS;

export const useBoard = () => {
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
  const isPanning = useRef(false);
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const cursorCords = useRef<number[][]>([]);
  const lineClickCount = useRef<number>(0);

  // ─── Pointer move ─────────────────────────────────────────────────

  const onPointerMove = useCallback(
    (e: PointerEvent) => {
      if (isPanning.current) {
        const dx = e.clientX - panStartRef.current.x;
        const dy = e.clientY - panStartRef.current.y;
        panStartRef.current = { x: e.clientX, y: e.clientY };
        CanvasService.panBy(dx, dy);
        redrawAllElements(CanvasService.getContext());
        return;
      }

      const { xCord, yCord } = getPointerCoords(e);
      const ctx = CanvasService.getContext();

      // Image preview follows cursor
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
          fillAndStroke(ctx);
          break;
        case DIAMOND:
          drawDiamond(ctx, x, y, xCord, yCord);
          fillAndStroke(ctx);
          break;
        case TRIANGLE:
          drawTriangle(ctx, x, y, xCord, yCord);
          fillAndStroke(ctx);
          break;
        case ARROW:
          drawArrow(ctx, x, y, xCord, yCord);
          break;
      }
    },
    [globalAlpha, type] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // ─── Pointer down ─────────────────────────────────────────────────

  const onPointerDown = useCallback(
    (e: PointerEvent) => {
      e.stopPropagation();

      if (e.button === 1 || e.button === 2 || e.shiftKey) {
        isPanning.current = true;
        panStartRef.current = { x: e.clientX, y: e.clientY };
        return;
      }

      if (e.button !== 0) return;

      const { xCord, yCord } = getPointerCoords(e);
      isDrawing.current = true;

      const canvas = CanvasService.getCanvas();
      const ctx = CanvasService.getContext();

      // Text tool
      if (type === ADD_TEXT) {
        const { x: textX, y: textY } = CanvasService.worldToScreen(
          xCord,
          yCord
        );
        createTextInput(
          textX,
          textY,
          lineWidth,
          globalAlpha,
          strokeStyle,
          ctx,
          (text, w, h) => {
            isDrawing.current = false;
            if (text) {
              StorageService.storeElement(
                type,
                xCord,
                yCord,
                0,
                0,
                [],
                false,
                text,
                w,
                h
              );
            }
          }
        );
      }

      // Apply current styles
      ctx.fillStyle = fillStyle;
      ctx.strokeStyle = strokeStyle;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.globalAlpha = globalAlpha / 100;
      ctx.globalCompositeOperation = "source-over";
      ctx.setLineDash(LINE_DASH[strokePattern]);

      // Image placement
      if (type === ADD_IMAGE && imageDataRef.current) {
        const { img, width, height, fileId } = imageDataRef.current;
        ctx.drawImage(img, xCord, yCord, width * 3, height * 3);
        StorageService.storeElement(
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
        imageDataRef.current = { img, width: 0, height: 0, fileId: "" };
      }

      // Begin path (unless continuing a line)
      if (type !== LINE || isNewLine.current) {
        startingCords.current = { x: xCord, y: yCord };
        ctx.beginPath();
      }

      // Line tool: multi-click segments
      if (type === LINE) {
        lineClickCount.current += 1;
        ctx.lineTo(xCord, yCord);
        cursorCords.current.push([xCord, yCord]);
        ctx.stroke();
        ctx.save();

        const { x = Infinity, y = Infinity } = startingCords.current || {};
        StorageService.storeElement(
          type,
          x,
          y,
          xCord,
          yCord,
          cursorCords.current,
          !isNewLine.current
        );
        isNewLine.current = false;

        // Close polygon if clicking near start
        if (
          Math.abs(x - xCord) < 10 &&
          Math.abs(y - yCord) < 10 &&
          lineClickCount.current > 2
        ) {
          ctx.closePath();
          cursorCords.current.push([x, y]);
          ctx.fill();
          ctx.stroke();
          lineClickCount.current = 0;
          isNewLine.current = true;
          StorageService.storeElement(
            type,
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
      fillStyle,
      strokeStyle,
      onPointerMove,
      globalAlpha,
      type,
      strokePattern,
      lineWidth,
    ]
  );

  // ─── Pointer up ───────────────────────────────────────────────────

  const onPointerUp = useCallback(
    (e: PointerEvent) => {
      if (isPanning.current) {
        isPanning.current = false;
        return;
      }

      const { xCord, yCord } = getPointerCoords(e);
      const { x, y } = startingCords.current!;

      // Shapes that normalize coordinates on up
      if (
        (type === RECTANGLE || type === CIRCLE || type === DIAMOND) &&
        (x !== xCord || y !== yCord)
      ) {
        let x1 = x,
          y1 = y,
          x2 = xCord,
          y2 = yCord;
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
        StorageService.storeElement(type, x1, y1, x2, y2, cursorCords.current);
        cursorCords.current = [];
      } else if (type === TRIANGLE && (x !== xCord || y !== yCord)) {
        let x1 = x,
          x2 = xCord;
        if (x1 > x2) {
          x1 = xCord;
          x2 = x;
        }
        StorageService.storeElement(
          type,
          x1,
          y,
          x2,
          yCord,
          cursorCords.current
        );
        cursorCords.current = [];
      } else if (
        ([TRIANGLE, ARROW, PENCIL] as string[]).includes(type) &&
        (type === PENCIL || x !== xCord || y !== yCord)
      ) {
        StorageService.storeElement(
          type,
          x,
          y,
          xCord,
          yCord,
          cursorCords.current
        );
        cursorCords.current = [];
      }

      if (type === ADD_IMAGE) {
        setState({ type: PENCIL });
      }

      isDrawing.current = false;
    },
    [type, setState]
  );

  const onWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const canvas = CanvasService.getCanvas();
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (e.metaKey || e.ctrlKey) {
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      CanvasService.zoomAt(x, y, zoomFactor);
    } else {
      CanvasService.panBy(-e.deltaX, -e.deltaY);
    }

    redrawAllElements(CanvasService.getContext());
  }, []);

  // ─── Resize / redraw ─────────────────────────────────────────────

  const handleResize = useCallback(() => {
    redrawCanvas(
      boardRef.current!,
      onPointerDown,
      onPointerUp,
      onPointerMove,
      onWheel
    );
  }, [onPointerDown, onPointerMove, onPointerUp, onWheel]);

  // ─── Tool-change side effects ─────────────────────────────────────

  useEffect(() => {
    startingCords.current = undefined;

    const canvas = CanvasService.getCanvas();
    let input: HTMLInputElement;
    const resetSelection = () => setState({ type: PENCIL });

    const handleLoadedImage = (
      img: HTMLImageElement,
      width: number,
      height: number,
      dataUrl: string,
      fileId: string
    ) => {
      imageDataRef.current = { img, width, height, fileId };
      snapshotRef.current = CanvasService.getContext().getImageData(
        0,
        0,
        canvas.width,
        canvas.height
      );
      IndexedDBService.saveFile({ dataUrl, fileId });
    };

    const handleInputChange = (e: Event) => loadImage(e, handleLoadedImage);

    if (type === CLEAR) {
      StorageService.clear();
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

  // ─── IndexedDB init + window resize ───────────────────────────────

  useEffect(() => {
    let idbRef: IDBDatabase;
    const handleSuccess = (e: Event) => {
      idbRef = (e.target as IDBOpenDBRequest).result;
      handleResize();
    };

    IndexedDBService.open(handleSuccess);
    window.addEventListener("resize", handleResize);

    return () => {
      idbRef?.close();
      window.removeEventListener("resize", handleResize);
    };
  }, [handleResize]);

  // ─── Live-update selected element styles ──────────────────────────

  useEffect(() => {
    if (!selectedElement) return;

    const storage = StorageService.getElements();
    const index = storage.findIndex((el) => el.id === selectedElement);
    if (index < 0) return;

    const item = storage[index];
    item.strokeStyle = strokeStyle;
    item.fillStyle = fillStyle;
    item.lineWidth = lineWidth;
    item.globalAlpha = globalAlpha / 100;
    item.dash = LINE_DASH[strokePattern];
    storage[index] = item;
    StorageService.setElements(storage);
  }, [
    strokeStyle,
    fillStyle,
    lineWidth,
    strokePattern,
    globalAlpha,
    selectedElement,
  ]);

  return { boardRef, type, handleResize };
};
