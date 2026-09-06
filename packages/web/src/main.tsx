import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import DiagramEditor from "./pages/DiagramEditor";
import AcceptInvite from "./pages/AcceptInvite";
import Login from "./pages/Login";
import ErrorBoundary from "./components/ErrorBoundary";
import { ViewModeProvider } from "./store/ViewModeContext";
import "./styles/global.css";

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <ViewModeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/dashboard" element={<App />} />
          <Route path="/login" element={<Login />} />
          <Route path="/project/:projectId" element={<DiagramEditor />} />
          <Route path="/invite/:token" element={<AcceptInvite />} />
        </Routes>
      </BrowserRouter>
    </ViewModeProvider>
  </ErrorBoundary>
);
