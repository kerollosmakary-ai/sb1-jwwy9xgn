import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendPhoneOtp, signIn, signUp, verifyPhoneOtp } from "../lib/auth";
import { useStore } from "../lib/store";
import "../styles/auth.css";

export default function Auth() {
  const navigate = useNavigate();
  const { setUser } = useStore();
  const [authMode, setAuthMode] = useState<"email" | "phone">("email");
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("error");
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      if (isSignUp) {
        const { error: err } = await signUp(email, password);
        if (err) throw err;
        setMessage("تم التسجيل! يرجى تسجيل الدخول");
        setMessageType("success");
        setIsSignUp(false);
      } else {
        const { data, error: err } = await signIn(email, password);
        if (err) throw err;
        if (data.user) setUser({ id: data.user.id, email: data.user.email || "" });
        navigate("/dashboard");
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "خطأ");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      if (!otpSent) {
        const { error: err } = await sendPhoneOtp(phone);
        if (err) throw err;
        setOtpSent(true);
        setMessage("تم إرسال كود التحقق إلى رقم الموبايل");
        setMessageType("success");
      } else {
        const { data, error: err } = await verifyPhoneOtp(phone, otp);
        if (err) throw err;
        if (data.user) {
          setUser({ id: data.user.id, email: data.user.email || "", phone: data.user.phone || phone });
        }
        navigate("/dashboard");
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "خطأ في تسجيل الدخول بالموبايل");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>نظام إدارة العقارات</h1>
        <p>نظام تحليل المكالمات الذكي</p>

        <div className="auth-tabs">
          <button
            type="button"
            className={authMode === "email" ? "active" : ""}
            onClick={() => {
              setAuthMode("email");
              setMessage("");
            }}
          >
            البريد
          </button>
          <button
            type="button"
            className={authMode === "phone" ? "active" : ""}
            onClick={() => {
              setAuthMode("phone");
              setMessage("");
            }}
          >
            الموبايل
          </button>
        </div>

        {authMode === "email" ? (
          <form onSubmit={handleEmailSubmit}>
            <input
              type="email"
              placeholder="البريد الإلكتروني"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="كلمة المرور"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {message && <div className={`msg ${messageType}`}>{message}</div>}
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? "جاري..." : isSignUp ? "إنشاء حساب" : "تسجيل الدخول"}
            </button>
          </form>
        ) : (
          <form onSubmit={handlePhoneSubmit}>
            <input
              type="tel"
              placeholder="رقم الموبايل بصيغة دولية مثل +201..."
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              disabled={otpSent}
            />
            {otpSent && (
              <input
                type="text"
                inputMode="numeric"
                placeholder="كود التحقق"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            )}
            {message && <div className={`msg ${messageType}`}>{message}</div>}
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? "جاري..." : otpSent ? "تأكيد الكود" : "إرسال كود الموبايل"}
            </button>
          </form>
        )}

        {authMode === "email" && (
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setMessage("");
            }}
            className="toggle"
          >
            {isSignUp ? "تسجيل الدخول" : "إنشاء حساب"}
          </button>
        )}
      </div>
    </div>
  );
}
