const APPROVAL_KEY = "traffic_approval_status";
const REQUEST_KEY = "traffic_approval_request";

export interface AccessRequest {
  name: string;
  company: string;
  phone: string;
  reason: string;
  requestedAt: string;
}

function getStorage() {
  try {
    return typeof window !== "undefined" ? window.localStorage : null;
  } catch {
    return null;
  }
}

export function hasTrafficApproval() {
  return getStorage()?.getItem(APPROVAL_KEY) === "approved";
}

export function saveAccessRequest(request: AccessRequest) {
  getStorage()?.setItem(REQUEST_KEY, JSON.stringify(request));
}

export function getAccessRequest(): AccessRequest | null {
  const storage = getStorage();
  const raw = storage?.getItem(REQUEST_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AccessRequest;
  } catch {
    storage?.removeItem(REQUEST_KEY);
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

  getStorage()?.setItem(APPROVAL_KEY, "approved");
  return { approved: true, message: "تمت الموافقة على الدخول" };
}

export function clearTrafficApproval() {
  getStorage()?.removeItem(APPROVAL_KEY);
}
