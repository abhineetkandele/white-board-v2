import isEqual from "lodash.isequal";
import { TOOLS } from "../constants";
import { HistoryService, StorageService } from "../services";

const { LINE } = TOOLS;

export const handleUndo = (redraw: () => void): void => {
  const item = HistoryService.popHistory();
  if (!item) return;

  const data = StorageService.getElements().reverse();
  const index = data.findIndex((el) => el.id === item.id);

  if (index >= 0) {
    if (item.type !== LINE && isEqual(item, data[index])) {
      data.splice(index, 1);
    } else {
      data[index] = item;
    }
  } else {
    data.push(item);
  }

  StorageService.setElements(data.reverse());
  redraw();
};

export const handleRedo = (redraw: () => void): void => {
  const item = HistoryService.popRedo();
  if (!item) return;

  const data = StorageService.getElements().reverse();
  const index = data.findIndex((el) => el.id === item.id);
  data.reverse();

  if (index >= 0) {
    data[index] = item;
  } else {
    data.push(item);
  }

  StorageService.setElements(data);
  redraw();
};
