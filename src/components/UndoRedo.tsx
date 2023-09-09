import Undo from "../assets/undo.svg";
import Redo from "../assets/redo.svg";
import Settings from "../assets/settings.svg";
import useMobile from "../hooks/useMobile";
import SidePanel from "./SidePanel";
import { useState } from "react";
import { handleRedo, handleUndo } from "../utils/undoRedo";

const UndoRedo = ({ handleResize }: { handleResize: () => void }) => {
  const isMobile = useMobile();
  const [showSidePanel, setShowSidePanel] = useState(false);

  const commonProps = {
    className: "tools",
    role: "button",
    tabIndex: 0,
  };

  return (
    <div className={`panel-container bottom ${isMobile ? "mobile" : ""}`}>
      {isMobile && showSidePanel && <SidePanel />}
      <div className="container">
        {isMobile && (
          <img
            src={Settings}
            alt="Settings"
            title="Settings"
            onClick={() => setShowSidePanel(!showSidePanel)}
            {...commonProps}
          />
        )}
        <img
          src={Undo}
          alt="Undo"
          title="Undo"
          onClick={() => handleUndo(handleResize)}
          {...commonProps}
        />
        <img
          src={Redo}
          alt="Redo"
          title="Redo"
          onClick={() => handleRedo(handleResize)}
          {...commonProps}
        />
      </div>
    </div>
  );
};

export default UndoRedo;
