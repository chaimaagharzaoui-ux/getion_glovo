import { useEffect, useState, useCallback } from "react";
import { io } from "socket.io-client";
import { api } from "../../api/client.js";
import StatCard from "../../components/entreprise/StatCard.jsx";
import { statutLabel, statutBadgeStyle, formatMad, formatEurDisplay } from "../../utils/entreprise.js";

const BG = "#f5f4f0";
const TEXT = "#1a1a1a";
const MUTED = "#888";
const BORDER = "#eeeeee";
const ORANGE = "#FF6B00";

export default function Dashboard() {
  const eid = localStorage.getItem("entreprise_id");
  const nom = localStorage.getItem("entreprise_nom") || "Entreprise";
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [toggleBusy, setToggleBusy] = useState(false);

  const load = useCallback(async () => {
    if (!eid) return;
    setErr("");
    try {
      const { data } = await api.get(`/api/entreprises/${eid}/dashboard-stats`);
      setStats(data);
    } catch (e) {
      setErr(e.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  }, [eid]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const url = (import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || "").replace(/\/$/, "") || undefined;
    if (!url || !eid) return undefined;
    const s = io(url, { transports: ["websocket", "polling"] });
    s.emit("entreprise_connectee", { entrepriseId: eid });
    s.on("nouvelle_commande", () => load());
    return () => s.disconnect();
  }, [eid, load]);

  const ouvert = stats?.ouvert ?? true;

  const toggleOuvert = async () => {
    if (!eid) return;
    setToggleBusy(true);
    try {
      await api.put(`/api/entreprises/${eid}/statut`, { ouvert: !ouvert });
      await load();
    } catch (e) {
      setErr(e.response?.data?.error || e.message);
    } finally {
      setToggleBusy(false);
    }
  };

  const pct = stats?.pctVsHier ?? 0;
  const pctStr = pct >= 0 ? `+${pct}%` : `${pct}%`;

  return (
    <div style={{ padding: "24px 28px 40px", background: BG, minHeight: "100%" }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
        <div>
          <div style={{ color: MUTED, fontSize: 14 }}>Bonjour</div>
          <h1 style={{ margin: "4px 0 0", fontSize: 28, fontWeight: 900, color: TEXT }}>
            {nom} 👋
          </h1>
        </div>
        <button
          type="button"
          style={{
            padding: "12px 20px",
            borderRadius: 50,
            border: `2px solid ${ORANGE}`,
            background: "#fff",
            color: ORANGE,
            fontWeight: 800,
            fontSize: 14,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Voir ma page publique →
        </button>
      </div>

      {err ? <div style={{ marginTop: 16, color: "#EF4444", fontWeight: 600 }}>{err}</div> : null}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16, marginTop: 24 }}>
        <StatCard
          title="CA aujourd'hui"
          value={loading ? "" : formatMad(stats?.caAujourdhui)}
          sub={loading ? "" : `${pctStr} vs hier`}
          loading={loading}
        />
        <StatCard
          title="Commandes"
          value={loading ? "" : String(stats?.commandesAujourdhui ?? 0)}
          sub={loading ? "" : `En cours : ${stats?.enCours ?? 0}`}
          loading={loading}
        />
        <StatCard
          title="Note moyenne"
          value={loading ? "" : `${(stats?.noteMoyenne ?? 0).toFixed(1)} ⭐`}
          loading={loading}
        />
        <StatCard
          title="Temps livraison moyen"
          value={loading ? "" : `${stats?.tempsLivraisonMoyen ?? "—"} min`}
          loading={loading}
        />
      </div>

      <div
        className="entreprise-dash-split"
        style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 320px", gap: 20, marginTop: 28, alignItems: "start" }}
      >
        <style>{`
          @media (max-width: 960px) {
            .entreprise-dash-split { grid-template-columns: 1fr !important; }
          }
        `}</style>
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            border: `1px solid ${BORDER}`,
            padding: 20,
            boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
          }}
        >
          <h2 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 900, color: TEXT }}>Commandes récentes</h2>
          {loading ? (
            <div style={{ height: 120, background: "#eee", borderRadius: 12, animation: "skeleton-pulse 1.2s infinite" }} />
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ color: MUTED, textAlign: "left" }}>
                    <th style={{ padding: "10px 8px", borderBottom: `1px solid ${BORDER}` }}>Numéro</th>
                    <th style={{ padding: "10px 8px", borderBottom: `1px solid ${BORDER}` }}>Client</th>
                    <th style={{ padding: "10px 8px", borderBottom: `1px solid ${BORDER}` }}>Montant</th>
                    <th style={{ padding: "10px 8px", borderBottom: `1px solid ${BORDER}` }}>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {(stats?.recent || []).map((r) => {
                    const b = statutBadgeStyle(r.statut);
                    return (
                      <tr key={r.id}>
                        <td style={{ padding: "12px 8px", borderBottom: `1px solid ${BORDER}`, fontWeight: 800, color: ORANGE }}>{r.numero}</td>
                        <td style={{ padding: "12px 8px", borderBottom: `1px solid ${BORDER}`, color: TEXT }}>{r.clientNom}</td>
                        <td style={{ padding: "12px 8px", borderBottom: `1px solid ${BORDER}` }}>{formatEurDisplay(r.montant)}</td>
                        <td style={{ padding: "12px 8px", borderBottom: `1px solid ${BORDER}` }}>
                          <span style={{ padding: "4px 8px", borderRadius: 8, fontWeight: 700, fontSize: 11, background: b.bg, color: b.color }}>
                            {statutLabel(r.statut)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            border: `1px solid ${BORDER}`,
            padding: 20,
            boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
          }}
        >
          <div style={{ fontWeight: 900, fontSize: 15, marginBottom: 12 }}>Statut établissement</div>
          <button
            type="button"
            disabled={toggleBusy || loading}
            onClick={toggleOuvert}
            style={{
              width: "100%",
              padding: "14px 16px",
              borderRadius: 50,
              border: "none",
              background: ouvert ? ORANGE : "#e5e5e5",
              color: ouvert ? "#fff" : TEXT,
              fontWeight: 900,
              fontSize: 14,
              cursor: toggleBusy ? "wait" : "pointer",
              fontFamily: "inherit",
            }}
          >
            {ouvert ? "Ouvert — cliquer pour fermer" : "Fermé — cliquer pour ouvrir"}
          </button>
          <div style={{ marginTop: 16, fontSize: 13, color: MUTED }}>
            <strong style={{ color: TEXT }}>Horaires</strong>
            <div>
              {stats?.horairesDebut ?? "—"} – {stats?.horairesFin ?? "—"}
            </div>
          </div>
          <div style={{ marginTop: 14, fontSize: 13, color: MUTED }}>
            <strong style={{ color: TEXT }}>Taux d&apos;acceptation</strong>
            <div style={{ fontWeight: 800, color: "#22C55E" }}>{stats?.tauxAcceptation ?? "—"}%</div>
          </div>
        </div>
      </div>
    </div>
  );
}
