import { useEffect, useState, useCallback } from "react";
import { api } from "../../api/client.js";
import CommandeModal from "../../components/entreprise/CommandeModal.jsx";
import { statutLabel, statutBadgeStyle, formatMad } from "../../utils/entreprise.js";

const BG = "#f5f4f0";
const TEXT = "#1a1a1a";
const MUTED = "#888";
const BORDER = "#eeeeee";
const ORANGE = "#FF6B00";

const FILTRE_STATUTS = [
  ["tous", "Tous"],
  ["en_attente", "En attente"],
  ["en_preparation", "En préparation"],
  ["pret", "Prêt"],
  ["en_livraison", "En livraison"],
  ["livre", "Livré"],
  ["annule", "Annulé"],
];

const DATE_FILTRES = [
  ["", "Toutes dates"],
  ["aujourdhui", "Aujourd'hui"],
  ["semaine", "Cette semaine"],
  ["mois", "Ce mois"],
];

const ACTIONS_STATUT = [
  ["en_preparation", "En préparation"],
  ["pret", "Prêt"],
  ["en_livraison", "En livraison"],
  ["livre", "Livré"],
  ["annule", "Annulé"],
];

export default function Commandes() {
  const eid = localStorage.getItem("entreprise_id");
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statut, setStatut] = useState("tous");
  const [date, setDate] = useState("");
  const [modalId, setModalId] = useState(null);
  const pageSize = 10;

  const load = useCallback(async () => {
    if (!eid) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("limit", String(pageSize));
      params.set("page", String(page));
      params.set("sort", "recent");
      if (statut && statut !== "tous") params.set("statut", statut);
      if (date) params.set("date", date);
      if (search.trim()) params.set("search", search.trim());
      const { data } = await api.get(`/api/commandes?${params.toString()}`);
      if (Array.isArray(data)) {
        setItems(data);
        setTotal(data.length);
      } else {
        setItems(data.items || []);
        setTotal(data.total || 0);
      }
    } catch (e) {
      console.error(e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [eid, page, statut, date, search]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [statut, date, search]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const changeStatut = async (id, nouveau) => {
    try {
      await api.put(`/api/commandes/${id}/statut`, { statut: nouveau });
      load();
    } catch (e) {
      alert(e.response?.data?.message || e.response?.data?.error || e.message);
    }
  };

  return (
    <div style={{ padding: "24px 28px 40px", background: BG, minHeight: "100%" }}>
      <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: TEXT }}>Commandes</h1>
      <p style={{ color: MUTED, marginTop: 8 }}>Gérez toutes les commandes de votre établissement.</p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 20, alignItems: "center" }}>
        <input
          placeholder="Recherche n° ou client…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: "1 1 200px",
            maxWidth: 320,
            padding: "12px 14px",
            borderRadius: 12,
            border: `1px solid ${BORDER}`,
            fontFamily: "inherit",
            fontSize: 14,
          }}
        />
        <select
          value={statut}
          onChange={(e) => setStatut(e.target.value)}
          style={{ padding: "12px 14px", borderRadius: 12, border: `1px solid ${BORDER}`, fontFamily: "inherit", background: "#fff" }}
        >
          {FILTRE_STATUTS.map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
        <select
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{ padding: "12px 14px", borderRadius: 12, border: `1px solid ${BORDER}`, fontFamily: "inherit", background: "#fff" }}
        >
          {DATE_FILTRES.map(([v, l]) => (
            <option key={v || "all"} value={v}>
              {l}
            </option>
          ))}
        </select>
      </div>

      <div
        style={{
          marginTop: 20,
          background: "#fff",
          borderRadius: 16,
          border: `1px solid ${BORDER}`,
          overflow: "auto",
          boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
        }}
      >
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: MUTED }}>Chargement…</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 720 }}>
            <thead>
              <tr style={{ color: MUTED, textAlign: "left", background: "#fafafa" }}>
                <th style={{ padding: "12px 10px", borderBottom: `1px solid ${BORDER}` }}>#</th>
                <th style={{ padding: "12px 10px", borderBottom: `1px solid ${BORDER}` }}>Client</th>
                <th style={{ padding: "12px 10px", borderBottom: `1px solid ${BORDER}` }}>Articles</th>
                <th style={{ padding: "12px 10px", borderBottom: `1px solid ${BORDER}` }}>Montant</th>
                <th style={{ padding: "12px 10px", borderBottom: `1px solid ${BORDER}` }}>Statut</th>
                <th style={{ padding: "12px 10px", borderBottom: `1px solid ${BORDER}` }}>Heure</th>
                <th style={{ padding: "12px 10px", borderBottom: `1px solid ${BORDER}` }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((o) => {
                const b = statutBadgeStyle(o.statut);
                const arts = (o.articles || []).map((a) => `${a.nom}×${a.quantite}`).join(", ");
                return (
                  <tr
                    key={o.id}
                    onClick={() => setModalId(o.id)}
                    style={{ cursor: "pointer" }}
                  >
                    <td style={{ padding: "12px 10px", borderBottom: `1px solid ${BORDER}`, fontWeight: 800, color: ORANGE }}>{o.numero}</td>
                    <td style={{ padding: "12px 10px", borderBottom: `1px solid ${BORDER}`, color: TEXT }}>{o.clientNom}</td>
                    <td style={{ padding: "12px 10px", borderBottom: `1px solid ${BORDER}`, color: MUTED, maxWidth: 200 }}>{arts}</td>
                    <td style={{ padding: "12px 10px", borderBottom: `1px solid ${BORDER}` }}>{formatMad(o.montant)}</td>
                    <td style={{ padding: "12px 10px", borderBottom: `1px solid ${BORDER}` }} onClick={(e) => e.stopPropagation()}>
                      <span style={{ padding: "4px 8px", borderRadius: 8, fontWeight: 700, fontSize: 11, background: b.bg, color: b.color }}>
                        {statutLabel(o.statut)}
                      </span>
                    </td>
                    <td style={{ padding: "12px 10px", borderBottom: `1px solid ${BORDER}`, color: MUTED }}>
                      {o.createdAt ? new Date(o.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : "—"}
                    </td>
                    <td style={{ padding: "12px 10px", borderBottom: `1px solid ${BORDER}` }} onClick={(e) => e.stopPropagation()}>
                      <select
                        value=""
                        onChange={(e) => {
                          const v = e.target.value;
                          if (v) changeStatut(o.id, v);
                          e.target.value = "";
                        }}
                        style={{ padding: "8px 10px", borderRadius: 10, border: `1px solid ${BORDER}`, fontFamily: "inherit", fontSize: 12, background: "#fff" }}
                      >
                        <option value="">Changer statut…</option>
                        {ACTIONS_STATUT.map(([v, l]) => (
                          <option key={v} value={v}>
                            {l}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 20, alignItems: "center" }}>
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
          style={{ padding: "10px 16px", borderRadius: 10, border: `1px solid ${BORDER}`, background: "#fff", cursor: page <= 1 ? "not-allowed" : "pointer", fontFamily: "inherit" }}
        >
          Précédent
        </button>
        <span style={{ color: MUTED, fontSize: 14 }}>
          Page {page} / {totalPages} ({total} commandes)
        </span>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
          style={{ padding: "10px 16px", borderRadius: 10, border: `1px solid ${BORDER}`, background: "#fff", cursor: page >= totalPages ? "not-allowed" : "pointer", fontFamily: "inherit" }}
        >
          Suivant
        </button>
      </div>

      <CommandeModal open={!!modalId} commandeId={modalId} onClose={() => setModalId(null)} onUpdated={load} />
    </div>
  );
}
