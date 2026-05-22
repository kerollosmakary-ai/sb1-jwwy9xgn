import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createLead } from "../lib/api";
import { canSyncContacts, pickContacts } from "../lib/contacts";
import { useStore } from "../lib/store";
import "../styles/leads.css";

export default function LeadList() {
  const navigate = useNavigate();
  const { user, leads, setLeads, setCurrentLead } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [syncingContacts, setSyncingContacts] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    location: "",
    property_type: "شقة",
    budget_range: "",
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const { data } = await createLead({
      agent_id: user.id,
      ...form,
      status: "New",
      language: "ar",
    });

    if (data) {
      setLeads([data, ...leads]);
      setForm({ name: "", phone: "", email: "", location: "", property_type: "شقة", budget_range: "" });
      setShowForm(false);
    }
  };

  const handleRecord = (lead: typeof leads[0]) => {
    setCurrentLead(lead);
    navigate("/record-call");
  };

  const handleContactSync = async () => {
    if (!user) return;

    if (!canSyncContacts()) {
      setSyncMessage("المتصفح لا يدعم مزامنة جهات الاتصال. استخدم Chrome/Android أو أضف العميل يدوياً.");
      return;
    }

    setSyncingContacts(true);
    setSyncMessage("");

    try {
      const contacts = await pickContacts();
      const existingPhones = new Set(leads.map((lead) => lead.phone));
      const newContacts = contacts.filter((contact) => contact.phone && !existingPhones.has(contact.phone));

      const createdLeads = await Promise.all(
        newContacts.map(async (contact) => {
          const { data } = await createLead({
            agent_id: user.id,
            name: contact.name || contact.phone,
            phone: contact.phone,
            email: contact.email || "",
            status: "New",
            language: "ar",
          });
          return data;
        }),
      );

      const importedLeads = createdLeads.filter((lead): lead is typeof leads[0] => Boolean(lead));
      if (importedLeads.length > 0) setLeads([...importedLeads, ...leads]);
      setSyncMessage(`تمت مزامنة ${importedLeads.length} جهة اتصال`);
    } catch (err) {
      setSyncMessage(err instanceof Error ? err.message : "تعذرت مزامنة جهات الاتصال");
    } finally {
      setSyncingContacts(false);
    }
  };

  return (
    <div className="leads-container">
      <div className="leads-header">
        <h2>العملاء</h2>
        <div className="lead-actions">
          <button onClick={handleContactSync} className="btn btn-secondary" disabled={syncingContacts}>
            {syncingContacts ? "جاري المزامنة..." : "مزامنة جهات الاتصال"}
          </button>
          <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
            {showForm ? "إغلاق" : "+ إضافة"}
          </button>
        </div>
      </div>

      {syncMessage && <div className="sync-message">{syncMessage}</div>}

      {showForm && (
        <form onSubmit={handleAdd} className="lead-form">
          <input
            type="text"
            placeholder="الاسم"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            type="tel"
            placeholder="الهاتف"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="البريد"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            type="text"
            placeholder="الموقع"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
          <select value={form.property_type} onChange={(e) => setForm({ ...form, property_type: e.target.value })}>
            <option value="شقة">شقة</option>
            <option value="فيلا">فيلا</option>
            <option value="أرض">أرض</option>
          </select>
          <input
            type="text"
            placeholder="الميزانية"
            value={form.budget_range}
            onChange={(e) => setForm({ ...form, budget_range: e.target.value })}
          />
          <button type="submit" className="btn btn-success">
            حفظ
          </button>
        </form>
      )}

      <div className="leads-grid">
        {leads.length === 0 ? (
          <p className="empty">لا توجد عملاء</p>
        ) : (
          leads.map((lead) => (
            <div key={lead.id} className="lead-card">
              <div className="card-header">
                <h3>{lead.name}</h3>
                <span className="badge">{lead.status}</span>
              </div>
              <p>☎️ {lead.phone}</p>
              {lead.email && <p>✉️ {lead.email}</p>}
              {lead.location && <p>📍 {lead.location}</p>}
              {lead.property_type && <p>🏠 {lead.property_type}</p>}
              {lead.budget_range && <p>💰 {lead.budget_range}</p>}
              <button
                onClick={() => handleRecord(lead)}
                className="btn btn-primary btn-small"
              >
                🎤 تسجيل
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
