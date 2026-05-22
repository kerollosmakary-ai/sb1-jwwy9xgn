import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendPhoneOtp, signIn, signUp, verifyPhoneOtp } from "../lib/auth";
import { useStore } from "../lib/store";
import "../styles/auth.css";
export default function Auth() {
    const navigate = useNavigate();
    const { setUser } = useStore();
    const [authMode, setAuthMode] = useState("email");
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("error");
    const [loading, setLoading] = useState(false);
    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setLoading(true);
        try {
            if (isSignUp) {
                const { error: err } = await signUp(email, password);
                if (err)
                    throw err;
                setMessage("تم التسجيل! يرجى تسجيل الدخول");
                setMessageType("success");
                setIsSignUp(false);
            }
            else {
                const { data, error: err } = await signIn(email, password);
                if (err)
                    throw err;
                if (data.user)
                    setUser({ id: data.user.id, email: data.user.email || "" });
                navigate("/dashboard");
            }
        }
        catch (err) {
            setMessage(err instanceof Error ? err.message : "خطأ");
            setMessageType("error");
        }
        finally {
            setLoading(false);
        }
    };
    const handlePhoneSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setLoading(true);
        try {
            if (!otpSent) {
                const { error: err } = await sendPhoneOtp(phone);
                if (err)
                    throw err;
                setOtpSent(true);
                setMessage("تم إرسال كود التحقق إلى رقم الموبايل");
                setMessageType("success");
            }
            else {
                const { data, error: err } = await verifyPhoneOtp(phone, otp);
                if (err)
                    throw err;
                if (data.user) {
                    setUser({ id: data.user.id, email: data.user.email || "", phone: data.user.phone || phone });
                }
                navigate("/dashboard");
            }
        }
        catch (err) {
            setMessage(err instanceof Error ? err.message : "خطأ في تسجيل الدخول بالموبايل");
            setMessageType("error");
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "auth-container", children: _jsxs("div", { className: "auth-card", children: [_jsx("h1", { children: "\u0646\u0638\u0627\u0645 \u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0639\u0642\u0627\u0631\u0627\u062A" }), _jsx("p", { children: "\u0646\u0638\u0627\u0645 \u062A\u062D\u0644\u064A\u0644 \u0627\u0644\u0645\u0643\u0627\u0644\u0645\u0627\u062A \u0627\u0644\u0630\u0643\u064A" }), _jsxs("div", { className: "auth-tabs", children: [_jsx("button", { type: "button", className: authMode === "email" ? "active" : "", onClick: () => {
                                setAuthMode("email");
                                setMessage("");
                            }, children: "\u0627\u0644\u0628\u0631\u064A\u062F" }), _jsx("button", { type: "button", className: authMode === "phone" ? "active" : "", onClick: () => {
                                setAuthMode("phone");
                                setMessage("");
                            }, children: "\u0627\u0644\u0645\u0648\u0628\u0627\u064A\u0644" })] }), authMode === "email" ? (_jsxs("form", { onSubmit: handleEmailSubmit, children: [_jsx("input", { type: "email", placeholder: "\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A", value: email, onChange: (e) => setEmail(e.target.value), required: true }), _jsx("input", { type: "password", placeholder: "\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631", value: password, onChange: (e) => setPassword(e.target.value), required: true }), message && _jsx("div", { className: `msg ${messageType}`, children: message }), _jsx("button", { type: "submit", disabled: loading, className: "btn btn-primary", children: loading ? "جاري..." : isSignUp ? "إنشاء حساب" : "تسجيل الدخول" })] })) : (_jsxs("form", { onSubmit: handlePhoneSubmit, children: [_jsx("input", { type: "tel", placeholder: "\u0631\u0642\u0645 \u0627\u0644\u0645\u0648\u0628\u0627\u064A\u0644 \u0628\u0635\u064A\u063A\u0629 \u062F\u0648\u0644\u064A\u0629 \u0645\u062B\u0644 +201...", value: phone, onChange: (e) => setPhone(e.target.value), required: true, disabled: otpSent }), otpSent && (_jsx("input", { type: "text", inputMode: "numeric", placeholder: "\u0643\u0648\u062F \u0627\u0644\u062A\u062D\u0642\u0642", value: otp, onChange: (e) => setOtp(e.target.value), required: true })), message && _jsx("div", { className: `msg ${messageType}`, children: message }), _jsx("button", { type: "submit", disabled: loading, className: "btn btn-primary", children: loading ? "جاري..." : otpSent ? "تأكيد الكود" : "إرسال كود الموبايل" })] })), authMode === "email" && (_jsx("button", { onClick: () => {
                        setIsSignUp(!isSignUp);
                        setMessage("");
                    }, className: "toggle", children: isSignUp ? "تسجيل الدخول" : "إنشاء حساب" }))] }) }));
}
