const APPROVAL_KEY = "traffic_approval_status";
const REQUEST_KEY = "traffic_approval_request";

export interface AccessRequest {
  name: string;
  company: string;
  phone: string;
  reason: string;
  requestedAt: string;
}

export function hasTrafficApproval() {
  return localStorage.getItem(APPROVAL_KEY) === "approved";
}

export function saveAccessRequest(request: AccessRequest) {
  localStorage.setItem(REQUEST_KEY, JSON.stringify(request));
}

export function getAccessRequest(): AccessRequest | null {
  const raw = localStorage.getItem(REQUEST_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AccessRequest;
  } catch {
    localStorage.removeItem(REQUEST_KEY);
    return null;
  }
}

export function approveTrafficWithCode(code: string) {
  const configuredCodes = (import.meta.env.VITE_TRAFFIC_APPROVAL_CODES || "")
    .split(",")
    .map((item: string) => item.trim())
    .filter(Boolean);

  if (configuredCodes.length === 0) {
    return {
      approved: false,
      message: "لم يتم إعداد أكواد الموافقة بعد. أضف VITE_TRAFFIC_APPROVAL_CODES في ملف البيئة.",
    };
  }

  if (!configuredCodes.includes(code.trim())) {
    return { approved: false, message: "كود الموافقة غير صحيح" };
  }

  localStorage.setItem(APPROVAL_KEY, "approved");
  return { approved: true, message: "تمت الموافقة على الدخول" };
}

export function clearTrafficApproval() {
  localStorage.removeItem(APPROVAL_KEY);
}
