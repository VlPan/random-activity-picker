import "./App.css";
import { Outlet } from "react-router-dom";
import { ActivityProvider } from "../contexts/ActivityContext";

function App() {
  return (
    <ActivityProvider>
      <Outlet></Outlet>
    </ActivityProvider>
  );
}

export default App;
