import { PointerEvent, useContext, useRef } from "react";
import { getCords, getStorageData, setStorageData } from "../utils/utils";
import {
  detectPointLocation,
  isPointerOnArrowCorner,
  isPointerOnRectangleCorner,
  isPointerOnReverseTriangleRectangleCorner,
} from "../utils/detectPointLocation";
import { RectPointsTuple, StrokePattern } from "../types/types";
import { moveRectangle, recreateContext } from "../utils/editElements";
import { TOP_PANEL_OPTIONS, lineDashReverseMapping } from "../utils/constants";
import { AppContext } from "../context";

const {
  RECTANGLE,
  TRIANGLE,
  CIRCLE,
  DIAMOND,
  //   LINE,
  ARROW,
  ADD_IMAGE,
  ADD_TEXT,
  //   PENCIL,
} = TOP_PANEL_OPTIONS;

const EditBoard = ({ handleResize }: { handleResize: () => void }) => {
  const [{ selectedElement }, setState] = useContext(AppContext);
  const editCanvasRef = useRef<HTMLCanvasElement>(null);
  const selectedElementRect = useRef<RectPointsTuple>();
  const isEditing = useRef(false);
  const isResizing = useRef<"tl" | "tr" | "bl" | "br" | undefined>();
  const coords = useRef<{ xCord: number; yCord: number }>();

  const onPointerUp = () => {
    isEditing.current = false;
    isResizing.current = undefined;
  };
  const onPointerDown = (e: PointerEvent<HTMLCanvasElement>) => {
    const { xCord, yCord } = getCords(e, false);
    const editCanvas = editCanvasRef!.current!;
    const index = detectPointLocation(
      xCord,
      yCord,
      selectedElement,
      selectedElementRect.current
    );

    if (index >= 0) {
      const storage = getStorageData();
      const ctx = recreateContext(editCanvas);
      const item = storage.at(-1 - index)!;
      let x1, y1, x2, y2, w, h;

      if (
        item.type === RECTANGLE ||
        item.type === CIRCLE ||
        item.type === DIAMOND ||
        item.type === ARROW ||
        item.type === TRIANGLE
      ) {
        x1 = item.x1;
        y1 = item.y1;
        x2 = item.x2;
        y2 = item.y2;

        h = y2 - y1;
        w = x2 - x1;
      } else {
        //if (item.type === ADD_IMAGE || item.type === ADD_TEXT) {
        x1 = item.x1;
        y1 = item.y1;
        h = item.height;
        w = item.width;

        y2 = h + y1;
        x2 = w + x1;
      }

      const isNegativeWidth = w < 0;
      const isNegativeHeight = h < 0;

      selectedElementRect.current = [
        x1 - (isNegativeWidth ? -5 : 5),
        y1 - (isNegativeHeight ? -5 : 5),
        w + (isNegativeWidth ? -10 : 10),
        h + (isNegativeHeight ? -10 : 10),
      ];

      moveRectangle(ctx, x1, y1, x2, y2, w, h);

      const dashValue = item.dash.toString() as "" | "10,15" | "1,15";

      setState({
        selectedElement: item!.id,
        strokeStyle: item.strokeStyle as string,
        fillStyle: item.fillStyle as string,
        lineWidth: item.lineWidth,
        globalAlpha: item.globalAlpha * 100,
        strokePattern: lineDashReverseMapping[dashValue] as StrokePattern,
      });
      isEditing.current = true;
      coords.current = { xCord, yCord };

      const cursorCornerCheck = isPointerOnRectangleCorner(
        xCord,
        yCord,
        ...selectedElementRect.current!
      );
      if (cursorCornerCheck) {
        isResizing.current = cursorCornerCheck.position;
      }
    } else {
      recreateContext(editCanvas);
      setState({ selectedElement: "" });
      selectedElementRect.current = undefined;
      isResizing.current = undefined;
    }
  };

  const onPointerMove = (e: PointerEvent<HTMLCanvasElement>) => {
    const { xCord, yCord } = getCords(e, false);

    const elIndex = detectPointLocation(xCord, yCord, selectedElement);
    const editCanvas = editCanvasRef!.current!;

    if (elIndex >= 0) {
      editCanvas.style.cursor = "move";
    } else {
      editCanvas.style.cursor = "default";
    }

    const storage = getStorageData();
    const index = storage.findIndex((el) => el.id === selectedElement);

    if (index >= 0) {
      const item = storage[index];
      let cursorCornerCheck;

      if (item.type === TRIANGLE && item.y1 > item.y2) {
        cursorCornerCheck =
          selectedElement &&
          isPointerOnReverseTriangleRectangleCorner(
            xCord,
            yCord,
            ...selectedElementRect.current!
          );
      } else if (item.type === ARROW) {
        const { x1, x2, y1, y2 } = item;

        if ((y1 > y2 && x2 > x1) || (x1 > x2 && y2 > y1)) {
          cursorCornerCheck =
            selectedElement &&
            isPointerOnArrowCorner(
              xCord,
              yCord,
              ...selectedElementRect.current!
            );
        } else {
          cursorCornerCheck =
            selectedElement &&
            isPointerOnRectangleCorner(
              xCord,
              yCord,
              ...selectedElementRect.current!
            );
        }
      } else {
        cursorCornerCheck =
          selectedElement &&
          isPointerOnRectangleCorner(
            xCord,
            yCord,
            ...selectedElementRect.current!
          );
      }

      if (cursorCornerCheck) {
        editCanvas.style.cursor = cursorCornerCheck.cursor;
      }

      if (isEditing.current) {
        const { xCord: x, yCord: y } = coords.current!;

        const xDiff = xCord - x;
        const yDiff = yCord - y;

        const position = isResizing.current;

        if (
          item.type === RECTANGLE ||
          item.type === CIRCLE ||
          item.type === DIAMOND ||
          item.type === ARROW ||
          item.type === TRIANGLE
        ) {
          if (position) {
            if (position === "tl") {
              item.x1 += xDiff;
              item.y1 += yDiff;
            } else if (position === "br") {
              item.x2 += xDiff;
              item.y2 += yDiff;
            } else if (position === "bl") {
              item.x1 += xDiff;
              item.y2 += yDiff;
            } else {
              item.x2 += xDiff;
              item.y1 += yDiff;
            }
          } else {
            item.x1 += xDiff;
            item.x2 += xDiff;
            item.y1 += yDiff;
            item.y2 += yDiff;
          }
        } else if (item.type === ADD_IMAGE) {
          if (position) {
            if (position === "tl") {
              item.x1 += xDiff;
              item.y1 += yDiff;
              item.width -= xDiff;
              item.height -= yDiff;
            } else if (position === "br") {
              item.width += xDiff;
              item.height += yDiff;
            } else if (position === "bl") {
              item.x1 += xDiff;
              item.width -= xDiff;
              item.height += yDiff;
            } else {
              item.width += xDiff;
              item.height -= yDiff;
              item.y1 += yDiff;
            }
          } else {
            item.x1 += xDiff;
            item.y1 += yDiff;
          }
        } else if (item.type === ADD_TEXT) {
          if (position) {
            const aspectRatio = item.width / item.height;
            if (position === "tl") {
              item.x1 += xDiff;
              item.y1 += yDiff;
              item.width -= xDiff;
              item.height = item.width / aspectRatio;
              item.lineWidth -= xDiff / 20;
            } else if (position === "br") {
              item.width += xDiff;
              item.height = item.width / aspectRatio;
              item.lineWidth += xDiff / 20;
            } else if (position === "bl") {
              item.x1 += xDiff;
              item.width -= xDiff;
              item.height = item.width / aspectRatio;
              item.lineWidth -= xDiff / 20;
            } else {
              item.width += xDiff;
              item.height = item.width / aspectRatio;
              item.y1 += yDiff;
              item.lineWidth += xDiff / 20;
            }
          } else {
            item.x1 += xDiff;
            item.y1 += yDiff;
          }
        }

        const { x1, y1, x2, y2, height, width } = item;
        let xa, ya, xb, yb, w, h;
        if (height && width) {
          xa = x1;
          ya = y1;
          h = height;
          w = width;
          xb = x1 + w;
          yb = y1 + h;
        } else {
          h = y2 - y1;
          w = x2 - x1;
          xb = x2;
          yb = y2;
          xa = x1;
          ya = y1;
        }

        const isNegativeWidth = w < 0;
        const isNegativeHeight = h < 0;

        selectedElementRect.current = [
          xa - (isNegativeWidth ? -5 : 5),
          ya - (isNegativeHeight ? -5 : 5),
          w + (isNegativeWidth ? -10 : 10),
          h + (isNegativeHeight ? -10 : 10),
        ];
        if (
          (item.type === TRIANGLE && x2 > xa) ||
          item.type === ARROW ||
          (x2 > xa && y2 > ya) ||
          (height > 0 && width > 0)
        ) {
          storage[index] = item;
          setStorageData(storage);
          handleResize();
          const ctx = recreateContext(editCanvas);
          moveRectangle(ctx, xa, ya, xb, yb, w, h);
          coords.current = { xCord, yCord };
        }
      }
    }
  };

  return (
    <canvas
      id="edit-mode"
      ref={editCanvasRef}
      onPointerUp={onPointerUp}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
    />
  );
};

export default EditBoard;
