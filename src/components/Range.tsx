import { useContext } from "react";
import { PropsType, StateType } from "../types/types";
import { AppContext } from "../context";

const Range = ({ id, min, max }: PropsType) => {
  const [state, setState] = useContext(AppContext);

  const value = state[id as keyof StateType];

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
