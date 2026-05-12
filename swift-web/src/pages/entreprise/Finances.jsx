import { useEffect, useState, useCallback } from "react";
import { api } from "../../api/client.js";
import { formatMad } from "../../utils/entreprise.js";

const BG = "#f5f4f0";
const TEXT = "#1a1a1a";
const MUTED = "#888";
const BORDER = "#eeeeee";
const ORANGE = "#FF6B00";

export default function Finances() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const now = new Date();
      const mois = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      const { data: d } = await api.get(`/api/finances?mois=${mois}`);
      setData(d);
    } catch (e) {
      console.error(e);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const exportCsv = () => {
    if (!data?.transactions?.length) return;
    const rows = [["Date", "Commande", "Montant brut (MAD)", "Commission (MAD)", "Net (MAD)"]];
    data.transactions.forEach((t) => {
      rows.push([
        new Date(t.date).toISOString(),
        t.commande,
        String(t.montantBrut),
        String(t.commission),
        String(t.net),
      ]);
    });
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `swift-finances-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const r = data?.resume;

  return (
    <div style={{ padding: "24px 28px 40px", background: BG, minHeight: "100%" }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: TEXT }}>Finances</h1>
        <button
          type="button"
          onClick={exportCsv}
          disabled={!data?.transactions?.length}
          style={{
            padding: "12px 20px",
            borderRadius: 50,
            border: `2px solid ${ORANGE}`,
            background: "#fff",
            color: ORANGE,
            fontWeight: 800,
            cursor: data?.transactions?.length ? "pointer" : "not-allowed",
            fontFamily: "inherit",
          }}
        >
          Exporter CSV
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16, marginTop: 24 }}>
        {loading ? (
          [1, 2, 3].map((i) => <div key={i} style={{ height: 100, background: "#e8e8e8", borderRadius: 16, animation: "skeleton-pulse 1.2s infinite" }} />)
        ) : (
          <>
            <div style={{ background: "#fff", borderRadius: 16, padding: 20, border: `1px solid ${BORDER}` }}>
              <div style={{ fontSize: 13, color: MUTED, fontWeight: 700 }}>Revenus du mois</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: ORANGE, marginTop: 8 }}>{formatMad(r?.revenusBrut)}</div>
            </div>
            <div style={{ background: "#fff", borderRadius: 16, padding: 20, border: `1px solid ${BORDER}` }}>
              <div style={{ fontSize: 13, color: MUTED, fontWeight: 700 }}>Commission Swift ({r?.commissionPercent ?? 12}%)</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: "#3B82F6", marginTop: 8 }}>{formatMad(r?.commissionSwift)}</div>
            </div>
            <div style={{ background: "#fff", borderRadius: 16, padding: 20, border: `1px solid ${BORDER}` }}>
              <div style={{ fontSize: 13, color: MUTED, fontWeight: 700 }}>Net à recevoir</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: "#22C55E", marginTop: 8 }}>{formatMad(r?.netARecevoir)}</div>
            </div>
          </>
        )}
      </div>

      <div style={{ marginTop: 24, background: "#fff", borderRadius: 16, border: `1px solid ${BORDER}`, overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ color: MUTED, textAlign: "left", background: "#fafafa" }}>
              <th style={{ padding: "12px 14px", borderBottom: `1px solid ${BORDER}` }}>Date</th>
              <th style={{ padding: "12px 14px", borderBottom: `1px solid ${BORDER}` }}>Commande</th>
              <th style={{ padding: "12px 14px", borderBottom: `1px solid ${BORDER}` }}>Montant brut</th>
              <th style={{ padding: "12px 14px", borderBottom: `1px solid ${BORDER}` }}>Commission</th>
              <th style={{ padding: "12px 14px", borderBottom: `1px solid ${BORDER}` }}>Net</th>
            </tr>
          </thead>
          <tbody>
            {(data?.transactions || []).map((t) => (
              <tr key={t.id}>
                <td style={{ padding: "12px 14px", borderBottom: `1px solid ${BORDER}`, color: MUTED }}>
                  {t.date ? new Date(t.date).toLocaleDateString("fr-FR") : "—"}
                </td>
                <td style={{ padding: "12px 14px", borderBottom: `1px solid ${BORDER}`, fontWeight: 700, color: ORANGE }}>{t.commande}</td>
                <td style={{ padding: "12px 14px", borderBottom: `1px solid ${BORDER}` }}>{formatMad(t.montantBrut)}</td>
                <td style={{ padding: "12px 14px", borderBottom: `1px solid ${BORDER}` }}>{formatMad(t.commission)}</td>
                <td style={{ padding: "12px 14px", borderBottom: `1px solid ${BORDER}`, fontWeight: 800 }}>{formatMad(t.net)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && !(data?.transactions?.length) ? (
          <div style={{ padding: 32, textAlign: "center", color: MUTED }}>Aucune transaction ce mois-ci.</div>
        ) : null}
      </div>
    </div>
  );
}
