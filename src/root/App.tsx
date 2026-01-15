import "./App.css";
import { Outlet } from "react-router-dom";
import { ActivityProvider } from "../contexts/ActivityContext";
import { Box, CssBaseline } from "@mui/material";
import Sidebar from "../components/layout/Sidebar";

function App() {
  return (
    <ActivityProvider>
      <Box sx={{ display: "flex" }}>
        <CssBaseline />
        <Sidebar />
        <Box component="main" sx={{ flexGrow: 1, p: 3, width: '100%' }}>
          <Outlet />
        </Box>
      </Box>
    </ActivityProvider>
  );
}

export default App;
