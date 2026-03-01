import {
  ReactNode,
  createContext,
  useCallback,
  useEffect,
  useState,
} from "react";
import type { StateType, Store } from "./types";
import { TOOLS } from "./constants";
import { TRANSPARENT } from "./constants/styles";

const DEFAULT_STATE: StateType = {
  type: TOOLS.PENCIL,
  strokeStyle: "#000000",
  fillStyle: TRANSPARENT,
  lineWidth: 5,
  strokePattern: "Solid",
  globalAlpha: 100,
  selectedElement: "",
};

const STORAGE_KEY = "state";

const getInitialState = (): StateType => {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (raw) {
    const parsed = JSON.parse(raw);
    return { ...parsed, selectedElement: "" };
  }

  return DEFAULT_STATE;
};

const useStoreData = (): Store => {
  const [state, setState] = useState(getInitialState);

  const updateState = useCallback((value: Partial<StateType>) => {
    setState((prev) => ({ ...prev, ...value }));
  }, []);

  const resetState = useCallback(() => {
    setState(DEFAULT_STATE);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  return [state, updateState, resetState];
};

export const AppContext = createContext<Store>([
  DEFAULT_STATE,
  () => {},
  () => {},
]);

export const ContextProvider = ({ children }: { children: ReactNode }) => {
  return (
    <AppContext.Provider value={useStoreData()}>{children}</AppContext.Provider>
  );
};
