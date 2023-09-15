import { sidePanelConfig } from "../utils/sidePanelConfig";
import Range from "./Range";
import Selector from "./Selector";
import Toggle from "./Toggle";
import { ConfigRootType, ConfigType, SectionType } from "../types/types";
import { useContext } from "react";
import { AppContext } from "../context";
import { getStorageData } from "../utils/utils";

const sectionTypes: {
  selector: SectionType;
  toggle: SectionType;
  range: SectionType;
} = {
  selector: Selector,
  toggle: Toggle,
  range: Range,
};

const SidePanel = ({ className = "" }: { className?: string }) => {
  const [{ type, selectedElement }] = useContext(AppContext);

  let selectedTool = type;

  if (selectedElement) {
    const storage = getStorageData();
    const index = storage.findIndex((el) => el.id === selectedElement);
    selectedTool = storage[index].type;
  }

  return (
    <div className={`panel-wrapper ${className}`}>
      {sidePanelConfig.map(
        ({
          id,
          label,
          type,
          config,
          min,
          max,
          excludedOptions,
        }: {
          id: string;
          label: string;
          type: string;
          config?: ConfigType[];
          min?: number | undefined;
          max?: number | undefined;
          excludedOptions: Array<string>;
        }) => {
          const Section = sectionTypes[type as ConfigRootType];

          if (excludedOptions.includes(selectedTool)) return;

          return (
            <div className="section" key={id}>
              <label>{label}</label>

              <Section config={config} id={id} min={min} max={max} />
            </div>
          );
        }
      )}
    </div>
  );
};

export default SidePanel;
