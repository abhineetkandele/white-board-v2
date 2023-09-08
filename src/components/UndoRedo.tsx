import isEqual from "lodash.isequal";
import Undo from "../assets/undo.svg";
import Redo from "../assets/redo.svg";
import { Data } from "../Config/Data";
import { getStorageData, setStorageData } from "../Config/utils";

const UndoRedo = ({ handleResize }: { handleResize: () => void }) => {
  return (
    <div className="panel-container bottom">
      <img
        src={Undo}
        alt="Undo"
        title="Undo"
        className={`tools`}
        role="button"
        tabIndex={0}
        onClick={() => {
          const item = Data.deleteHistoryItem();

          if (!item) return;

          const storageData = getStorageData().reverse();
          const index = storageData.findIndex(
            (storageItem) => storageItem.id === item.id
          );

          if (index >= 0) {
            if (isEqual(item, storageData[index])) {
              storageData.splice(index, 1);
            } else {
              storageData[index] = item;
            }
          } else {
            storageData.push(item);
          }

          setStorageData(storageData.reverse());
          handleResize();
        }}
      />
      <img
        src={Redo}
        alt="Redo"
        title="Redo"
        className={`tools`}
        role="button"
        tabIndex={0}
        onClick={() => {
          const item = Data.deleteRedoItem();

          if (!item) return;

          const storageData = getStorageData().reverse();
          const index = storageData.findIndex(
            (storageItem) => storageItem.id === item.id
          );
          storageData.reverse();
          if (index >= 0) {
            storageData[index] = item;
          } else {
            storageData.push(item);
          }

          setStorageData(storageData);
          handleResize();
        }}
      />
    </div>
  );
};

export default UndoRedo;
