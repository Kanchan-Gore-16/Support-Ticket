import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import InboxPage from "./pages/InboxPage";
import StatsPage from "./pages/StatsPage";
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected */}
      <Route element={<ProtectedRoute />}>
        <Route path="/inbox" element={<InboxPage />} />
        <Route path="/stats" element={<StatsPage />} />
      </Route>

      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/inbox" replace />} />
    </Routes>
  );
};

export default App;
