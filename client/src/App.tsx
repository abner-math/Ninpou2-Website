import { BrowserRouter } from "react-router-dom";
import { GlobalFilterList } from "./components/GlobalFilterList";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <GlobalFilterList />
    </BrowserRouter>
  );
}

export default App