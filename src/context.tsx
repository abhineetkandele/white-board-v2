import {
  ReactNode,
  createContext,
  useCallback,
  useEffect,
  useState,
} from "react";
import { StateType, Store } from "./types/types";
import { TOP_PANEL_OPTIONS, TRANSPARENT } from "./utils/constants";

const appState: StateType = {
  type: TOP_PANEL_OPTIONS.PENCIL,
  strokeStyle: "#000000",
  fillStyle: TRANSPARENT,
  lineWidth: 5,
  strokePattern: "Solid",
  globalAlpha: 100,
  selectedElement: "",
};

const getInitialState = (): StateType => {
  const state = localStorage.getItem("state");

  if (state) {
    const parsedState = JSON.parse(state);

    return {
      ...parsedState,
      selectedElement: "",
    };
  }

  return appState;
};

const useStoreData = (): Store => {
  const [state, setState] = useState(getInitialState);

  const modifiedSetState = useCallback((value: Partial<StateType>) => {
    setState!((prevState) => ({ ...prevState, ...value }));
  }, []);

  const resetState = useCallback(() => {
    setState!(appState);
  }, []);

  useEffect(
    () => localStorage.setItem("state", JSON.stringify(state)),
    [state]
  );

  return [state, modifiedSetState, resetState];
};

export const AppContext = createContext<Store>([appState, () => {}, () => {}]);

export const ContextProvider = ({ children }: { children: ReactNode }) => {
  return (
    <AppContext.Provider value={useStoreData()}>{children}</AppContext.Provider>
  );
};
