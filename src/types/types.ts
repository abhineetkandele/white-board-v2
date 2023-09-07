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

export type StateType = {
  selectedTool: string;
  color: string;
  backgroundColor: string;
  width: number;
  strokeStyle: string;
  opacity: number;
};

export type Store = [StateType, (value: Partial<StateType>) => void];

export type Coordinates = { x: number; y: number };
