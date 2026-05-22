import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useStore } from "./lib/store";
import { getCurrentUser } from "./lib/auth";
import { hasTrafficApproval } from "./lib/access";
import AccessApproval from "./pages/AccessApproval";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import RecordCall from "./pages/RecordCall";
import "./styles/global.css";

function App() {
  const { user, setUser } = useStore();
  const [trafficApproved, setTrafficApproved] = useState(hasTrafficApproval);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await getCurrentUser();
      if (data?.user) {
        setUser({ id: data.user.id, email: data.user.email || "", phone: data.user.phone });
      }
    };
    checkAuth();
  }, []);

  if (!trafficApproved) {
    return <AccessApproval onApproved={() => setTrafficApproved(true)} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/auth" />} />
        <Route path="/record-call" element={user ? <RecordCall /> : <Navigate to="/auth" />} />
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/auth" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
