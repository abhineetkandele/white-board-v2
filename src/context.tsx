import {
  ReactNode,
  createContext,
  useCallback,
  useEffect,
  useState,
} from "react";
import { StateType, Store } from "./types/types";
import { TRANSPARENT } from "./Config/SidePanel";
import { TOP_PANEL_OPTIONS } from "./Config/TopPanel";

const appState = {
  selectedTool: TOP_PANEL_OPTIONS.PENCIL,
  color: "#000000",
  backgroundColor: TRANSPARENT,
  width: 5,
  strokeStyle: "Solid",
  opacity: 100,
};

const getInitialState = (): StateType => {
  const state = localStorage.getItem("state");

  if (state) {
    return JSON.parse(state);
  }

  return appState;
};

const useStoreData = (): Store => {
  const [state, setState] = useState(getInitialState);

  const modifiedSetState = useCallback((value: Partial<StateType>) => {
    setState!((prevState) => ({ ...prevState, ...value }));
  }, []);

  useEffect(
    () => localStorage.setItem("state", JSON.stringify(state)),
    [state]
  );

  return [state, modifiedSetState];
};

export const AppContext = createContext<Store>([appState, () => {}]);

export const ContextProvider = ({ children }: { children: ReactNode }) => {
  return (
    <AppContext.Provider value={useStoreData()}>{children}</AppContext.Provider>
  );
};
