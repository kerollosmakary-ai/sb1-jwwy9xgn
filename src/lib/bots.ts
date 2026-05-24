export type BotPlugin = "obsidian" | "linear" | "airtable" | "supabase" | "search";

export interface BotPreset {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  thinkingSupported: boolean;
  searchSupported: boolean;
  plugins: BotPlugin[];
}

export interface UserBot {
  id: string;
  presetId: string;
  apiKey?: string;
  apiKeyHint: string;
  thinkingEnabled: boolean;
  searchEnabled: boolean;
  createdAt: string;
}

const BOTS_KEY = "approved_chat_bots";

export const BOT_PRESETS: BotPreset[] = [
  {
    id: "sales-qualifier",
    name: "مساعد تأهيل العملاء",
    description: "يصنف العميل العقاري ويقترح الخطوة التالية من المكالمة أو الرسائل.",
    systemPrompt:
      "You are a real-estate sales qualification assistant. Score intent, summarize needs, and recommend the next follow-up action in Arabic.",
    temperature: 0.35,
    maxTokens: 1200,
    thinkingSupported: true,
    searchSupported: true,
    plugins: ["supabase", "search"],
  },
  {
    id: "follow-up-operator",
    name: "منسق المتابعة",
    description: "ينظم المهام والتذكيرات بعد المكالمات ويربطها بسير العمل الداخلي.",
    systemPrompt:
      "You are a follow-up operations bot. Convert call outcomes into concise tasks, CRM updates, and reminder actions.",
    temperature: 0.25,
    maxTokens: 900,
    thinkingSupported: false,
    searchSupported: true,
    plugins: ["linear", "airtable", "search"],
  },
  {
    id: "knowledge-advisor",
    name: "مستشار المعرفة",
    description: "يجيب من معرفة الشركة والبيانات المصرح بها فقط.",
    systemPrompt:
      "You are a private knowledge assistant. Answer using approved company notes and CRM context. If the answer is not available, say so clearly.",
    temperature: 0.2,
    maxTokens: 1500,
    thinkingSupported: true,
    searchSupported: true,
    plugins: ["obsidian", "supabase", "search"],
  },
];

export const PLUGIN_LABELS: Record<BotPlugin, string> = {
  obsidian: "Obsidian",
  linear: "Linear",
  airtable: "Airtable",
  supabase: "Supabase",
  search: "Search",
};

export function loadUserBots(): UserBot[] {
  const raw = localStorage.getItem(BOTS_KEY);
  if (!raw) return [];

  try {
    const bots = JSON.parse(raw) as UserBot[];
    return bots.map((bot) => ({
      ...bot,
      apiKeyHint: bot.apiKeyHint || maskApiKey(bot.apiKey || ""),
    }));
  } catch {
    localStorage.removeItem(BOTS_KEY);
    return [];
  }
}

export function saveUserBots(bots: UserBot[]) {
  localStorage.setItem(BOTS_KEY, JSON.stringify(bots));
}

export function createBotId(presetId: string) {
  return `${presetId}-${Date.now()}`;
}

export function maskApiKey(apiKey: string) {
  if (apiKey.length <= 8) return "********";
  return `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}`;
}

export function createApiKeyHint(apiKey: string) {
  return maskApiKey(apiKey.trim());
}
