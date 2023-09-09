import "./App.css";
import Board from "./components/Board";
import SidePanel from "./components/SidePanel";
import TopPanel from "./components/TopPanel";
import { ContextProvider } from "./context";
import useMobile from "./hooks/useMobile";

function App() {
  const isMobile = useMobile();

  return (
    <ContextProvider>
      <TopPanel />
      {!isMobile && <SidePanel className="panel-container side" />}
      <Board />
    </ContextProvider>
  );
}

export default App;
