import Line from "../assets/line.svg";
import LineDashed from "../assets/line-dashed.svg";
import LineDotted from "../assets/line-dotted.svg";
import { TOOLS } from "../constants";
import { COLOR_PICKER, TRANSPARENT } from "../constants/styles";
import type { ConfigType } from "../types";

const { ERASER, PENCIL, ADD_TEXT, ARROW, SELECTION, DOWNLOAD } = TOOLS;

export type SidePanelSection = {
  id: string;
  label: string;
  type: string;
  config?: ConfigType[];
  min?: number;
  max?: number;
  excludedOptions: string[];
};

export const sidePanelConfig: SidePanelSection[] = [
  {
    id: "strokeStyle",
    label: "Stroke",
    type: "selector",
    config: [
      { color: "#000000" },
      { color: "#e03131" },
      { color: "#2f9e44" },
      { color: "#1971c2" },
      { color: "#f08c00" },
      {},
      { color: COLOR_PICKER },
    ],
    excludedOptions: [ERASER, SELECTION, DOWNLOAD],
  },
  {
    id: "fillStyle",
    label: "Background",
    type: "selector",
    config: [
      { color: TRANSPARENT },
      { color: "#ffc9c9" },
      { color: "#b2f2bb" },
      { color: "#a5d8ff" },
      { color: "#ffec99" },
      {},
      { color: COLOR_PICKER },
    ],
    excludedOptions: [ERASER, SELECTION, PENCIL, ADD_TEXT, ARROW, DOWNLOAD],
  },
  {
    id: "lineWidth",
    label: "Width",
    type: "range",
    min: 1,
    max: 15,
    excludedOptions: [ERASER, SELECTION, DOWNLOAD],
  },
  {
    id: "strokePattern",
    label: "Stroke Style",
    type: "selector",
    config: [
      { icon: Line, title: "Solid" },
      { icon: LineDashed, title: "Dashed" },
      { icon: LineDotted, title: "Dotted" },
    ],
    excludedOptions: [ERASER, SELECTION, ADD_TEXT, DOWNLOAD],
  },
  {
    id: "globalAlpha",
    label: "Opacity",
    type: "range",
    min: 0,
    max: 100,
    excludedOptions: [ERASER, SELECTION, DOWNLOAD],
  },
];
