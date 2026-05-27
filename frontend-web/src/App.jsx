import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./features/auth/pages/LoginPage";
import RegisterPage from "./features/auth/pages/RegisterPage";
import HomePage from "./features/dashboard/Home";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* DEFAULT */}
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />
        {/* LOGIN */}
        <Route
          path="/login"
          element={<LoginPage />}
        />
        {/* REGISTER */}
        <Route
          path="/register"
          element={<RegisterPage />}
        />
        {/* HOME */}
        <Route
          path="/home"
          element={<HomePage />}
        />
      </Routes>
    </BrowserRouter >
  );
}

export default App;