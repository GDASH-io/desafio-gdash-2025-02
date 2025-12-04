
import React from "react";
import { createBrowserRouter } from "react-router-dom";
import { AuthPage } from "../features/auth/pages/AuthPage";
import { DashboardPage } from "../features/dashboard/pages/DashboardPage";
import { ForecastPage } from "../features/forecast/pages/ForecastPage";
import { MainLayout } from "../components/layout/MainLayout";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AuthPage />, // sem sidebar
  },
  {
    path: "/dashboard",
    element: <MainLayout><DashboardPage /></MainLayout>,
  },
  {
    path: "/forecast",
    element: <MainLayout><ForecastPage /></MainLayout>,
  },
]);

