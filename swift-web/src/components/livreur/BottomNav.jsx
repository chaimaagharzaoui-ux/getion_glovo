const BG = "#111118";
const BORDER = "#26263A";
const ORANGE = "#FF6B00";
const MUTED = "#7777A0";

const TABS = [
  { id: "accueil", label: "Accueil", icon: "ti ti-home" },
  { id: "livraisons", label: "Livraisons", icon: "ti ti-package" },
  { id: "gains", label: "Gains", icon: "ti ti-coin" },
  { id: "profil", label: "Profil", icon: "ti ti-user" },
];

export default function BottomNav({ active, onChange }) {
  return (
    <nav
      style={{
        position: "sticky",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: BG,
        borderTop: `1px solid ${BORDER}`,
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        padding: "10px 4px calc(10px + env(safe-area-inset-bottom, 0px))",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      {TABS.map((t) => {
        const isActive = active === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            style={{
              border: "none",
              borderTop: isActive ? `3px solid ${ORANGE}` : "3px solid transparent",
              background: "transparent",
              padding: "8px 4px 6px",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              color: isActive ? ORANGE : MUTED,
              fontFamily: "inherit",
              marginTop: isActive ? 0 : 3,
            }}
          >
            <i className={t.icon} style={{ fontSize: 22, lineHeight: 1 }} aria-hidden />
            <span style={{ fontSize: 10, fontWeight: 800 }}>{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
