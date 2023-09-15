import { useContext, useEffect } from "react";
import {
  ConfigObjType,
  PropsType,
  SelectorOptions,
  StateType,
} from "../types/types";
import { AppContext } from "../context";
import { COLOR_PICKER, lineDashReverseMapping } from "../utils/constants";
import { getStorageData } from "../utils/utils";

const Selector = ({ config, id }: PropsType) => {
  const [state, setState] = useContext(AppContext);

  const value = state[id as keyof StateType];

  useEffect(() => {
    if (state.selectedElement) {
      const storage = getStorageData();
      const index = storage.findIndex((el) => el.id === state.selectedElement);
      let newValue;

      if (id === "strokePattern") {
        const dashValue = storage[index].dash.toString() as
          | ""
          | "10,15"
          | "1,15";

        newValue = lineDashReverseMapping[dashValue];
      } else {
        newValue = storage[index][id as SelectorOptions];
      }

      setState({ [id]: newValue });
    }
  }, [id, setState, state.selectedElement]);

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
