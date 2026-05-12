import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar, { SIDEBAR_WIDTH } from "../components/entreprise/Sidebar.jsx";

const BG = "#f5f4f0";
const ORANGE = "#FF6B00";
const BORDER = "#eeeeee";

export default function EntrepriseLayout() {
  const [nom, setNom] = useState(() => localStorage.getItem("entreprise_nom") || "");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.innerWidth < 768);

  useEffect(() => {
    const n = localStorage.getItem("entreprise_nom");
    if (n) setNom(n);
  }, []);

  useEffect(() => {
    const onResize = () => {
      const m = window.innerWidth < 768;
      setIsMobile(m);
      if (!m) setMobileOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "Inter, system-ui, sans-serif", background: BG }}>
      {isMobile && mobileOpen ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            zIndex: 90,
          }}
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      ) : null}
      <div
        style={
          isMobile
            ? {
                position: "fixed",
                left: mobileOpen ? 0 : -SIDEBAR_WIDTH,
                top: 0,
                bottom: 0,
                zIndex: 100,
                transition: "left 0.25s ease",
                boxShadow: mobileOpen ? "8px 0 24px rgba(0,0,0,0.15)" : "none",
              }
            : { position: "relative", flexShrink: 0 }
        }
      >
        <Sidebar nomEntreprise={nom} mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      </div>
      <main
        style={{
          flex: 1,
          minHeight: "100vh",
          overflowY: "auto",
          background: BG,
          width: "100%",
        }}
      >
        {isMobile ? (
          <header
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 16px",
              background: "#fff",
              borderBottom: `1px solid ${BORDER}`,
              position: "sticky",
              top: 0,
              zIndex: 40,
            }}
          >
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              style={{
                border: `1px solid ${BORDER}`,
                background: "#fff",
                borderRadius: 10,
                padding: "8px 12px",
                fontWeight: 800,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              ☰ Menu
            </button>
            <span style={{ fontWeight: 900, color: ORANGE }}>🏢 Swift</span>
            <span style={{ width: 72 }} />
          </header>
        ) : null}
        <Outlet />
      </main>
    </div>
  );
}
