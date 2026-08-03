import { Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Policies from "./pages/Policies";
import Claims from "./pages/Claims";
import Payments from "./pages/Payments";
import Documents from "./pages/Documents";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />

          <Route
            path="dashboard"
            element={
              <ProtectedRoute roles={["ADMIN", "AGENT", "CUSTOMER"]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="customers"
            element={
              <ProtectedRoute roles={["ADMIN", "AGENT"]}>
                <Customers />
              </ProtectedRoute>
            }
          />

          <Route
            path="policies"
            element={
              <ProtectedRoute roles={["ADMIN", "AGENT", "CUSTOMER"]}>
                <Policies />
              </ProtectedRoute>
            }
          />

          <Route
            path="claims"
            element={
              <ProtectedRoute roles={["ADMIN", "AGENT", "CUSTOMER"]}>
                <Claims />
              </ProtectedRoute>
            }
          />

          <Route
            path="payments"
            element={
              <ProtectedRoute roles={["ADMIN", "AGENT", "CUSTOMER"]}>
                <Payments />
              </ProtectedRoute>
            }
          />

          <Route
            path="documents"
            element={
              <ProtectedRoute roles={["ADMIN", "AGENT", "CUSTOMER"]}>
                <Documents />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </>
  );
}

export default App; 