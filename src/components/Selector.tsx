import { useContext } from "react";
import { ConfigObjType, PropsType, StateType } from "../types/types";
import { AppContext } from "../context";
import { COLOR_PICKER } from "../utils/constants";

const Selector = ({ config, id }: PropsType) => {
  const [state, setState] = useContext(AppContext);

  const value = state[id as keyof StateType];

  return (
    <div className="options" id={id}>
      {config?.map(({ color, icon, title }: ConfigObjType) => {
        if (color) {
          return color === COLOR_PICKER ? (
            <div className="color-picker" key={color}>
              <label
                className="tools box"
                style={{ backgroundColor: value as string }}
                title="Color Picker"
                htmlFor={`${id}-color-picker`}
              />
              <input
                type="color"
                id={`${id}-color-picker`}
                onChange={(e) => setState({ [id]: e.target.value })}
              />
            </div>
          ) : (
            <button
              key={color}
              className={`tools box ${color === value && "selected"}`}
              style={{ backgroundColor: color }}
              title={color}
              type="button"
              onClick={() => setState({ [id]: color })}
            />
          );
        } else if (icon) {
          return (
            <img
              key={title}
              src={icon}
              alt={title}
              title={title}
              className={`tools ${title === value && "selected"}`}
              role="button"
              tabIndex={0}
              onClick={() => setState({ [id]: title })}
            />
          );
        } else {
          return <div className="seprator verticle" key="" />;
        }
      })}
    </div>
  );
};

export default Selector;
