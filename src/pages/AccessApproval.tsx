import { FormEvent, useState } from "react";
import { submitAccessRequest } from "../lib/api";
import { approveTrafficWithCode, getAccessRequest, saveAccessRequest } from "../lib/access";
import "../styles/access-approval.css";

interface Props {
  onApproved: () => void;
}

export default function AccessApproval({ onApproved }: Props) {
  const existingRequest = getAccessRequest();
  const [form, setForm] = useState({
    name: existingRequest?.name || "",
    company: existingRequest?.company || "",
    phone: existingRequest?.phone || "",
    reason: existingRequest?.reason || "",
  });
  const [approvalCode, setApprovalCode] = useState("");
  const [message, setMessage] = useState(existingRequest ? "طلبك محفوظ وينتظر الموافقة" : "");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">("info");
  const [requestingAccess, setRequestingAccess] = useState(false);

  const handleRequest = async (event: FormEvent) => {
    event.preventDefault();
    const request = {
      ...form,
      requestedAt: new Date().toISOString(),
    };

    setRequestingAccess(true);
    saveAccessRequest(request);

    try {
      const { error } = await submitAccessRequest(request);
      if (error) throw error;
      setMessage("تم إرسال طلب الدخول وحفظه في قاعدة البيانات. استخدم كود الموافقة عند استلامه من الفريق.");
      setMessageType("success");
    } catch (err) {
      setMessage(
        "تم حفظ الطلب على هذا الجهاز، لكن تعذر إرساله لقاعدة البيانات. تحقق من إعداد Supabase ثم أعد المحاولة.",
      );
      setMessageType("info");
    } finally {
      setRequestingAccess(false);
    }
  };

  const handleApprove = (event: FormEvent) => {
    event.preventDefault();
    const result = approveTrafficWithCode(approvalCode);
    setMessage(result.message);
    setMessageType(result.approved ? "success" : "error");
    if (result.approved) onApproved();
  };

  return (
    <div className="approval-container">
      <div className="approval-card">
        <div className="approval-intro">
          <span className="approval-badge">Traffic approval required</span>
          <h1>الدخول للنظام يحتاج موافقة</h1>
          <p>
            التطبيق ليس مفتوحاً للعامة. أرسل بياناتك أولاً، ثم أدخل كود الموافقة الذي
            يصدره الفريق.
          </p>
        </div>

        <div className="approval-grid">
          <form onSubmit={handleRequest} className="approval-panel">
            <h2>طلب دخول</h2>
            <input
              type="text"
              placeholder="الاسم"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              required
            />
            <input
              type="text"
              placeholder="الشركة أو الفريق"
              value={form.company}
              onChange={(event) => setForm({ ...form, company: event.target.value })}
              required
            />
            <input
              type="tel"
              placeholder="رقم الموبايل"
              value={form.phone}
              onChange={(event) => setForm({ ...form, phone: event.target.value })}
              required
            />
            <textarea
              placeholder="سبب طلب الدخول"
              value={form.reason}
              onChange={(event) => setForm({ ...form, reason: event.target.value })}
              rows={4}
              required
            />
            <button type="submit" className="btn btn-primary" disabled={requestingAccess}>
              {requestingAccess ? "جاري الإرسال..." : "إرسال الطلب"}
            </button>
          </form>

          <form onSubmit={handleApprove} className="approval-panel">
            <h2>كود الموافقة</h2>
            <p className="approval-note">
              الأكواد تدار من الفريق فقط عبر VITE_TRAFFIC_APPROVAL_CODES، ولا يستطيع
              المستخدم إنشاء موافقة لنفسه.
            </p>
            <input
              type="password"
              placeholder="أدخل كود الموافقة"
              value={approvalCode}
              onChange={(event) => setApprovalCode(event.target.value)}
              required
            />
            <button type="submit" className="btn btn-success">
              فتح النظام
            </button>
          </form>
        </div>

        {message && <div className={`approval-message ${messageType}`}>{message}</div>}
      </div>
    </div>
  );
}
