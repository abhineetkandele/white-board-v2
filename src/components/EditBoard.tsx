import { PointerEvent, useRef } from "react";
import { getCords, getStorageData, setStorageData } from "../utils/utils";
import {
  detectPointLocation,
  isPointerOnRectangleCorner,
  isPointerOnReverseTriangleRectangleCorner,
} from "../utils/detectPointLocation";
import { RectPointsTuple } from "../types/types";
import { moveRectangle, recreateContext } from "../utils/editElements";
import { TOP_PANEL_OPTIONS } from "../utils/constants";

const {
  RECTANGLE,
  TRIANGLE,
  CIRCLE,
  DIAMOND,
  //   LINE,
  //   ARROW,
  ADD_IMAGE,
  ADD_TEXT,
  //   PENCIL,
} = TOP_PANEL_OPTIONS;

const EditBoard = ({
  editRef,
  handleResize,
}: {
  editRef: React.RefObject<HTMLCanvasElement> | null;
  handleResize: () => void;
}) => {
  const selectedElement = useRef("");
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
    const editCanvas = editRef!.current!;
    const index = detectPointLocation(
      xCord,
      yCord,
      selectedElement.current,
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
        item.type === TRIANGLE
      ) {
        x1 = item.x1;
        y1 = item.y1;
        x2 = item.x2;
        y2 = item.y2;

        h = y2 - y1;
        w = x2 - x1;
      } else if (item.type === ADD_IMAGE || item.type === ADD_TEXT) {
        x1 = item.x1;
        y1 = item.y1;
        h = item.height;
        w = item.width;

        y2 = h + y1;
        x2 = w + x1;
      } else {
        const r = Math.sqrt(
          Math.pow(item.x1 - item.x2, 2) + Math.pow(item.y1 - item.y2, 2)
        );
        x1 = item.x1 - r;
        y1 = item.y1 - r;
        w = r * 2;
        h = r * 2;
        x2 = x1 + w;
        y2 = y1 + h;
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

      selectedElement.current = item!.id;
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
      selectedElement.current = "";
      selectedElementRect.current = undefined;
      isResizing.current = undefined;
    }
  };

  const onPointerMove = (e: PointerEvent<HTMLCanvasElement>) => {
    const { xCord, yCord } = getCords(e, false);

    const elIndex = detectPointLocation(xCord, yCord, selectedElement.current);
    const editCanvas = editRef!.current!;

    if (elIndex >= 0) {
      editCanvas.style.cursor = "move";
    } else {
      editCanvas.style.cursor = "default";
    }

    const storage = getStorageData();
    const index = storage.findIndex((el) => el.id === selectedElement.current);

    if (index >= 0) {
      const item = storage[index];
      let cursorCornerCheck;

      if (item.type === TRIANGLE && item.y1 > item.y2) {
        cursorCornerCheck =
          selectedElement.current &&
          isPointerOnReverseTriangleRectangleCorner(
            xCord,
            yCord,
            ...selectedElementRect.current!
          );
      } else {
        cursorCornerCheck =
          selectedElement.current &&
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
      ref={editRef}
      onPointerUp={onPointerUp}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
    />
  );
};

export default EditBoard;
