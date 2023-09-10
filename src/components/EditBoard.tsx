import { PointerEvent, useContext, useRef } from "react";
import { getCords, getStorageData, setStorageData } from "../utils/utils";
import {
  detectPointLocation,
  isPointerOnRectangleCorner,
} from "../utils/detectPointLocation";
import { RectPointsTuple } from "../types/types";
import { moveRectangle, recreateContext } from "../utils/editElements";
// import { AppContext } from "../context";
// import { TOP_PANEL_OPTIONS } from "../utils/constants";

// const {
//   RECTANGLE,
//   TRIANGLE,
//   CIRCLE,
//   DIAMOND,
//   DOWNLOAD,
//   LINE,
//   ARROW,
//   ADD_IMAGE,
//   ADD_TEXT,
//   PENCIL,
//   ERASER,
//   CLEAR,
//   SELECTION,
// } = TOP_PANEL_OPTIONS;

const EditBoard = ({
  editRef,
  handleResize,
}: {
  editRef: React.RefObject<HTMLCanvasElement> | null;
  handleResize: () => void;
}) => {
  // const [{ selectedTool }] = useContext(AppContext);
  const selectedElement = useRef("");
  const selectedElementRect = useRef<RectPointsTuple>();
  const isEditing = useRef(false);
  const isResizing = useRef(false);
  const coords = useRef<{ xCord: number; yCord: number }>();

  const onPointerUp = () => {
    isEditing.current = false;
  };
  const onPointerDown = (e: PointerEvent<HTMLCanvasElement>) => {
    const { xCord, yCord } = getCords(e, false);
    const editCanvas = editRef!.current!;
    const index = detectPointLocation(xCord, yCord, selectedElement.current);

    if (index >= 0) {
      const storage = getStorageData();
      const item = storage.at(-1 - index);
      const { x1, x2, y1, y2 } = item!;

      const h = y2 - y1;
      const w = x2 - x1;

      const ctx = recreateContext(editCanvas);

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
        isResizing.current = true;
      }
    } else {
      recreateContext(editCanvas);
      selectedElement.current = "";
      selectedElementRect.current = undefined;
    }
  };

  const onPointerMove = (e: PointerEvent<HTMLCanvasElement>) => {
    const { xCord, yCord } = getCords(e, false);

    const index = detectPointLocation(xCord, yCord, selectedElement.current);
    const editCanvas = editRef!.current!;

    if (index >= 0) {
      editCanvas.style.cursor = "move";
    } else {
      editCanvas.style.cursor = "default";
    }

    const cursorCornerCheck =
      selectedElement.current &&
      isPointerOnRectangleCorner(xCord, yCord, ...selectedElementRect.current!);

    if (cursorCornerCheck) {
      editCanvas.style.cursor = cursorCornerCheck;
    }

    if (isEditing.current) {
      const { xCord: x, yCord: y } = coords.current!;

      const xDiff = xCord - x;
      const yDiff = yCord - y;

      const storage = getStorageData();
      const index = storage.findIndex(
        (el) => el.id === selectedElement.current
      );
      const item = storage[index];
      item.x1 += xDiff;
      item.x2 += xDiff;
      item.y1 += yDiff;
      item.y2 += yDiff;

      const { x1, x2, y1, y2 } = item;
      const h = y2 - y1;
      const w = x2 - x1;

      storage[index] = item;
      setStorageData(storage);
      handleResize();
      const ctx = recreateContext(editCanvas);
      moveRectangle(ctx, x1, y1, x2, y2, w, h);
      coords.current = { xCord, yCord };
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
