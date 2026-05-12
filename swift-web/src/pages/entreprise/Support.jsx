import { useEffect, useState, useCallback } from "react";
import { api } from "../../api/client.js";

const BG = "#f5f4f0";
const TEXT = "#1a1a1a";
const MUTED = "#888";
const BORDER = "#eeeeee";
const ORANGE = "#FF6B00";

const SUJETS = [
  ["commande", "Problème commande"],
  ["facturation", "Facturation"],
  ["technique", "Technique"],
  ["autre", "Autre"],
];

export default function Support() {
  const [sujet, setSujet] = useState("commande");
  const [message, setMessage] = useState("");
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/support");
      setTickets(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const send = async (e) => {
    e.preventDefault();
    setErr("");
    setSending(true);
    try {
      await api.post("/api/support", { sujet, message });
      setMessage("");
      load();
    } catch (e2) {
      setErr(e2.response?.data?.error || e2.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ padding: "24px 28px 40px", background: BG, minHeight: "100%" }}>
      <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: TEXT }}>Support</h1>
      <p style={{ color: MUTED }}>Contactez l&apos;équipe Swift.</p>

      <form
        onSubmit={send}
        style={{
          marginTop: 20,
          background: "#fff",
          borderRadius: 16,
          padding: 24,
          border: `1px solid ${BORDER}`,
          maxWidth: 560,
        }}
      >
        <label style={{ fontSize: 12, fontWeight: 700, color: MUTED }}>Sujet</label>
        <select
          value={sujet}
          onChange={(e) => setSujet(e.target.value)}
          style={{ width: "100%", marginTop: 6, padding: 12, borderRadius: 10, border: `1px solid ${BORDER}`, fontFamily: "inherit", background: "#fff" }}
        >
          {SUJETS.map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
        <label style={{ display: "block", marginTop: 14, fontSize: 12, fontWeight: 700, color: MUTED }}>Message</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={5}
          style={{ width: "100%", marginTop: 6, padding: 12, borderRadius: 10, border: `1px solid ${BORDER}`, fontFamily: "inherit", boxSizing: "border-box" }}
        />
        {err ? <div style={{ color: "#EF4444", marginTop: 8 }}>{err}</div> : null}
        <button
          type="submit"
          disabled={sending}
          style={{
            marginTop: 16,
            padding: "14px 28px",
            borderRadius: 50,
            border: "none",
            background: ORANGE,
            color: "#fff",
            fontWeight: 900,
            cursor: sending ? "wait" : "pointer",
            fontFamily: "inherit",
          }}
        >
          Envoyer
        </button>
      </form>

      <h2 style={{ marginTop: 36, fontSize: 18, fontWeight: 900 }}>Historique</h2>
      {loading ? (
        <div style={{ height: 100, background: "#e8e8e8", borderRadius: 12, marginTop: 12, animation: "skeleton-pulse 1.2s infinite" }} />
      ) : (
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
          {tickets.map((t) => (
            <div
              key={t.id}
              style={{
                background: "#fff",
                borderRadius: 12,
                padding: 16,
                border: `1px solid ${BORDER}`,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                <strong>{t.sujet}</strong>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    padding: "4px 10px",
                    borderRadius: 20,
                    background: t.statut === "resolu" ? "rgba(34,197,94,0.15)" : "rgba(59,130,246,0.15)",
                    color: t.statut === "resolu" ? "#22C55E" : "#3B82F6",
                  }}
                >
                  {t.statut === "resolu" ? "Résolu" : "Ouvert"}
                </span>
              </div>
              <div style={{ fontSize: 13, color: MUTED, marginTop: 6 }}>{t.message}</div>
              <div style={{ fontSize: 12, color: MUTED, marginTop: 8 }}>
                {t.createdAt ? new Date(t.createdAt).toLocaleString("fr-FR") : ""}
              </div>
            </div>
          ))}
          {!tickets.length ? <div style={{ color: MUTED }}>Aucun ticket pour l&apos;instant.</div> : null}
        </div>
      )}
    </div>
  );
}
