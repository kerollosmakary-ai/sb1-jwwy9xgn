import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { approveTrafficWithCode, getAccessRequest, saveAccessRequest } from "../lib/access";
import "../styles/access-approval.css";
export default function AccessApproval({ onApproved }) {
    const existingRequest = getAccessRequest();
    const [form, setForm] = useState({
        name: existingRequest?.name || "",
        company: existingRequest?.company || "",
        phone: existingRequest?.phone || "",
        reason: existingRequest?.reason || "",
    });
    const [approvalCode, setApprovalCode] = useState("");
    const [message, setMessage] = useState(existingRequest ? "طلبك محفوظ وينتظر الموافقة" : "");
    const [messageType, setMessageType] = useState("info");
    const handleRequest = (event) => {
        event.preventDefault();
        saveAccessRequest({
            ...form,
            requestedAt: new Date().toISOString(),
        });
        setMessage("تم إرسال طلب الدخول. استخدم كود الموافقة عند استلامه من الفريق.");
        setMessageType("success");
    };
    const handleApprove = (event) => {
        event.preventDefault();
        const result = approveTrafficWithCode(approvalCode);
        setMessage(result.message);
        setMessageType(result.approved ? "success" : "error");
        if (result.approved)
            onApproved();
    };
    return (_jsx("div", { className: "approval-container", children: _jsxs("div", { className: "approval-card", children: [_jsxs("div", { className: "approval-intro", children: [_jsx("span", { className: "approval-badge", children: "Traffic approval required" }), _jsx("h1", { children: "\u0627\u0644\u062F\u062E\u0648\u0644 \u0644\u0644\u0646\u0638\u0627\u0645 \u064A\u062D\u062A\u0627\u062C \u0645\u0648\u0627\u0641\u0642\u0629" }), _jsx("p", { children: "\u0627\u0644\u062A\u0637\u0628\u064A\u0642 \u0644\u064A\u0633 \u0645\u0641\u062A\u0648\u062D\u0627\u064B \u0644\u0644\u0639\u0627\u0645\u0629. \u0623\u0631\u0633\u0644 \u0628\u064A\u0627\u0646\u0627\u062A\u0643 \u0623\u0648\u0644\u0627\u064B\u060C \u062B\u0645 \u0623\u062F\u062E\u0644 \u0643\u0648\u062F \u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629 \u0627\u0644\u0630\u064A \u064A\u0635\u062F\u0631\u0647 \u0627\u0644\u0641\u0631\u064A\u0642." })] }), _jsxs("div", { className: "approval-grid", children: [_jsxs("form", { onSubmit: handleRequest, className: "approval-panel", children: [_jsx("h2", { children: "\u0637\u0644\u0628 \u062F\u062E\u0648\u0644" }), _jsx("input", { type: "text", placeholder: "\u0627\u0644\u0627\u0633\u0645", value: form.name, onChange: (event) => setForm({ ...form, name: event.target.value }), required: true }), _jsx("input", { type: "text", placeholder: "\u0627\u0644\u0634\u0631\u0643\u0629 \u0623\u0648 \u0627\u0644\u0641\u0631\u064A\u0642", value: form.company, onChange: (event) => setForm({ ...form, company: event.target.value }), required: true }), _jsx("input", { type: "tel", placeholder: "\u0631\u0642\u0645 \u0627\u0644\u0645\u0648\u0628\u0627\u064A\u0644", value: form.phone, onChange: (event) => setForm({ ...form, phone: event.target.value }), required: true }), _jsx("textarea", { placeholder: "\u0633\u0628\u0628 \u0637\u0644\u0628 \u0627\u0644\u062F\u062E\u0648\u0644", value: form.reason, onChange: (event) => setForm({ ...form, reason: event.target.value }), rows: 4, required: true }), _jsx("button", { type: "submit", className: "btn btn-primary", children: "\u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0637\u0644\u0628" })] }), _jsxs("form", { onSubmit: handleApprove, className: "approval-panel", children: [_jsx("h2", { children: "\u0643\u0648\u062F \u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629" }), _jsx("p", { className: "approval-note", children: "\u0627\u0644\u0623\u0643\u0648\u0627\u062F \u062A\u062F\u0627\u0631 \u0645\u0646 \u0627\u0644\u0641\u0631\u064A\u0642 \u0641\u0642\u0637 \u0639\u0628\u0631 VITE_TRAFFIC_APPROVAL_CODES\u060C \u0648\u0644\u0627 \u064A\u0633\u062A\u0637\u064A\u0639 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0625\u0646\u0634\u0627\u0621 \u0645\u0648\u0627\u0641\u0642\u0629 \u0644\u0646\u0641\u0633\u0647." }), _jsx("input", { type: "password", placeholder: "\u0623\u062F\u062E\u0644 \u0643\u0648\u062F \u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629", value: approvalCode, onChange: (event) => setApprovalCode(event.target.value), required: true }), _jsx("button", { type: "submit", className: "btn btn-success", children: "\u0641\u062A\u062D \u0627\u0644\u0646\u0638\u0627\u0645" })] })] }), message && _jsx("div", { className: `approval-message ${messageType}`, children: message })] }) }));
}
