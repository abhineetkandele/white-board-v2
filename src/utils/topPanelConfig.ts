import Selection from "../assets/selection.svg";
import Rectagle from "../assets/rectangle.svg";
import Diamond from "../assets/diamond.svg";
import Triangle from "../assets/triangle.svg";
import Line from "../assets/line.svg";
import Circle from "../assets/circle.svg";
import Arrow from "../assets/arrow.svg";
import Trash from "../assets/trash.svg";
import Image from "../assets/image-plus.svg";
import Download from "../assets/download.svg";
import Pencil from "../assets/pencil.svg";
import Eraser from "../assets/eraser.svg";
import AddText from "../assets/text.svg";
import { TOP_PANEL_OPTIONS } from "./constants";

export const panelIcons = [
  {
    src: Selection,
    title: TOP_PANEL_OPTIONS.SELECTION,
  },
  {
    src: Rectagle,
    title: TOP_PANEL_OPTIONS.RECTANGLE,
  },
  {
    src: Circle,
    title: TOP_PANEL_OPTIONS.CIRCLE,
  },
  {
    src: Diamond,
    title: TOP_PANEL_OPTIONS.DIAMOND,
  },
  {
    src: Triangle,
    title: TOP_PANEL_OPTIONS.TRIANGLE,
  },
  {
    src: Line,
    title: TOP_PANEL_OPTIONS.LINE,
  },
  {
    src: Arrow,
    title: TOP_PANEL_OPTIONS.ARROW,
  },
  {
    src: AddText,
    title: TOP_PANEL_OPTIONS.ADD_TEXT,
  },
  {
    src: Pencil,
    title: TOP_PANEL_OPTIONS.PENCIL,
  },
  {
    src: Eraser,
    title: TOP_PANEL_OPTIONS.ERASER,
  },
  { key: "separator1" },
  {
    src: Image,
    title: TOP_PANEL_OPTIONS.ADD_IMAGE,
  },
  { key: "separator2" },
  {
    src: Download,
    title: TOP_PANEL_OPTIONS.DOWNLOAD,
  },
  {
    src: Trash,
    title: TOP_PANEL_OPTIONS.CLEAR,
  },
];
