import { NavLink, useNavigate } from "react-router-dom";

const WIDTH = 280;
const ORANGE = "#FF6B00";
const BORDER = "#eeeeee";
const TEXT = "#1a1a1a";
const MUTED = "#888";
const ACTIVE_BG = "#FFF3E8";

const ITEMS = [
  ["/entreprise-portal/dashboard", "📊", "Tableau de bord"],
  ["/entreprise-portal/commandes", "📋", "Commandes"],
  ["/entreprise-portal/catalogue", "🛒", "Catalogue"],
  ["/entreprise-portal/statistiques", "📈", "Statistiques"],
  ["/entreprise-portal/finances", "💰", "Finances"],
  ["/entreprise-portal/parametres", "⚙️", "Paramètres"],
  ["/entreprise-portal/support", "🆘", "Support"],
];

export default function Sidebar({ nomEntreprise, mobileOpen, onCloseMobile }) {
  const navigate = useNavigate();

  const linkStyle = ({ isActive }) => ({
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "12px 16px",
    borderRadius: 12,
    textDecoration: "none",
    color: isActive ? ORANGE : TEXT,
    fontWeight: isActive ? 800 : 600,
    fontSize: 14,
    background: isActive ? ACTIVE_BG : "transparent",
    marginBottom: 4,
  });

  return (
    <aside
      style={{
        width: WIDTH,
        minWidth: WIDTH,
        background: "#ffffff",
        borderRight: `1px solid ${BORDER}`,
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        position: "sticky",
        top: 0,
        zIndex: 100,
        transform: mobileOpen ? "translateX(0)" : undefined,
      }}
    >
      <div style={{ padding: "20px 18px", borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 22 }}>🏢</span>
          <span style={{ fontWeight: 900, fontSize: 18, color: TEXT }}>Espace Entreprise</span>
        </div>
      </div>
      <nav style={{ flex: 1, padding: "16px 12px", overflowY: "auto" }}>
        {ITEMS.map(([to, icon, label]) => (
          <NavLink
            key={to}
            to={to}
            style={linkStyle}
            onClick={() => onCloseMobile && onCloseMobile()}
          >
            <span>{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>
      <div style={{ padding: 16, borderTop: `1px solid ${BORDER}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${ORANGE}, #cc5500)`,
              color: "#fff",
              display: "grid",
              placeItems: "center",
              fontWeight: 900,
              fontSize: 14,
            }}
          >
            {(nomEntreprise || "?")
              .split(" ")
              .map((w) => w[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: 14, color: TEXT, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {nomEntreprise || "Entreprise"}
            </div>
            <span
              style={{
                display: "inline-block",
                marginTop: 4,
                fontSize: 11,
                fontWeight: 800,
                color: "#fff",
                background: "#22C55E",
                padding: "2px 8px",
                borderRadius: 20,
              }}
            >
              En ligne
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate("/")}
          style={{
            marginTop: 14,
            border: "none",
            background: "none",
            color: MUTED,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            padding: 0,
            fontFamily: "inherit",
          }}
        >
          ← Retour à l&apos;accueil
        </button>
      </div>
    </aside>
  );
}

export const SIDEBAR_WIDTH = WIDTH;
