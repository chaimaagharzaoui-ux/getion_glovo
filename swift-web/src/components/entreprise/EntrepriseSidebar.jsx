import { useLocation, useNavigate } from "react-router-dom";

const MENU = [
  ["📊", "Tableau de bord", "/entreprise-portal/dashboard"],
  ["📋", "Commandes", "/entreprise-portal/commandes"],
  ["🛒", "Catalogue", "/entreprise-portal/catalogue"],
  ["📈", "Statistiques", "/entreprise-portal/statistiques"],
  ["💰", "Finances", "/entreprise-portal/finances"],
  ["⚙️", "Paramètres", "/entreprise-portal/parametres"],
  ["🆘", "Support", "/entreprise-portal/support"],
];

export default function EntrepriseSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const nom = localStorage.getItem("entreprise_nom") || "Entreprise";

  return (
    <aside
      style={{
        width: 260,
        minWidth: 260,
        background: "#fff",
        borderRight: "1px solid #eee",
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        position: "sticky",
        top: 0,
      }}
    >
      <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid #f2f2f2" }}>
        <div style={{ fontWeight: 900, fontSize: 16, color: "#1a1a1a" }}>🏢 Espace Entreprise</div>
      </div>

      <nav style={{ padding: "8px 0", flex: 1 }}>
        {MENU.map(([emoji, label, path]) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={path}
              type="button"
              onClick={() => navigate(path)}
              style={{
                width: "100%",
                textAlign: "left",
                border: "none",
                borderLeft: isActive ? "4px solid #FF6B00" : "4px solid transparent",
                background: isActive ? "#fdf3ec" : "transparent",
                color: isActive ? "#FF6B00" : "#333",
                padding: "11px 24px",
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = "#fdf3ec";
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = "transparent";
              }}
            >
              <span style={{ marginRight: 10 }}>{emoji}</span>
              {label}
            </button>
          );
        })}
      </nav>

      <div style={{ padding: 16, borderTop: "1px solid #f2f2f2" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "linear-gradient(135deg,#FF6B00,#cc5500)",
              color: "#fff",
              display: "grid",
              placeItems: "center",
              fontWeight: 900,
              fontSize: 14,
            }}
          >
            {(nom.split(" ").map((x) => x[0]).join("").slice(0, 2) || "EN").toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#1a1a1a" }}>{nom}</div>
            <span
              style={{
                display: "inline-block",
                marginTop: 4,
                background: "#22C55E",
                color: "#fff",
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 800,
                padding: "2px 8px",
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
            marginTop: 12,
            border: "none",
            background: "none",
            color: "#888",
            fontSize: 13,
            cursor: "pointer",
            padding: 0,
            fontFamily: "inherit",
          }}
        >
          ← Retour à l'accueil
        </button>
      </div>
    </aside>
  );
}
