import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { BOT_PRESETS, PLUGIN_LABELS, createApiKeyHint, createBotId, loadUserBots, saveUserBots, } from "../lib/bots";
import { createUserBot, deleteUserBot, getUserBots } from "../lib/api";
import { useStore } from "../lib/store";
import "../styles/bots.css";
export default function BotManager() {
    const { user } = useStore();
    const [bots, setBots] = useState([]);
    const [selectedPresetId, setSelectedPresetId] = useState(BOT_PRESETS[0].id);
    const [apiKey, setApiKey] = useState("");
    const [thinkingEnabled, setThinkingEnabled] = useState(true);
    const [searchEnabled, setSearchEnabled] = useState(true);
    const [message, setMessage] = useState("");
    const [loadingBots, setLoadingBots] = useState(false);
    const [savingBot, setSavingBot] = useState(false);
    const selectedPreset = BOT_PRESETS.find((preset) => preset.id === selectedPresetId) || BOT_PRESETS[0];
    useEffect(() => {
        const loadBots = async () => {
            if (!user) {
                setBots(loadUserBots());
                return;
            }
            setLoadingBots(true);
            try {
                const { data, error } = await getUserBots(user.id);
                if (error)
                    throw error;
                setBots(data || []);
                setMessage("");
            }
            catch (err) {
                setBots(loadUserBots());
                setMessage("تعذر تحميل البوتات من قاعدة البيانات، تم عرض النسخة المحلية.");
            }
            finally {
                setLoadingBots(false);
            }
        };
        loadBots();
    }, [user]);
    useEffect(() => {
        if (!selectedPreset.thinkingSupported)
            setThinkingEnabled(false);
        if (!selectedPreset.searchSupported)
            setSearchEnabled(false);
    }, [selectedPreset.id, selectedPreset.searchSupported, selectedPreset.thinkingSupported]);
    const persistLocalBots = (nextBots) => {
        setBots(nextBots);
        saveUserBots(nextBots);
    };
    const handleSubmit = async (event) => {
        event.preventDefault();
        const localBot = {
            id: createBotId(selectedPreset.id),
            presetId: selectedPreset.id,
            apiKeyHint: createApiKeyHint(apiKey),
            thinkingEnabled: selectedPreset.thinkingSupported && thinkingEnabled,
            searchEnabled: selectedPreset.searchSupported && searchEnabled,
            createdAt: new Date().toISOString(),
        };
        setSavingBot(true);
        try {
            if (!user)
                throw new Error("Missing user");
            const { data, error } = await createUserBot(user.id, localBot);
            if (error)
                throw error;
            setBots([data || localBot, ...bots]);
            setMessage("تم حفظ البوت في قاعدة البيانات.");
            setApiKey("");
        }
        catch (err) {
            persistLocalBots([localBot, ...bots]);
            setMessage("تم حفظ البوت محلياً فقط. شغّل migration قاعدة البيانات لحفظه على Supabase.");
            setApiKey("");
        }
        finally {
            setSavingBot(false);
        }
    };
    const handleDelete = async (botId) => {
        const nextBots = bots.filter((bot) => bot.id !== botId);
        setBots(nextBots);
        saveUserBots(nextBots);
        try {
            await deleteUserBot(botId);
            setMessage("");
        }
        catch {
            setMessage("تم حذف البوت من الواجهة، لكن تعذر حذف السجل من قاعدة البيانات.");
        }
    };
    return (_jsxs("div", { className: "bots-container", children: [_jsx("div", { className: "bots-header", children: _jsxs("div", { children: [_jsx("h2", { children: "\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0628\u0648\u062A\u0627\u062A" }), _jsx("p", { children: "\u0627\u0644\u0628\u0648\u062A\u0627\u062A \u0645\u0628\u0646\u064A\u0629 \u0645\u0646 Presets \u0645\u0639\u062A\u0645\u062F\u0629. \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u064A\u0636\u064A\u0641 API key \u0648\u064A\u062E\u062A\u0627\u0631 Thinking/Search \u0641\u0642\u0637." })] }) }), message && _jsx("div", { className: "bot-message", children: message }), _jsxs("div", { className: "bot-layout", children: [_jsxs("section", { className: "bot-builder", children: [_jsx("h3", { children: "\u0625\u0646\u0634\u0627\u0621 \u0628\u0648\u062A" }), _jsxs("form", { onSubmit: handleSubmit, children: [_jsxs("label", { children: ["Preset", _jsx("select", { value: selectedPresetId, onChange: (event) => setSelectedPresetId(event.target.value), children: BOT_PRESETS.map((preset) => (_jsx("option", { value: preset.id, children: preset.name }, preset.id))) })] }), _jsxs("div", { className: "preset-card locked", children: [_jsxs("div", { children: [_jsx("span", { className: "locked-label", children: "Managed by us" }), _jsx("h4", { children: selectedPreset.name }), _jsx("p", { children: selectedPreset.description })] }), _jsxs("dl", { children: [_jsxs("div", { children: [_jsx("dt", { children: "Temperature" }), _jsx("dd", { children: selectedPreset.temperature })] }), _jsxs("div", { children: [_jsx("dt", { children: "Max tokens" }), _jsx("dd", { children: selectedPreset.maxTokens })] }), _jsxs("div", { children: [_jsx("dt", { children: "Thinking" }), _jsx("dd", { children: selectedPreset.thinkingSupported ? "Supported" : "Off" })] })] }), _jsx("div", { className: "prompt-box", children: selectedPreset.systemPrompt }), _jsx("div", { className: "plugin-row", children: selectedPreset.plugins.map((plugin) => (_jsx("span", { className: "plugin-chip", children: PLUGIN_LABELS[plugin] }, plugin))) })] }), _jsxs("label", { children: ["API key", _jsx("input", { type: "password", placeholder: "\u0623\u062F\u062E\u0644 API key \u0627\u0644\u062E\u0627\u0635 \u0628\u0627\u0644\u062A\u0634\u063A\u064A\u0644", value: apiKey, onChange: (event) => setApiKey(event.target.value), required: true })] }), _jsxs("div", { className: "bot-switches", children: [_jsxs("label", { className: !selectedPreset.thinkingSupported ? "disabled" : "", children: [_jsx("input", { type: "checkbox", checked: selectedPreset.thinkingSupported && thinkingEnabled, onChange: (event) => setThinkingEnabled(event.target.checked), disabled: !selectedPreset.thinkingSupported }), "Thinking"] }), _jsxs("label", { className: !selectedPreset.searchSupported ? "disabled" : "", children: [_jsx("input", { type: "checkbox", checked: selectedPreset.searchSupported && searchEnabled, onChange: (event) => setSearchEnabled(event.target.checked), disabled: !selectedPreset.searchSupported }), "Search"] })] }), _jsx("button", { type: "submit", className: "btn btn-primary", disabled: savingBot, children: savingBot ? "جاري الحفظ..." : "إنشاء بوت" })] })] }), _jsxs("section", { className: "bot-list", children: [_jsx("h3", { children: "\u0627\u0644\u0628\u0648\u062A\u0627\u062A \u0627\u0644\u0645\u0646\u0634\u0623\u0629" }), loadingBots ? (_jsx("p", { className: "empty", children: "\u062C\u0627\u0631\u064A \u062A\u062D\u0645\u064A\u0644 \u0627\u0644\u0628\u0648\u062A\u0627\u062A..." })) : bots.length === 0 ? (_jsx("p", { className: "empty", children: "\u0644\u0627 \u062A\u0648\u062C\u062F \u0628\u0648\u062A\u0627\u062A \u0628\u0639\u062F" })) : (bots.map((bot) => {
                                const preset = BOT_PRESETS.find((item) => item.id === bot.presetId);
                                if (!preset)
                                    return null;
                                return (_jsxs("article", { className: "bot-item", children: [_jsxs("div", { children: [_jsx("h4", { children: preset.name }), _jsx("p", { children: preset.description }), _jsxs("div", { className: "bot-meta", children: [_jsxs("span", { children: ["API: ", bot.apiKeyHint] }), _jsxs("span", { children: ["Thinking: ", bot.thinkingEnabled ? "On" : "Off"] }), _jsxs("span", { children: ["Search: ", bot.searchEnabled ? "On" : "Off"] })] })] }), _jsx("button", { onClick: () => handleDelete(bot.id), className: "btn btn-secondary btn-small", children: "\u062D\u0630\u0641" })] }, bot.id));
                            }))] })] })] }));
}
