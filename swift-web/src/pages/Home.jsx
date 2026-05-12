import { useNavigate } from "react-router-dom";

const COLORS = {
  black: "#0D0D0D",
  muted: "#888888",
  primary: "#FF6B00",
  border: "#EBEBEB",
  white: "#FFFFFF",
};

export default function Home() {
  const navigate = useNavigate();

  const roleCards = [
    { icon: "👤", title: "Client", desc: "Commander et suivre vos livraisons", path: null },
    {
      icon: "🛵",
      title: "Livreur",
      desc: "Connexion et tableau de bord Swift (Django + temps réel)",
      path: "/livreur/login",
      cta: "Accéder Livreur",
    },
    { icon: "🏪", title: "Entreprise", desc: "Gérer catalogue et commandes", path: null, entreprisePath: "/entreprise" },
    { icon: "⚙️", title: "Admin", desc: "Superviser la plateforme Swift", path: null },
  ];

  return (
    <div style={{ minHeight: "100vh", background: COLORS.white, fontFamily: "Inter, system-ui, sans-serif" }}>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 40px",
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(12px)",
          borderBottom: `1px solid ${COLORS.border}`,
        }}
      >
        <div style={{ fontWeight: 900, fontSize: 22, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: COLORS.primary }} />
          Swift
        </div>
        <nav style={{ display: "flex", gap: 28, fontSize: 14, color: COLORS.muted }}>
          <span style={{ fontWeight: 600 }}>Accueil démo</span>
        </nav>
      </header>

      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "72px 60px 80px" }}>
        <div style={{ color: COLORS.primary, fontSize: 11, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase" }}>
          Swift · Choisissez votre espace
        </div>
        <h1 style={{ fontSize: 44, fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.08, margin: "16px 0", color: COLORS.black }}>
          Une plateforme, <span style={{ color: COLORS.primary }}>quatre rôles</span>
        </h1>
        <p style={{ color: COLORS.muted, fontSize: 16, lineHeight: 1.75, maxWidth: 560, marginBottom: 32 }}>
          La carte <strong>Livreur</strong> ouvre l’espace React <strong>/livreur/login</strong> (API Django + WebSocket).
        </p>

        <div
          id="roles"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: 18,
          }}
        >
          {roleCards.map((r) =>
            r.entreprisePath ? (
              <div
                key={r.title}
                style={{
                  textAlign: "left",
                  cursor: "default",
                  color: COLORS.black,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 20,
                  padding: 22,
                  background: "linear-gradient(180deg,#fff,#fff8f3)",
                  fontFamily: "inherit",
                  opacity: 1,
                }}
              >
                <div style={{ fontSize: 36, marginBottom: 8 }}>{r.icon}</div>
                <div style={{ fontWeight: 900, fontSize: 18 }}>{r.title}</div>
                <div style={{ fontSize: 14, color: COLORS.muted, marginTop: 6, lineHeight: 1.5 }}>{r.desc}</div>
                <button
                  type="button"
                  onClick={() => navigate(r.entreprisePath)}
                  style={{
                    marginTop: 12,
                    fontSize: 13,
                    fontWeight: 800,
                    color: COLORS.primary,
                    border: "none",
                    background: "transparent",
                    padding: 0,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    textAlign: "left",
                  }}
                >
                  Accéder →
                </button>
              </div>
            ) : (
              <button
                key={r.title}
                type="button"
                onClick={() => {
                  if (r.path) navigate(r.path);
                }}
                style={{
                  textAlign: "left",
                  cursor: r.path ? "pointer" : "default",
                  color: COLORS.black,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 20,
                  padding: 22,
                  background: "linear-gradient(180deg,#fff,#fff8f3)",
                  fontFamily: "inherit",
                  opacity: r.path ? 1 : 0.88,
                }}
              >
                <div style={{ fontSize: 36, marginBottom: 8 }}>{r.icon}</div>
                <div style={{ fontWeight: 900, fontSize: 18 }}>{r.title}</div>
                <div style={{ fontSize: 14, color: COLORS.muted, marginTop: 6, lineHeight: 1.5 }}>{r.desc}</div>
                {r.cta ? (
                  <div style={{ marginTop: 12, fontSize: 13, fontWeight: 800, color: COLORS.primary }}>{r.cta}</div>
                ) : null}
              </button>
            )
          )}
        </div>
      </section>
    </div>
  );
}
