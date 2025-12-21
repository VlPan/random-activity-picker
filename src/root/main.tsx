import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import { TodosPage } from "../todos/todos-page.tsx";
import App from "./App.tsx";
import {TicTacToe} from '../tic-tac-toe/tic-tac-toe.tsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/tick" replace />,
  },
  {
    path: "/todos",
    element: <App />,
    children: [
      {
        index: true,
        element: <TodosPage />,
      },
    ],
  },
    {
    path: "/tick",
    element: <TicTacToe />,
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
