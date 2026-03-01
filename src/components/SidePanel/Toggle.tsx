import { useContext } from "react";
import { AppContext } from "../../context";
import type { PropsType, StateType } from "../../types";

const Toggle = ({ id }: PropsType) => {
  const [state, setState] = useContext(AppContext);
  const value = state[id as keyof StateType];

  return (
    <div className="toggle">
      <input
        type="checkbox"
        id={id}
        checked={!!value}
        onChange={() => setState({ [id]: !value })}
      />
      <label htmlFor={id}></label>
    </div>
  );
};

export default Toggle;
