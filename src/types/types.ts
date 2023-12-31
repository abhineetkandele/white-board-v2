export type ConfigRootType = "selector" | "toggle" | "range";

export type ConfigType =
  | { color?: string }
  | { type?: string }
  | { icon?: string }
  | object;

export type ConfigObjType = {
  color?: string;
  type?: string;
  icon?: string;
  title?: string;
};

export type PropsType = {
  config?: ConfigType[];
  id: string;
  min?: number;
  max?: number;
};

export type SectionType = (props: PropsType) => JSX.Element;

export type StrokePattern = "Solid" | "Dashed" | "Dotted";

export type StateType = {
  type: string;
  strokeStyle: string;
  fillStyle: string;
  lineWidth: number;
  strokePattern: StrokePattern;
  globalAlpha: number;
  selectedElement: string;
};

export type Store = [
  StateType,
  (value: Partial<StateType>) => void,
  () => void
];

export type Coordinates = { x: number; y: number };

export type BoardElement = {
  id: string;
  type: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  dash: number[];
  lineWidth: number;
  globalAlpha: number;
  strokeStyle: string | CanvasGradient | CanvasPattern;
  fillStyle: string | CanvasGradient | CanvasPattern;
  path: number[][];
  text: string;
  width: number;
  height: number;
  fileId: string;
};

export type RectPointsTuple = [number, number, number, number];

export type RangeOptions = "lineWidth" | "globalAlpha";

export type SelectorOptions = "strokeStyle" | "fillStyle";
