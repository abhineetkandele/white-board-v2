import { useContext, useEffect } from "react";
import { AppContext } from "../../context";
import { StorageService } from "../../services";
import type { PropsType, RangeOptions, StateType } from "../../types";

const Range = ({ id, min, max }: PropsType) => {
  const [state, setState] = useContext(AppContext);
  const value = state[id as keyof StateType];

  useEffect(() => {
    if (!state.selectedElement) return;

    const storage = StorageService.getElements();
    const index = storage.findIndex((el) => el.id === state.selectedElement);
    if (index < 0) return;

    const newValue = storage[index][id as RangeOptions];
    setState({ [id]: id === "globalAlpha" ? newValue * 100 : newValue });
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
