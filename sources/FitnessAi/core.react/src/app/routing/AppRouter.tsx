import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "../layout/AppLayout";
import { HomePage } from "../../pages/HomePage";
import { LoginPage } from "../../pages/LoginPage";
import { RegisterPage } from "../../pages/RegisterPage";
import AiTrainingPage from "../../pages/AiTrainingPage";
import TrainingDataPage from "../../pages/TrainingDataPage";
import { PrivateRoute, PublicRoute } from "./RouteGuards";

export const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>
      <Route element={<PrivateRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/ai/training" element={<AiTrainingPage />} />
          <Route path="/training/sessions" element={<TrainingDataPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Route>
    </Routes>
  </BrowserRouter>
);
