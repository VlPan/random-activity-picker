import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import {
  createHashRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import App from "./App.tsx";
import Randomizer from '../pages/randomizer/Randomizer.tsx';
import Inventory from '../pages/inventory/Inventory.tsx';
import Settings from '../pages/settings/Settings.tsx';
import Bills from '../pages/bills/Bills.tsx';
import Shop from '../pages/shop/Shop.tsx';
import { ThemeProvider } from '@mui/material/styles';
import {theme} from './theme.ts';

const router = createHashRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <Navigate to="/randomizer" replace />,
      },
      {
        path: "randomizer",
        element: <Randomizer />,
      },
      {
        path: "inventory",
        element: <Inventory />,
      },
      {
        path: "bills",
        element: <Bills />,
      },
      {
        path: "shop",
        element: <Shop />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider theme={theme}> 
      <RouterProvider router={router} />
    </ThemeProvider>
  </StrictMode>
);
