import { TOOLS } from "../../constants";
import { useBoard } from "../../hooks/useBoard";
import EditBoard from "./EditBoard";
import UndoRedo from "../UndoRedo/UndoRedo";

const Board = () => {
  const { boardRef, type, handleResize } = useBoard();

  return (
    <>
      <div id="board" ref={boardRef} />
      {type === TOOLS.SELECTION && <EditBoard handleResize={handleResize} />}
      <UndoRedo handleResize={handleResize} />
    </>
  );
};

export default Board;
