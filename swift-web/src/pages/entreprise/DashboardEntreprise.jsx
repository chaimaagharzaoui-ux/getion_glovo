import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client.js";
import EntrepriseSidebar from "../../components/entreprise/EntrepriseSidebar.jsx";
import StatCard from "../../components/entreprise/StatCard.jsx";
import CommandesRecentes from "../../components/entreprise/CommandesRecentes.jsx";
import ToggleOuvertFerme from "../../components/entreprise/ToggleOuvertFerme.jsx";

const asMad = (n) =>
  Number.isFinite(Number(n))
    ? `${Number(n).toLocaleString("fr-FR", { maximumFractionDigits: 0 })} MAD`
    : "—";

export default function DashboardEntreprise() {
  const navigate = useNavigate();
  const entrepriseId = localStorage.getItem("entreprise_id");
  const entrepriseNom = localStorage.getItem("entreprise_nom") || "Entreprise";

  const [loadingStats, setLoadingStats] = useState(true);
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [ouvert, setOuvert] = useState(true);
  const [toggleSaving, setToggleSaving] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("entreprise_token")) {
      navigate("/entreprise/login", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      if (!localStorage.getItem("entreprise_token") || !entrepriseId) {
        setLoadingStats(false);
        return;
      }
      setLoadingStats(true);
      try {
        const [statsRes, cmdRes] = await Promise.all([
          api.get("/api/entreprise/stats"),
          api.get(`/api/commandes?entreprise=${entrepriseId}&limit=10&sort=recent`),
        ]);
        if (!mounted) return;
        const s = statsRes.data || {};
        setStats(s);
        setOuvert(Boolean(s.ouvert));
        setRecent(Array.isArray(cmdRes.data) ? cmdRes.data : []);
      } catch {
        if (!mounted) return;
        setStats({
          caAujourdhui: null,
          variation: null,
          totalCommandes: null,
          commandesEnCours: null,
          noteMoyenne: "—",
          tempsLivraisonMoyen: "—",
          horaires: "08:00 – 23:00",
          tauxAcceptation: "—",
          ouvert: false,
        });
        setRecent([]);
      } finally {
        if (mounted) setLoadingStats(false);
      }
    };
    fetchData();
    return () => {
      mounted = false;
    };
  }, [entrepriseId]);

  const variationText = useMemo(() => {
    const v = Number(stats?.variation);
    if (!Number.isFinite(v)) return "—";
    return `${v > 0 ? "+" : ""}${v}% vs hier`;
  }, [stats]);

  const variationColor = Number(stats?.variation) >= 0 ? "#22C55E" : "#EF4444";

  const onToggle = async (next) => {
    setOuvert(next);
    setToggleSaving(true);
    try {
      await api.put("/api/entreprise/statut", { ouvert: next });
    } catch {
      setOuvert((v) => !v);
    } finally {
      setToggleSaving(false);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "Inter, system-ui, sans-serif" }}>
      <EntrepriseSidebar />
      <main style={{ flex: 1, background: "#f5f4f0", padding: 32, overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 13, color: "#888" }}>Bonjour</div>
            <h1 style={{ margin: "4px 0 0", fontSize: 28, fontWeight: 900, color: "#1a1a1a" }}>
              {entrepriseNom} 👋
            </h1>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <button
              type="button"
              style={{
                padding: "10px 16px",
                borderRadius: 50,
                border: "1.5px solid #FF6B00",
                background: "#fff",
                color: "#FF6B00",
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Voir ma page publique →
            </button>
            <button
              type="button"
              onClick={() => navigate("/")}
              style={{
                padding: "10px 18px",
                borderRadius: 50,
                border: "none",
                background: "#FF6B00",
                color: "#fff",
                fontWeight: 800,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Accueil
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(180px, 1fr))", gap: 14, marginTop: 20 }}>
          <StatCard
            loading={loadingStats}
            title="CA aujourd'hui"
            value={asMad(stats?.caAujourdhui)}
            sub={variationText}
            subColor={variationColor}
          />
          <StatCard
            loading={loadingStats}
            title="Commandes"
            value={stats?.totalCommandes ?? "—"}
            sub={`En cours : ${stats?.commandesEnCours ?? "—"}`}
            subColor="#22C55E"
          />
          <StatCard
            loading={loadingStats}
            title="Note moyenne"
            value={stats?.noteMoyenne ? `${stats.noteMoyenne} ⭐` : "—"}
            sub=""
          />
          <StatCard
            loading={loadingStats}
            title="Temps livraison"
            value={Number.isFinite(Number(stats?.tempsLivraisonMoyen)) ? `${stats.tempsLivraisonMoyen} min` : "—"}
            sub=""
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16, marginTop: 18 }}>
          <CommandesRecentes loading={loadingStats} commandes={recent} />

          <div style={{ display: "grid", gap: 12 }}>
            <div
              style={{
                background: "#fff",
                borderRadius: 18,
                border: "1px solid #eee",
                padding: 20,
                boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
              }}
            >
              <div style={{ fontSize: 15, fontWeight: 800, color: ouvert ? "#1a1a1a" : "#999", marginBottom: 12 }}>
                {ouvert ? "OUVERT" : "FERMÉ"}
              </div>
              <ToggleOuvertFerme ouvert={ouvert} loading={toggleSaving} onChange={onToggle} />
            </div>

            <div
              style={{
                background: "#fff",
                borderRadius: 18,
                border: "1px solid #eee",
                padding: 20,
                boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
              }}
            >
              <div style={{ fontSize: 15, fontWeight: 700, color: "#1a1a1a" }}>Horaires : {stats?.horaires || "08:00 – 23:00"}</div>
              <div style={{ marginTop: 8, fontSize: 13, color: "#888" }}>
                Acceptation <strong style={{ color: "#1a1a1a" }}>{stats?.tauxAcceptation ?? "—"} %</strong>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
