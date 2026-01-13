import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import App from "./App.tsx";
import Randomizer from '../pages/randomizer/Randomizer.tsx';
import { ThemeProvider } from '@mui/material/styles';
import {theme} from './theme.ts';

// ... imports

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/randomizer" replace />,
  },
  {
    path: "/randomizer",
    element: <App />,
    children: [
      {
        index: true,
        element: <Randomizer />,
      },
    ],
  },
], {
  basename: import.meta.env.BASE_URL
});

// ... render

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider theme={theme}> 
      <RouterProvider router={router} />
    </ThemeProvider>
  </StrictMode>
);
