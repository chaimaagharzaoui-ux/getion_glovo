export default function ToggleOuvertFerme({ ouvert, loading, onChange }) {
  return (
    <button
      type="button"
      disabled={loading}
      onClick={() => onChange(!ouvert)}
      style={{
        width: 52,
        height: 30,
        borderRadius: 999,
        border: "none",
        cursor: loading ? "wait" : "pointer",
        position: "relative",
        background: ouvert ? "#FF6B00" : "#e0e0e0",
        transition: "background 0.2s ease",
        padding: 0,
      }}
      aria-label="Basculer statut ouvert/fermé"
    >
      <span
        style={{
          position: "absolute",
          top: 3,
          left: ouvert ? 25 : 3,
          width: 24,
          height: 24,
          borderRadius: "50%",
          background: "#fff",
          transition: "left 0.2s ease",
          boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
        }}
      />
    </button>
  );
}
