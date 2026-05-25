import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
        return _jsx(AccessApproval, { onApproved: () => setTrafficApproved(true) });
    }
    return (_jsx(BrowserRouter, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/auth", element: _jsx(Auth, {}) }), _jsx(Route, { path: "/dashboard", element: user ? _jsx(Dashboard, {}) : _jsx(Navigate, { to: "/auth" }) }), _jsx(Route, { path: "/record-call", element: user ? _jsx(RecordCall, {}) : _jsx(Navigate, { to: "/auth" }) }), _jsx(Route, { path: "/", element: user ? _jsx(Navigate, { to: "/dashboard" }) : _jsx(Navigate, { to: "/auth" }) })] }) }));
}
export default App;
