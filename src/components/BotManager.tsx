import { FormEvent, useEffect, useState } from "react";
import {
  BOT_PRESETS,
  PLUGIN_LABELS,
  UserBot,
  createApiKeyHint,
  createBotId,
  loadUserBots,
  saveUserBots,
} from "../lib/bots";
import { createUserBot, deleteUserBot, getUserBots } from "../lib/api";
import { useStore } from "../lib/store";
import "../styles/bots.css";

export default function BotManager() {
  const { user } = useStore();
  const [bots, setBots] = useState<UserBot[]>([]);
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
        if (error) throw error;
        setBots(data || []);
        setMessage("");
      } catch (err) {
        setBots(loadUserBots());
        setMessage("تعذر تحميل البوتات من قاعدة البيانات، تم عرض النسخة المحلية.");
      } finally {
        setLoadingBots(false);
      }
    };

    loadBots();
  }, [user]);

  useEffect(() => {
    if (!selectedPreset.thinkingSupported) setThinkingEnabled(false);
    if (!selectedPreset.searchSupported) setSearchEnabled(false);
  }, [selectedPreset.id, selectedPreset.searchSupported, selectedPreset.thinkingSupported]);

  const persistLocalBots = (nextBots: UserBot[]) => {
    setBots(nextBots);
    saveUserBots(nextBots);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const localBot: UserBot = {
      id: createBotId(selectedPreset.id),
      presetId: selectedPreset.id,
      apiKeyHint: createApiKeyHint(apiKey),
      thinkingEnabled: selectedPreset.thinkingSupported && thinkingEnabled,
      searchEnabled: selectedPreset.searchSupported && searchEnabled,
      createdAt: new Date().toISOString(),
    };

    setSavingBot(true);
    try {
      if (!user) throw new Error("Missing user");
      const { data, error } = await createUserBot(user.id, localBot);
      if (error) throw error;
      setBots([data || localBot, ...bots]);
      setMessage("تم حفظ البوت في قاعدة البيانات.");
      setApiKey("");
    } catch (err) {
      persistLocalBots([localBot, ...bots]);
      setMessage("تم حفظ البوت محلياً فقط. شغّل migration قاعدة البيانات لحفظه على Supabase.");
      setApiKey("");
    } finally {
      setSavingBot(false);
    }
  };

  const handleDelete = async (botId: string) => {
    const nextBots = bots.filter((bot) => bot.id !== botId);
    setBots(nextBots);
    saveUserBots(nextBots);

    try {
      await deleteUserBot(botId);
      setMessage("");
    } catch {
      setMessage("تم حذف البوت من الواجهة، لكن تعذر حذف السجل من قاعدة البيانات.");
    }
  };

  return (
    <div className="bots-container">
      <div className="bots-header">
        <div>
          <h2>إدارة البوتات</h2>
          <p>البوتات مبنية من Presets معتمدة. المستخدم يضيف API key ويختار Thinking/Search فقط.</p>
        </div>
      </div>

      {message && <div className="bot-message">{message}</div>}

      <div className="bot-layout">
        <section className="bot-builder">
          <h3>إنشاء بوت</h3>
          <form onSubmit={handleSubmit}>
            <label>
              Preset
              <select
                value={selectedPresetId}
                onChange={(event) => setSelectedPresetId(event.target.value)}
              >
                {BOT_PRESETS.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="preset-card locked">
              <div>
                <span className="locked-label">Managed by us</span>
                <h4>{selectedPreset.name}</h4>
                <p>{selectedPreset.description}</p>
              </div>
              <dl>
                <div>
                  <dt>Temperature</dt>
                  <dd>{selectedPreset.temperature}</dd>
                </div>
                <div>
                  <dt>Max tokens</dt>
                  <dd>{selectedPreset.maxTokens}</dd>
                </div>
                <div>
                  <dt>Thinking</dt>
                  <dd>{selectedPreset.thinkingSupported ? "Supported" : "Off"}</dd>
                </div>
              </dl>
              <div className="prompt-box">{selectedPreset.systemPrompt}</div>
              <div className="plugin-row">
                {selectedPreset.plugins.map((plugin) => (
                  <span key={plugin} className="plugin-chip">
                    {PLUGIN_LABELS[plugin]}
                  </span>
                ))}
              </div>
            </div>

            <label>
              API key
              <input
                type="password"
                placeholder="أدخل API key الخاص بالتشغيل"
                value={apiKey}
                onChange={(event) => setApiKey(event.target.value)}
                required
              />
            </label>

            <div className="bot-switches">
              <label className={!selectedPreset.thinkingSupported ? "disabled" : ""}>
                <input
                  type="checkbox"
                  checked={selectedPreset.thinkingSupported && thinkingEnabled}
                  onChange={(event) => setThinkingEnabled(event.target.checked)}
                  disabled={!selectedPreset.thinkingSupported}
                />
                Thinking
              </label>
              <label className={!selectedPreset.searchSupported ? "disabled" : ""}>
                <input
                  type="checkbox"
                  checked={selectedPreset.searchSupported && searchEnabled}
                  onChange={(event) => setSearchEnabled(event.target.checked)}
                  disabled={!selectedPreset.searchSupported}
                />
                Search
              </label>
            </div>

            <button type="submit" className="btn btn-primary" disabled={savingBot}>
              {savingBot ? "جاري الحفظ..." : "إنشاء بوت"}
            </button>
          </form>
        </section>

        <section className="bot-list">
          <h3>البوتات المنشأة</h3>
          {loadingBots ? (
            <p className="empty">جاري تحميل البوتات...</p>
          ) : bots.length === 0 ? (
            <p className="empty">لا توجد بوتات بعد</p>
          ) : (
            bots.map((bot) => {
              const preset = BOT_PRESETS.find((item) => item.id === bot.presetId);
              if (!preset) return null;

              return (
                <article key={bot.id} className="bot-item">
                  <div>
                    <h4>{preset.name}</h4>
                    <p>{preset.description}</p>
                    <div className="bot-meta">
                      <span>API: {bot.apiKeyHint}</span>
                      <span>Thinking: {bot.thinkingEnabled ? "On" : "Off"}</span>
                      <span>Search: {bot.searchEnabled ? "On" : "Off"}</span>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(bot.id)} className="btn btn-secondary btn-small">
                    حذف
                  </button>
                </article>
              );
            })
          )}
        </section>
      </div>
    </div>
  );
}
