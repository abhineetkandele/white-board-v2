import Selection from "../assets/selection.svg";
import Rectangle from "../assets/rectangle.svg";
import Diamond from "../assets/diamond.svg";
import Triangle from "../assets/triangle.svg";
import Line from "../assets/line.svg";
import Circle from "../assets/circle.svg";
import Arrow from "../assets/arrow.svg";
import Trash from "../assets/trash.svg";
import ImagePlus from "../assets/image-plus.svg";
import Download from "../assets/download.svg";
import Pencil from "../assets/pencil.svg";
import Eraser from "../assets/eraser.svg";
import AddText from "../assets/text.svg";
import { TOOLS } from "../constants";

export type PanelIcon = {
  src?: string;
  title?: string;
  key?: string;
};

export const topPanelIcons: PanelIcon[] = [
  { src: Selection, title: TOOLS.SELECTION },
  { src: Rectangle, title: TOOLS.RECTANGLE },
  { src: Circle, title: TOOLS.CIRCLE },
  { src: Diamond, title: TOOLS.DIAMOND },
  { src: Triangle, title: TOOLS.TRIANGLE },
  { src: Line, title: TOOLS.LINE },
  { src: Arrow, title: TOOLS.ARROW },
  { src: AddText, title: TOOLS.ADD_TEXT },
  { src: Pencil, title: TOOLS.PENCIL },
  { src: Eraser, title: TOOLS.ERASER },
  { key: "separator1" },
  { src: ImagePlus, title: TOOLS.ADD_IMAGE },
  { key: "separator2" },
  { src: Download, title: TOOLS.DOWNLOAD },
  { src: Trash, title: TOOLS.CLEAR },
];
