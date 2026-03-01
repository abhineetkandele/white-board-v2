import { useContext } from "react";
import { AppContext } from "../../context";
import { StorageService } from "../../services";
import { sidePanelConfig } from "../../config";
import type { ConfigRootType, ConfigType, SectionType } from "../../types";
import Selector from "./Selector";
import Toggle from "./Toggle";
import Range from "./Range";

const sectionComponents: Record<ConfigRootType, SectionType> = {
  selector: Selector,
  toggle: Toggle,
  range: Range,
};

const SidePanel = ({ className = "" }: { className?: string }) => {
  const [{ type, selectedElement }] = useContext(AppContext);

  let activeTool = type;

  if (selectedElement) {
    const storage = StorageService.getElements();
    const index = storage.findIndex((el) => el.id === selectedElement);
    if (index >= 0) activeTool = storage[index].type;
  }

  return (
    <div className={`panel-wrapper ${className}`}>
      {sidePanelConfig.map(
        ({ id, label, type: sectionType, config, min, max, excludedOptions }) => {
          if (excludedOptions.includes(activeTool)) return null;

          const Section = sectionComponents[sectionType as ConfigRootType];

          return (
            <div className="section" key={id}>
              <label>{label}</label>
              <Section config={config as ConfigType[]} id={id} min={min} max={max} />
            </div>
          );
        },
      )}
    </div>
  );
};

export default SidePanel;
