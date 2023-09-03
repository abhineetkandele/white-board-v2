import "./App.css";
import Board from "./components/Board";
import SidePanel from "./components/SidePanel";
import TopPanel from "./components/TopPanel";
import { ContextProvider } from "./context";

function App() {
  return (
    <ContextProvider>
      <TopPanel />
      <SidePanel />
      <Board />
    </ContextProvider>
  );
}

export default App;
