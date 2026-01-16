import "./App.css";
import { Outlet } from "react-router-dom";
import { ActivityProvider } from "../contexts/ActivityContext";
import { RewardProvider } from "../contexts/RewardContext";
import { LayoutProvider } from "../contexts/LayoutContext";
import { UserProvider } from "../contexts/UserContext";
import { TodoProvider } from "../contexts/TodoContext";
import { BillProvider } from "../contexts/BillContext";
import { ShopProvider } from "../contexts/ShopContext";
import { ProjectProvider } from "../contexts/ProjectContext";
import { Box, CssBaseline } from "@mui/material";
import Sidebar from "../components/layout/Sidebar";
import { DailyAnketDialog } from "../components/anket/DailyAnketDialog";
import { useAnketCheck } from "../hooks/useAnketCheck";

// Wrapper component that uses the anket hook (must be inside UserProvider)
function AppContent() {
  const { 
    showAnket, 
    missingDays, 
    currentDayIndex, 
    handleSubmit, 
    handleSkipAll,
    currentDayNumber,
    totalDays 
  } = useAnketCheck();

  return (
    <>
      <Box sx={{ display: "flex" }}>
        <CssBaseline />
        <Sidebar />
        <Box component="main" sx={{ flexGrow: 1, p: 3, width: '100%' }}>
          <Outlet />
        </Box>
      </Box>
      <DailyAnketDialog
        open={showAnket}
        missingDays={missingDays}
        currentDayIndex={currentDayIndex}
        onSubmit={handleSubmit}
        onSkipAll={handleSkipAll}
        dayNumber={currentDayNumber}
        totalDaysCount={totalDays}
      />
    </>
  );
}

function App() {
  return (
    <ActivityProvider>
      <RewardProvider>
        <LayoutProvider>
          <UserProvider>
            <BillProvider>
              <ShopProvider>
                <TodoProvider>
                  <ProjectProvider>
                    <AppContent />
                  </ProjectProvider>
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
