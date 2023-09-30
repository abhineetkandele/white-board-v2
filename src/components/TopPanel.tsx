import { useContext, useEffect, useState } from "react";
import { panelIcons } from "../utils/topPanelConfig";
import { AppContext } from "../context";
import { TOP_PANEL_OPTIONS } from "../utils/constants";
import { Canvas } from "../utils/Canvas";

const TopPanel = () => {
  const [{ type }, setState] = useContext(AppContext);
  const [downloadType, setDownloadType] = useState<string>("");

  useEffect(() => {
    if (downloadType) {
      const canvas = Canvas.getCanvas();
      const link = document.createElement("a");
      link.download = `${Date.now()}.${downloadType}`;
      link.href = canvas.toDataURL(`image/${downloadType}`);
      link.click();
      setState({ type: TOP_PANEL_OPTIONS.PENCIL });
      link.remove();
    }
  }, [downloadType, setState]);

  return (
    <div className="top-pane-wrapper">
      <div className="panel-container top">
        {panelIcons.map(({ src, title, key }) => {
          if (!src) return <div className="seprator verticle" key={key} />;

          return (
            <img
              key={title}
              src={src}
              alt={title}
              title={title}
              className={`tools ${title === type && "selected"}`}
              role="button"
              tabIndex={0}
              onClick={() => setState({ type: title, selectedElement: "" })}
            />
          );
        })}
      </div>
      {type === TOP_PANEL_OPTIONS.DOWNLOAD && (
        <div className="panel-container download-container">
          <button
            className="download-options"
            title={"webp"}
            type="button"
            onClick={() => setDownloadType("webp")}
          >
            webp
          </button>
          <button
            className="download-options"
            title={"png"}
            type="button"
            onClick={() => setDownloadType("png")}
          >
            png
          </button>
        </div>
      )}
    </div>
  );
};

export default TopPanel;
