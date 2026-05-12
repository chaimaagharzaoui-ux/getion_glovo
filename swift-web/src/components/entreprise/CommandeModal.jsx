import { useEffect, useState } from "react";
import { api } from "../../api/client.js";
import { statutLabel, statutBadgeStyle } from "../../utils/entreprise.js";

const CARD = "#ffffff";
const BORDER = "#eeeeee";
const TEXT = "#1a1a1a";
const MUTED = "#888";

export default function CommandeModal({ open, commandeId, onClose, onUpdated }) {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !commandeId) return undefined;
    let cancel = false;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const { data: d } = await api.get(`/api/commandes/${commandeId}`);
        if (!cancel) setData(d);
      } catch (e) {
        if (!cancel) setErr(e.response?.data?.error || e.message);
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [open, commandeId]);

  if (!open) return null;

  const badge = data ? statutBadgeStyle(data.statut) : null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        zIndex: 200,
        display: "grid",
        placeItems: "center",
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: CARD,
          borderRadius: 20,
          maxWidth: 520,
          width: "100%",
          maxHeight: "90vh",
          overflow: "auto",
          padding: 24,
          border: `1px solid ${BORDER}`,
          boxShadow: "0 24px 48px rgba(0,0,0,0.15)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: TEXT }}>Détail commande</h2>
          <button
            type="button"
            onClick={onClose}
            style={{
              border: "none",
              background: "#f3f3f3",
              borderRadius: 8,
              width: 36,
              height: 36,
              cursor: "pointer",
              fontSize: 18,
              fontFamily: "inherit",
            }}
          >
            ×
          </button>
        </div>
        {loading ? (
          <p style={{ color: MUTED }}>Chargement…</p>
        ) : err ? (
          <p style={{ color: "#EF4444" }}>{err}</p>
        ) : data ? (
          <>
            <div style={{ marginTop: 16, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontWeight: 900, color: "#FF6B00", fontSize: 18 }}>{data.numero}</span>
              <span
                style={{
                  padding: "4px 10px",
                  borderRadius: 8,
                  fontWeight: 800,
                  fontSize: 12,
                  background: badge.bg,
                  color: badge.color,
                }}
              >
                {statutLabel(data.statut)}
              </span>
            </div>
            <div style={{ fontSize: 13, color: MUTED, marginTop: 8 }}>
              {data.createdAt ? new Date(data.createdAt).toLocaleString("fr-FR") : ""}
            </div>
            <h3 style={{ fontSize: 14, fontWeight: 800, marginTop: 20, color: TEXT }}>Articles</h3>
            <ul style={{ margin: 0, paddingLeft: 18, color: TEXT, fontSize: 14 }}>
              {(data.articles || []).map((a, i) => (
                <li key={i} style={{ marginBottom: 6 }}>
                  {a.nom} × {a.quantite} — {a.prix} MAD
                </li>
              ))}
            </ul>
            <h3 style={{ fontSize: 14, fontWeight: 800, marginTop: 16, color: TEXT }}>Client</h3>
            <div style={{ fontSize: 14, color: TEXT, lineHeight: 1.6 }}>
              <div style={{ fontWeight: 700 }}>{data.clientNom}</div>
              <div style={{ color: MUTED }}>{data.clientTel}</div>
              <div style={{ color: MUTED }}>{data.clientAdresse}</div>
            </div>
            {data.livreurNom ? (
              <div style={{ marginTop: 12, fontSize: 14 }}>
                <strong>Livreur :</strong> {data.livreurNom}
              </div>
            ) : null}
            <div style={{ marginTop: 16, fontWeight: 900, fontSize: 16 }}>Total : {data.montant} MAD</div>
            {data.historiqueStatuts?.length ? (
              <>
                <h3 style={{ fontSize: 14, fontWeight: 800, marginTop: 20, color: TEXT }}>Historique</h3>
                <div style={{ fontSize: 13, color: MUTED }}>
                  {data.historiqueStatuts.map((h, i) => (
                    <div key={i}>
                      {statutLabel(h.statut)} — {h.at ? new Date(h.at).toLocaleString("fr-FR") : ""}
                    </div>
                  ))}
                </div>
              </>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
