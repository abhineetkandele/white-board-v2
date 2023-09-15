import { useContext, useEffect } from "react";
import { PropsType, RangeOptions, StateType } from "../types/types";
import { AppContext } from "../context";
import { getStorageData } from "../utils/utils";

const Range = ({ id, min, max }: PropsType) => {
  const [state, setState] = useContext(AppContext);

  const value = state[id as keyof StateType];

  useEffect(() => {
    if (state.selectedElement) {
      const storage = getStorageData();
      const index = storage.findIndex((el) => el.id === state.selectedElement);
      const newValue = storage[index][id as RangeOptions];

      setState({ [id]: id === "globalAlpha" ? newValue * 100 : newValue });
    }
  }, [id, setState, state.selectedElement]);

  return (
    <div className="range">
      <input
        type="range"
        max={max}
        min={min}
        id={id}
        onChange={(e) => setState({ [id]: e.target.valueAsNumber })}
        value={value as string}
      />
    </div>
  );
};

export default Range;
