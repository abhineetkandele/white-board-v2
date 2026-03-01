import { useEditBoard } from "../../hooks/useEditBoard";

type EditBoardProps = {
  handleResize: () => void;
};

const EditBoard = ({ handleResize }: EditBoardProps) => {
  const { editCanvasRef, onPointerDown, onPointerUp, onPointerMove } =
    useEditBoard(handleResize);

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
