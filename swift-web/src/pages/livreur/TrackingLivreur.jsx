import { useParams, useNavigate, Link } from "react-router-dom";

const BG = "#09090F";
const TEXT = "#F0F0FA";
const MUTED = "#7777A0";
const ORANGE = "#FF6B00";
const BORDER = "#26263A";

export default function TrackingLivreur() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: BG,
        color: TEXT,
        fontFamily: "Inter, system-ui, sans-serif",
        padding: 24,
      }}
    >
      <button
        type="button"
        onClick={() => navigate("/livreur/dashboard")}
        style={{
          border: "none",
          background: "none",
          color: MUTED,
          fontWeight: 700,
          cursor: "pointer",
          fontFamily: "inherit",
          padding: 0,
          marginBottom: 20,
        }}
      >
        ← Retour au tableau de bord
      </button>
      <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900 }}>Suivi livraison</h1>
      <p style={{ color: MUTED, marginTop: 10, fontSize: 14, lineHeight: 1.5 }}>
        Commande <span style={{ color: ORANGE, fontWeight: 800 }}>{id}</span> — écran de navigation GPS / étapes à brancher sur votre backend.
      </p>
      <div
        style={{
          marginTop: 28,
          padding: 20,
          borderRadius: 16,
          border: `1px solid ${BORDER}`,
          background: "#18181F",
        }}
      >
        <div style={{ fontSize: 40, textAlign: "center", marginBottom: 12 }}>🗺️</div>
        <div style={{ textAlign: "center", fontSize: 14, color: MUTED }}>
          La démo vous a amené ici après avoir accepté une course.
        </div>
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <Link
            to="/livreur/dashboard"
            style={{ color: ORANGE, fontWeight: 800, textDecoration: "none", fontSize: 15 }}
          >
            Revenir à l’accueil livreur →
          </Link>
        </div>
      </div>
    </div>
  );
}
