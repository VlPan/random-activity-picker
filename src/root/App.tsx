import "./App.css";
import { Outlet } from "react-router-dom";
import { ActivityProvider } from "../contexts/ActivityContext";
import { RewardProvider } from "../contexts/RewardContext";
import { LayoutProvider } from "../contexts/LayoutContext";
import { UserProvider } from "../contexts/UserContext";
import { Box, CssBaseline } from "@mui/material";
import Sidebar from "../components/layout/Sidebar";

function App() {
  return (
    <ActivityProvider>
      <RewardProvider>
        <LayoutProvider>
          <UserProvider>
            <Box sx={{ display: "flex" }}>
              <CssBaseline />
              <Sidebar />
              <Box component="main" sx={{ flexGrow: 1, p: 3, width: '100%' }}>
                <Outlet />
              </Box>
            </Box>
          </UserProvider>
        </LayoutProvider>
      </RewardProvider>
    </ActivityProvider>
  );
}

export default App;
