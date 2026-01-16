import "./App.css";
import { Outlet } from "react-router-dom";
import { ActivityProvider } from "../contexts/ActivityContext";
import { RewardProvider } from "../contexts/RewardContext";
import { LayoutProvider } from "../contexts/LayoutContext";
import { UserProvider } from "../contexts/UserContext";
import { TodoProvider } from "../contexts/TodoContext";
import { BillProvider } from "../contexts/BillContext";
import { ShopProvider } from "../contexts/ShopContext";
import { Box, CssBaseline } from "@mui/material";
import Sidebar from "../components/layout/Sidebar";

function App() {
  return (
    <ActivityProvider>
      <RewardProvider>
        <LayoutProvider>
          <UserProvider>
            <BillProvider>
              <ShopProvider>
                <TodoProvider>
                  <Box sx={{ display: "flex" }}>
                    <CssBaseline />
                    <Sidebar />
                    <Box component="main" sx={{ flexGrow: 1, p: 3, width: '100%' }}>
                      <Outlet />
                    </Box>
                  </Box>
                </TodoProvider>
              </ShopProvider>
            </BillProvider>
          </UserProvider>
        </LayoutProvider>
      </RewardProvider>
    </ActivityProvider>
  );
}

export default App;
