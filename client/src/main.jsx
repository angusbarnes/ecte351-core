import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import HomePage from "./pages/Home.jsx";
import "./index.css";

import { createBrowserRouter, RouterProvider, redirect } from "react-router-dom";
import { LoginPanel } from "@/components/local/LoginPanel.jsx";

import { useAuth } from "./context/auth.js";
import { DashboardPage } from "./pages/Dashboard.jsx";
import { Button } from "./components/ui/button.jsx";
import { RegisterPanel } from "./components/local/RegisterPanel.jsx";

function routeGuard({ request }) {
  const { isAuth } = useAuth();

  if (isAuth() === false) {
    let params = new URLSearchParams();
    params.set("from", new URL(request.url).pathname);
    return redirect("/login?" + params.toString());
  }
  return null;
}

const {logout} = useAuth();
const router = createBrowserRouter([
  {
    path: "/",
    element: <DashboardPage />,
    loader: routeGuard,
  },
  {
    path: "/",
    element: <HomePage />,
    children: [
      {
        path: "login",
        element: <LoginPanel />,
      },
      {
        path: "register",
        element: <RegisterPanel />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
