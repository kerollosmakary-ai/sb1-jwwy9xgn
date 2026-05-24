import { supabase } from "./supabase";
function mapUserBot(row) {
    return {
        id: row.id,
        presetId: row.preset_id,
        apiKeyHint: row.api_key_hint,
        thinkingEnabled: row.thinking_enabled,
        searchEnabled: row.search_enabled,
        createdAt: row.created_at,
    };
}
export async function submitAccessRequest(request) {
    return supabase.from("access_requests").insert([
        {
            name: request.name,
            company: request.company,
            phone: request.phone,
            reason: request.reason,
            requested_at: request.requestedAt,
        },
    ]);
}
export async function createLead(lead) {
    return supabase.from("leads").insert([lead]).select().single();
}
export async function getLeads(agentId) {
    return supabase
        .from("leads")
        .select("*")
        .eq("agent_id", agentId)
        .order("created_at", { ascending: false });
}
export async function updateLead(id, updates) {
    return supabase.from("leads").update(updates).eq("id", id).select().single();
}
export async function createCall(call) {
    return supabase.from("calls").insert([call]).select().single();
}
export async function getCalls(agentId) {
    return supabase
        .from("calls")
        .select("*")
        .eq("agent_id", agentId)
        .order("call_date", { ascending: false });
}
export async function getCallsByLead(leadId) {
    return supabase
        .from("calls")
        .select("*")
        .eq("lead_id", leadId)
        .order("call_date", { ascending: false });
}
export async function createAnalysis(analysis) {
    return supabase.from("call_analysis").insert([analysis]).select().single();
}
export async function getAnalysisByCall(callId) {
    return supabase
        .from("call_analysis")
        .select("*")
        .eq("call_id", callId)
        .maybeSingle();
}
export async function updateAnalysis(id, updates) {
    return supabase.from("call_analysis").update(updates).eq("id", id).select().single();
}
export async function createReminder(reminder) {
    return supabase.from("reminders").insert([reminder]).select().single();
}
export async function getReminders(agentId) {
    return supabase
        .from("reminders")
        .select("*")
        .eq("agent_id", agentId)
        .eq("completed", false)
        .order("reminder_date", { ascending: true });
}
export async function updateReminder(id, updates) {
    return supabase.from("reminders").update(updates).eq("id", id).select().single();
}
export async function getUserBots(agentId) {
    const { data, error } = await supabase
        .from("user_bots")
        .select("id,preset_id,api_key_hint,thinking_enabled,search_enabled,created_at")
        .eq("agent_id", agentId)
        .order("created_at", { ascending: false });
    return { data: data ? data.map(mapUserBot) : null, error };
}
export async function createUserBot(agentId, bot) {
    const { data, error } = await supabase
        .from("user_bots")
        .insert([
        {
            agent_id: agentId,
            preset_id: bot.presetId,
            api_key_hint: bot.apiKeyHint,
            thinking_enabled: bot.thinkingEnabled,
            search_enabled: bot.searchEnabled,
        },
    ])
        .select("id,preset_id,api_key_hint,thinking_enabled,search_enabled,created_at")
        .single();
    return { data: data ? mapUserBot(data) : null, error };
}
export async function deleteUserBot(id) {
    return supabase.from("user_bots").delete().eq("id", id);
}
export async function analyzeTranscript(transcript, language = "ar") {
    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze`;
    const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ transcript, language }),
    });
    if (!response.ok)
        throw new Error("Analysis failed");
    return response.json();
}
