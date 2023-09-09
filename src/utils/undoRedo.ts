import isEqual from "lodash.isequal";
import { Data } from "./Data";
import { getStorageData, setStorageData } from "./utils";
import { TOP_PANEL_OPTIONS } from "./constants";

const { LINE } = TOP_PANEL_OPTIONS;

export const handleUndo = (handleResize: () => void) => {
  const item = Data.deleteHistoryItem();

  if (!item) return;

  const storageData = getStorageData().reverse();
  const index = storageData.findIndex(
    (storageItem) => storageItem.id === item.id
  );

  if (index >= 0) {
    if (item.type !== LINE && isEqual(item, storageData[index])) {
      storageData.splice(index, 1);
    } else {
      storageData[index] = item;
    }
  } else {
    storageData.push(item);
  }

  setStorageData(storageData.reverse());
  handleResize();
};

export const handleRedo = (handleResize: () => void) => {
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
};
