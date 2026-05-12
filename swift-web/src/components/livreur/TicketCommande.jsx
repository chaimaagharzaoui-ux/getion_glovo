import { useState } from "react";

const CARD_BG = "#18181F";
const BORDER_ORANGE = "#FF6B00";
const SECTION_BG = "#111118";
const TEXT_MAIN = "#F0F0FA";
const TEXT_MUTED = "#7777A0";
const GREEN = "#22C55E";
const RED = "#EF4444";

export default function TicketCommande({ order, onRefuse, onAccept, onDetail }) {
  const [exiting, setExiting] = useState(false);

  const handleRefuse = () => {
    setExiting(true);
    window.setTimeout(() => {
      onRefuse(order.id);
    }, 320);
  };

  const handleAccept = () => {
    onAccept(order);
  };

  return (
    <div
      style={{
        background: CARD_BG,
        border: `1.5px solid ${BORDER_ORANGE}`,
        borderRadius: 14,
        padding: 16,
        marginBottom: 14,
        boxShadow: "0 8px 28px rgba(255,107,0,0.12)",
        animation: "slideIn 0.35s ease-out both",
        transform: exiting ? "translateX(120%)" : "translateX(0)",
        opacity: exiting ? 0 : 1,
        transition: "transform 0.32s ease, opacity 0.32s ease",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div style={{ fontSize: 16, fontWeight: 900, color: BORDER_ORANGE }}>{order.numero}</div>
        <span
          style={{
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: "0.08em",
            color: BORDER_ORANGE,
            background: "rgba(255,107,0,0.12)",
            padding: "4px 10px",
            borderRadius: 8,
            animation: "pulse 1.4s ease-in-out infinite",
          }}
        >
          NOUVEAU
        </span>
      </div>
      <div style={{ marginTop: 8, fontSize: 14, color: TEXT_MUTED, fontWeight: 600 }}>
        {order.entreprise} → Client {order.ville}
      </div>

      <div
        style={{
          marginTop: 14,
          background: SECTION_BG,
          borderRadius: 10,
          padding: "12px 14px",
        }}
      >
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", color: TEXT_MUTED, marginBottom: 8 }}>
          📍 LIVRER À
        </div>
        <div style={{ color: TEXT_MAIN, fontWeight: 700, fontSize: 15 }}>{order.clientNom}</div>
        <div style={{ color: TEXT_MUTED, fontSize: 13, marginTop: 6, lineHeight: 1.45 }}>{order.adresse}</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginTop: 12 }}>
        <div style={{ background: SECTION_BG, borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
          <div style={{ fontSize: 12 }}>💰</div>
          <div style={{ color: GREEN, fontWeight: 800, fontSize: 14, marginTop: 4 }}>{order.gain}</div>
          <div style={{ color: TEXT_MUTED, fontSize: 10, fontWeight: 700, marginTop: 2 }}>Gain</div>
        </div>
        <div style={{ background: SECTION_BG, borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
          <div style={{ fontSize: 12 }}>⏱</div>
          <div style={{ color: TEXT_MAIN, fontWeight: 800, fontSize: 14, marginTop: 4 }}>{order.temps}</div>
          <div style={{ color: TEXT_MUTED, fontSize: 10, fontWeight: 700, marginTop: 2 }}>Temps</div>
        </div>
        <div style={{ background: SECTION_BG, borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
          <div style={{ fontSize: 12 }}>📏</div>
          <div style={{ color: TEXT_MAIN, fontWeight: 800, fontSize: 14, marginTop: 4 }}>{order.distance}</div>
          <div style={{ color: TEXT_MUTED, fontSize: 10, fontWeight: 700, marginTop: 2 }}>Distance</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 16 }}>
        <button
          type="button"
          onClick={handleRefuse}
          style={{
            padding: "14px 12px",
            borderRadius: 50,
            border: `1.5px solid ${RED}`,
            background: "rgba(239,68,68,0.08)",
            color: RED,
            fontWeight: 800,
            fontSize: 14,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Refuser
        </button>
        <button
          type="button"
          onClick={handleAccept}
          style={{
            padding: "14px 12px",
            borderRadius: 50,
            border: "none",
            background: GREEN,
            color: "#FFFFFF",
            fontWeight: 800,
            fontSize: 14,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Accepter
        </button>
      </div>

      <button
        type="button"
        onClick={() => onDetail(order)}
        style={{
          display: "block",
          width: "100%",
          marginTop: 14,
          border: "none",
          background: "none",
          color: TEXT_MUTED,
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
          fontFamily: "inherit",
          textAlign: "center",
        }}
      >
        Détail livraison →
      </button>
    </div>
  );
}
