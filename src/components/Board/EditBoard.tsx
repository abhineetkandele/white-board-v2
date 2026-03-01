import { useEditBoard } from "../../hooks/useEditBoard";

type EditBoardProps = {
  handleResize: () => void;
};

const EditBoard = ({ handleResize }: EditBoardProps) => {
  const { editCanvasRef, onPointerDown, onPointerUp, onPointerMove, onWheel } =
    useEditBoard(handleResize);

  return (
    <canvas
      id="edit-mode"
      ref={editCanvasRef}
      onPointerUp={onPointerUp}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onWheel={onWheel}
      onContextMenu={(e) => e.preventDefault()}
    />
  );
};

export default EditBoard;
