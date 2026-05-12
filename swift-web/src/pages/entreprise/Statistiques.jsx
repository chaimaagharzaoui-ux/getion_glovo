import { useEffect, useState, useCallback } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { api } from "../../api/client.js";
import { formatMad } from "../../utils/entreprise.js";

const BG = "#f5f4f0";
const TEXT = "#1a1a1a";
const MUTED = "#888";
const BORDER = "#eeeeee";
const ORANGE = "#FF6B00";

const PERIODES = [
  ["semaine", "Cette semaine"],
  ["mois", "Ce mois"],
  ["trimestre", "Ce trimestre"],
  ["annee", "Cette année"],
];

const COLORS = ["#22C55E", "#EF4444", "#3B82F6", "#FF6B00", "#a855f7"];

export default function Statistiques() {
  const [periode, setPeriode] = useState("mois");
  const [ca, setCa] = useState({ labels: [], values: [] });
  const [cmd, setCmd] = useState(null);
  const [top, setTop] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!eid) return;
    setLoading(true);
    try {
      const [rCa, rCmd, rTop] = await Promise.all([
        api.get(`/api/stats/ca?periode=${periode}`),
        api.get(`/api/stats/commandes`),
        api.get(`/api/stats/top-produits`),
      ]);
      const labels = rCa.data.labels || [];
      const values = rCa.data.values || [];
      setCa(
        labels.map((l, i) => ({
          name: l.slice(5),
          ca: values[i] || 0,
        }))
      );
      setCmd(rCmd.data);
      setTop(rTop.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [periode]);

  useEffect(() => {
    load();
  }, [load]);

  const pieData = cmd
    ? [
        { name: "Livré", value: cmd.livre || 0 },
        { name: "Annulé", value: cmd.annule || 0 },
        { name: "En cours", value: cmd.en_cours || 0 },
      ].filter((x) => x.value > 0)
    : [];

  const totalCmd = (cmd?.livre || 0) + (cmd?.annule || 0) + (cmd?.en_cours || 0);
  const caTotal = ca.reduce((s, x) => s + (x.ca || 0), 0);
  const panierMoyen = totalCmd > 0 ? Math.round((caTotal / totalCmd) * 100) / 100 : 0;
  const tauxAnnul =
    totalCmd > 0 ? Math.round(((cmd?.annule || 0) / totalCmd) * 1000) / 10 : 0;

  return (
    <div style={{ padding: "24px 28px 40px", background: BG, minHeight: "100%" }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: TEXT }}>Statistiques</h1>
        <select
          value={periode}
          onChange={(e) => setPeriode(e.target.value)}
          style={{ padding: "12px 16px", borderRadius: 12, border: `1px solid ${BORDER}`, fontFamily: "inherit", background: "#fff", fontWeight: 700 }}
        >
          {PERIODES.map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, marginTop: 24 }}>
        {[
          ["Total commandes", loading ? "—" : String(totalCmd)],
          ["CA période", loading ? "—" : formatMad(caTotal)],
          ["Panier moyen", loading ? "—" : formatMad(panierMoyen)],
          ["Taux annulation", loading ? "—" : `${tauxAnnul}%`],
        ].map(([t, v]) => (
          <div key={t} style={{ background: "#fff", borderRadius: 16, padding: 18, border: `1px solid ${BORDER}` }}>
            <div style={{ fontSize: 12, color: MUTED, fontWeight: 700 }}>{t}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: ORANGE, marginTop: 8 }}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)", gap: 20 }}>
        <div style={{ background: "#fff", borderRadius: 16, padding: 20, border: `1px solid ${BORDER}`, minHeight: 320 }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 900 }}>Chiffre d&apos;affaires (MAD)</h3>
          {loading ? (
            <div style={{ height: 260, background: "#eee", borderRadius: 12, animation: "skeleton-pulse 1.2s infinite" }} />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={ca} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="ca" stroke={ORANGE} strokeWidth={2} dot={{ fill: ORANGE }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
        <div style={{ background: "#fff", borderRadius: 16, padding: 20, border: `1px solid ${BORDER}`, minHeight: 320 }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 900 }}>Commandes par statut</h3>
          {loading || pieData.length === 0 ? (
            <div style={{ height: 260, background: "#eee", borderRadius: 12, animation: loading ? "skeleton-pulse 1.2s infinite" : "none", display: "grid", placeItems: "center", color: MUTED }}>
              {loading ? "" : "Pas assez de données"}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={88} label>
                  {pieData.map((_e, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div style={{ marginTop: 20, background: "#fff", borderRadius: 16, padding: 20, border: `1px solid ${BORDER}` }}>
        <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 900 }}>Produits les plus commandés</h3>
        {loading ? (
          <div style={{ height: 220, background: "#eee", borderRadius: 12, animation: "skeleton-pulse 1.2s infinite" }} />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={top.map((t) => ({ name: t.nom, qty: t.quantite }))} margin={{ top: 8, right: 8, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="name" interval={0} angle={-25} textAnchor="end" height={60} tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="qty" fill={ORANGE} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
