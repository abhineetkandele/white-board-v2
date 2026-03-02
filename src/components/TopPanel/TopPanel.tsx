import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context";
import { TOOLS } from "../../constants";
import { exportBoardToImage } from "../../drawing/redraw";
import { topPanelIcons } from "../../config";

const TopPanel = () => {
  const [{ type }, setState] = useContext(AppContext);
  const [downloadType, setDownloadType] = useState("");

  useEffect(() => {
    if (!downloadType) return;
    (async () => {
      // const canvas = await exportBoardToImage(downloadType as "png" | "webp");
      const canvas = await exportBoardToImage();
      const link = document.createElement("a");
      link.download = `${Date.now()}.${downloadType}`;
      link.href = canvas.toDataURL(`image/${downloadType}`);
      link.click();
      link.remove();
      setState({ type: TOOLS.PENCIL });
      setDownloadType("");
    })();
  }, [downloadType, setState]);

  return (
    <div className="top-pane-wrapper">
      <div className="panel-container top">
        {topPanelIcons.map(({ src, title, key }) => {
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

      {type === TOOLS.DOWNLOAD && (
        <div className="panel-container download-container">
          <button
            className="download-options"
            title="webp"
            type="button"
            onClick={() => setDownloadType("webp")}
          >
            webp
          </button>
          <button
            className="download-options"
            title="png"
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
