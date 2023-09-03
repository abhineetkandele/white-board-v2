import { useContext } from "react";
import { panelIcons } from "../Config/TopPanel";
import { AppContext } from "../context";

const TopPanel = () => {
  const [{ selectedTool }, setState] = useContext(AppContext);

  return (
    <div className="panel-container top">
      {panelIcons.map(({ src, title, key }) => {
        if (!src) return <div className="seprator verticle" key={key} />;

        return (
          <img
            key={title}
            src={src}
            alt={title}
            title={title}
            className={`tools ${title === selectedTool && "selected"}`}
            role="button"
            tabIndex={0}
            onClick={() => setState({ selectedTool: title })}
          />
        );
      })}
    </div>
  );
};

export default TopPanel;
