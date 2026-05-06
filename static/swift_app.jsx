/**
 * Swift Platform — Fichier maître unique (démo)
 * 4 apps : Client · Livreur · Entreprise · Admin
 * État : useState/useEffect uniquement, pas de Context, styles inline.
 */
const { useState, useEffect, useMemo, useRef } = React;

const COLORS = {
  primary: "#FF6B00",
  primaryLight: "#FF8C35",
  primaryGlow: "rgba(255,107,0,0.15)",
  primaryPale: "#FFF3EA",
  black: "#0D0D0D",
  dark: "#1A1A1A",
  white: "#FFFFFF",
  cream: "#F5F4F0",
  muted: "#888888",
  border: "#EBEBEB",
  card: "#F8F8F8",
  bgDark: "#09090F",
  surfaceDark: "#111118",
  cardDark: "#18181F",
  borderDark: "#26263A",
  textDark: "#F0F0FA",
  textMuted: "#7777A0",
  green: "#22C55E",
  red: "#EF4444",
  yellow: "#F59E0B",
  blue: "#3B82F6",
};

const RF = { fontFamily: "Outfit, sans-serif" };
const eur = (n) => `${Number(n).toFixed(2)} €`;
const mad = (n) => `${Number(n).toFixed(0)} MAD`;
const getCookie = (name) => {
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : "";
};
const api = async (url, options = {}) => {
  const method = (options.method || "GET").toUpperCase();
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (method !== "GET") headers["X-CSRFToken"] = getCookie("csrftoken");
  const res = await fetch(url, { credentials: "same-origin", ...options, headers });
  let data = {};
  try { data = await res.json(); } catch (_) { data = {}; }
  if (!res.ok) throw new Error(data.detail || "Erreur API");
  return data;
};

/* ——— Shared UI ——— */
function Btn({ children, onClick, variant = "primary", size = "md", full, style, disabled }) {
  const [down, setDown] = useState(false);
  const sz = size === "sm" ? { fs: 12, pad: "8px 16px" } : size === "lg" ? { fs: 16, pad: "16px 40px" } : { fs: 14, pad: "12px 28px" };
  const map = {
    primary: { bg: COLORS.primary, color: COLORS.white, border: "1px solid transparent", shadow: `0 10px 28px ${COLORS.primaryGlow}` },
    outline: { bg: "transparent", color: COLORS.primary, border: `1px solid ${COLORS.primary}` },
    ghost: { bg: COLORS.cardDark, color: COLORS.textDark, border: `1px solid ${COLORS.borderDark}` },
    danger: { bg: COLORS.red, color: COLORS.white, border: "1px solid transparent" },
    success: { bg: COLORS.green, color: COLORS.white, border: "1px solid transparent" },
    white: { bg: COLORS.white, color: COLORS.primary, border: "1px solid transparent" },
  };
  const m = map[variant] || map.primary;
  return (
    <button type="button" disabled={disabled} onMouseDown={() => setDown(true)} onMouseUp={() => setDown(false)} onMouseLeave={() => setDown(false)} onClick={onClick}
      style={{ ...RF, borderRadius: 50, padding: sz.pad, fontWeight: 700, fontSize: sz.fs, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1, width: full ? "100%" : "auto", transform: down ? "scale(0.97)" : "none", transition: "transform 0.1s", background: m.bg, color: m.color, border: m.border, boxShadow: m.shadow || "none", ...style }}>
      {children}
    </button>
  );
}

function Input({ label, type = "text", value, onChange, icon, placeholder, light, multiline, rows = 3 }) {
  const bg = light ? COLORS.white : COLORS.cardDark;
  const color = light ? COLORS.black : COLORS.textDark;
  const border = light ? COLORS.border : COLORS.borderDark;
  const ph = light ? COLORS.muted : COLORS.textMuted;
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <div style={{ ...RF, color: light ? COLORS.black : COLORS.textMuted, fontSize: 11, marginBottom: 6, fontWeight: 600 }}>{label}</div>}
      <div style={{ position: "relative" }}>
        {icon && <span style={{ position: "absolute", left: 12, top: multiline ? 12 : 13, fontSize: 16 }}>{icon}</span>}
        {multiline ? (
          <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows}
            style={{ ...RF, width: "100%", background: bg, color, border: `1px solid ${border}`, borderRadius: 12, padding: `12px 12px 12px ${icon ? 38 : 12}px`, outline: "none", fontSize: 14, resize: "vertical", boxSizing: "border-box", minHeight: 80 }} />
        ) : (
          <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
            style={{ ...RF, width: "100%", background: bg, color, border: `1px solid ${border}`, borderRadius: 12, padding: `12px 12px 12px ${icon ? 38 : 12}px`, outline: "none", fontSize: 14, boxSizing: "border-box" }} />
        )}
      </div>
    </div>
  );
}

function Badge({ children, variant = "muted", style }) {
  const c = { success: [COLORS.green, COLORS.white], warning: [COLORS.yellow, COLORS.black], danger: [COLORS.red, COLORS.white], info: [COLORS.blue, COLORS.white], muted: [COLORS.border, COLORS.muted] };
  const [bg, col] = c[variant] || c.muted;
  return <span style={{ ...RF, display: "inline-flex", alignItems: "center", borderRadius: 50, padding: "4px 10px", fontSize: 11, fontWeight: 700, background: bg, color: col, ...style }}>{children}</span>;
}

function Card({ dark, children, style, onClick, className }) {
  const bg = dark ? COLORS.cardDark : COLORS.white;
  const b = dark ? COLORS.borderDark : COLORS.border;
  return <div className={className} onClick={onClick} style={{ ...RF, background: bg, border: `1px solid ${b}`, borderRadius: 20, boxShadow: dark ? "0 8px 32px rgba(0,0,0,0.35)" : "0 4px 24px rgba(0,0,0,0.06)", ...style }}>{children}</div>;
}

function StatCard({ value, label, sub, dark }) {
  return (
    <Card dark={dark} style={{ padding: 18 }}>
      <div style={{ ...RF, fontSize: 28, fontWeight: 900, color: COLORS.primary }}>{value}</div>
      <div style={{ ...RF, fontSize: 12, color: dark ? COLORS.textMuted : COLORS.muted, marginTop: 4 }}>{label}</div>
      {sub && <div style={{ ...RF, fontSize: 11, color: COLORS.green, marginTop: 6 }}>{sub}</div>}
    </Card>
  );
}

function Toggle({ on, onToggle, wide }) {
  const w = wide ? 56 : 50;
  const h = wide ? 30 : 28;
  return (
    <button type="button" onClick={() => onToggle(!on)} style={{ ...RF, width: w, height: h, borderRadius: 999, border: "none", background: on ? COLORS.primary : COLORS.surfaceDark, position: "relative", cursor: "pointer", flexShrink: 0 }}>
      <span style={{ position: "absolute", top: 4, left: on ? w - h + 6 : 4, width: h - 8, height: h - 8, borderRadius: "50%", background: COLORS.white, transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} />
    </button>
  );
}

function Avatar({ emoji, initials, size = 44, dark }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: dark ? `linear-gradient(145deg,${COLORS.primary},#c2410c)` : COLORS.primaryPale, display: "grid", placeItems: "center", fontSize: size * 0.4, fontWeight: 900, color: COLORS.primary, border: `2px solid ${dark ? COLORS.borderDark : COLORS.border}` }}>
      {emoji || initials}
    </div>
  );
}

function ProgressBar({ pct }) {
  return <div style={{ height: 8, borderRadius: 50, background: COLORS.borderDark, overflow: "hidden" }}><div style={{ height: "100%", width: `${pct}%`, borderRadius: 50, background: COLORS.primary, transition: "width 0.4s" }} /></div>;
}

function PageFade({ children }) {
  const [op, setOp] = useState(0);
  useEffect(() => { const t = requestAnimationFrame(() => setOp(1)); return () => cancelAnimationFrame(t); }, []);
  return <div style={{ opacity: op, transition: "opacity 0.2s" }}>{children}</div>;
}

function Modal({ open, onClose, children, wide }) {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 1000, display: "grid", placeItems: "center", padding: 16 }} onClick={onClose}>
      <Card dark style={{ maxWidth: wide ? 560 : 440, width: "100%", padding: 24, maxHeight: "90vh", overflow: "auto" }} onClick={(e) => e.stopPropagation()}>{children}</Card>
    </div>
  );
}

function MarqueeRow({ items, reverse, lightBg }) {
  return (
    <div style={{ overflow: "hidden", width: "100%" }}>
      <div style={{ display: "flex", width: "max-content", gap: 10, animation: `${reverse ? "marqueeR" : "marquee"} 30s linear infinite` }}>
        {[...items, ...items].map((p, i) => (
          <div key={i} style={{ ...RF, display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 50, background: lightBg ? COLORS.white : COLORS.cardDark, border: `1px solid ${lightBg ? COLORS.border : COLORS.borderDark}`, fontSize: 13, fontWeight: 600, color: lightBg ? COLORS.black : COLORS.textDark }}>
            <span>{p.icon}</span>{p.name}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ——— Data ——— */
const PARTNERS = [
  { name: "McDonald's", icon: "🍔" }, { name: "Carrefour", icon: "🛒" }, { name: "Pharmaprix", icon: "💊" }, { name: "Nike", icon: "👟" },
  { name: "Zara", icon: "👗" }, { name: "Sephora", icon: "💄" }, { name: "Starbucks", icon: "☕" }, { name: "Apple", icon: "⌚" },
  { name: "Adidas", icon: "⚽" }, { name: "L'Oréal", icon: "🌸" }, { name: "Decathlon", icon: "🏋️" }, { name: "Dior", icon: "✨" },
  { name: "Louis Vuitton", icon: "👜" }, { name: "KFC", icon: "🍗" }, { name: "Jumia", icon: "📦" }, { name: "Marjane", icon: "🏪" },
];

const CAT_CLIENT = [
  { id: "restaurant", label: "Restaurants", icon: "🍽️" }, { id: "groceries", label: "Épicerie", icon: "🛒" }, { id: "pharmacy", label: "Pharmacie", icon: "💊" },
  { id: "sports", label: "Sports", icon: "⚽" }, { id: "flowers", label: "Fleurs", icon: "💐" }, { id: "perfumes", label: "Parfums", icon: "🌸" },
  { id: "clothes", label: "Vêtements", icon: "👗" }, { id: "bags", label: "Sacs", icon: "👜" }, { id: "shoes", label: "Chaussures", icon: "👟" },
  { id: "makeup", label: "Maquillage", icon: "💄" }, { id: "watches", label: "Apple Watch", icon: "⌚" }, { id: "food", label: "Alimentation", icon: "🍔" },
];

const BUSINESSES = [
  { id: 1, name: "Burger Palace", cat: "restaurant", rating: 4.8, time: "20-30", icon: "🍔" },
  { id: 2, name: "Pizza Roma", cat: "restaurant", rating: 4.6, time: "25-35", icon: "🍕" },
  { id: 3, name: "Sushi Zen", cat: "restaurant", rating: 4.7, time: "30-40", icon: "🍱" },
  { id: 4, name: "PharmaCare", cat: "pharmacy", rating: 4.9, time: "15-20", icon: "💊" },
  { id: 5, name: "MediPlus", cat: "pharmacy", rating: 4.8, time: "10-15", icon: "🏥" },
  { id: 6, name: "FreshMarket", cat: "groceries", rating: 4.5, time: "20-25", icon: "🥦" },
  { id: 7, name: "SportZone", cat: "sports", rating: 4.7, time: "60-90", icon: "⚽" },
  { id: 8, name: "Nike Store", cat: "sports", rating: 4.9, time: "60-90", icon: "👟" },
  { id: 9, name: "Rose & Co", cat: "flowers", rating: 4.8, time: "30-45", icon: "🌹" },
  { id: 10, name: "Flower Garden", cat: "flowers", rating: 4.6, time: "25-40", icon: "💐" },
  { id: 11, name: "Dior Parfums", cat: "perfumes", rating: 4.9, time: "60-90", icon: "🌸" },
  { id: 12, name: "Fragrance World", cat: "perfumes", rating: 4.7, time: "60-90", icon: "✨" },
  { id: 13, name: "Zara", cat: "clothes", rating: 4.6, time: "60-90", icon: "👗" },
  { id: 14, name: "H&M Fashion", cat: "clothes", rating: 4.5, time: "60-90", icon: "🧥" },
  { id: 15, name: "LV Bags", cat: "bags", rating: 4.9, time: "60-90", icon: "👜" },
  { id: 16, name: "Shoe Palace", cat: "shoes", rating: 4.8, time: "60-90", icon: "👠" },
  { id: 17, name: "Sephora", cat: "makeup", rating: 4.8, time: "45-60", icon: "💄" },
  { id: 18, name: "MAC Cosmetics", cat: "makeup", rating: 4.7, time: "45-60", icon: "💅" },
  { id: 19, name: "Apple Store", cat: "watches", rating: 5.0, time: "60-90", icon: "⌚" },
  { id: 20, name: "iWatch Premium", cat: "watches", rating: 4.8, time: "60-90", icon: "🖥️" },
  { id: 21, name: "GreenLeaf", cat: "food", rating: 4.5, time: "20-25", icon: "🥗" },
  { id: 22, name: "Sweet Bakery", cat: "food", rating: 4.7, time: "20-30", icon: "🥐" },
];

const PRODUCTS = [
  { id: 1, name: "Classic Burger", price: 8.99, icon: "🍔" }, { id: 2, name: "Cheese Fries", price: 4.99, icon: "🍟" },
  { id: 3, name: "Cola Drink", price: 2.49, icon: "🥤" }, { id: 4, name: "BBQ Chicken", price: 12.99, icon: "🍗" },
  { id: 5, name: "Onion Rings", price: 3.99, icon: "🧅" }, { id: 6, name: "Milkshake", price: 5.49, icon: "🥛" },
];

const ORDERS_CLIENT = [
  { id: "#0042", store: "Burger Palace", date: "3 mai 2026", total: 24.97, status: "Livré", items: ["Classic Burger", "Cheese Fries", "Cola"] },
  { id: "#0038", store: "PharmaCare", date: "28 avr. 2026", total: 18.5, status: "Livré", items: ["Vitamine C", "Antidouleur"] },
  { id: "#0031", store: "Sushi Zen", date: "20 avr. 2026", total: 32.0, status: "Livré", items: ["Sushi Box", "Soupe Miso"] },
];

const MOCK_CLIENTS = [
  { id: 1, nom: "Yasmine El Amrani", email: "yasmine.el@email.ma", tel: "+212 6 12 34 56 78", ville: "Casablanca", inscrit: "12 jan. 2025", cmd: 47, total: 3840, statut: "Actif" },
  { id: 2, nom: "Mehdi Benali", email: "mehdi.b@email.ma", tel: "+212 6 22 11 99 00", ville: "Rabat", inscrit: "3 fév. 2025", cmd: 12, total: 920, statut: "Actif" },
  { id: 3, nom: "Salma Idrissi", email: "salma.i@email.ma", tel: "+212 6 55 44 33 22", ville: "Marrakech", inscrit: "20 mars 2025", cmd: 89, total: 7120, statut: "Actif" },
  { id: 4, nom: "Omar Tazi", email: "omar.t@email.ma", tel: "+212 6 77 88 99 00", ville: "Fès", inscrit: "1 avr. 2025", cmd: 5, total: 340, statut: "Inactif" },
  { id: 5, nom: "Lina Cherkaoui", email: "lina.c@email.ma", tel: "+212 6 11 22 33 44", ville: "Casablanca", inscrit: "15 avr. 2025", cmd: 156, total: 12400, statut: "Actif" },
  { id: 6, nom: "Hicham Fassi", email: "hicham.f@email.ma", tel: "+212 6 99 88 77 66", ville: "Tanger", inscrit: "2 mai 2025", cmd: 23, total: 1890, statut: "Bloqué" },
  { id: 7, nom: "Nadia Berrada", email: "nadia.b@email.ma", tel: "+212 6 44 55 66 77", ville: "Casablanca", inscrit: "8 mai 2025", cmd: 8, total: 560, statut: "Actif" },
  { id: 8, nom: "Karim Alaoui", email: "karim.a@email.ma", tel: "+212 6 33 44 55 66", ville: "Rabat", inscrit: "10 mai 2025", cmd: 34, total: 2780, statut: "Actif" },
];

const MOCK_LIVREURS = [
  { id: 1, nom: "Rachid Mansouri", tel: "+212 6 10 20 30 40", vehicule: "🛵 Scooter", zone: "Casablanca Centre", liv: 1240, note: 4.9, gains: 8400, statut: "Actif", ligne: true },
  { id: 2, nom: "Amine Kettani", tel: "+212 6 11 22 33 44", vehicule: "🚲 Vélo", zone: "Maarif", liv: 890, note: 4.7, gains: 5200, statut: "Actif", ligne: false },
  { id: 3, nom: "Soufiane Zahiri", tel: "+212 6 55 66 77 88", vehicule: "🚗 Voiture", zone: "Ain Sebaâ", liv: 2100, note: 4.8, gains: 15200, statut: "En livraison", ligne: true },
  { id: 4, nom: "Hassan Oubella", tel: "+212 6 99 00 11 22", vehicule: "🛵 Scooter", zone: "Hay Hassani", liv: 560, note: 4.6, gains: 4100, statut: "Hors ligne", ligne: false },
  { id: 5, nom: "Ilham Sabri", tel: "+212 6 77 88 99 00", vehicule: "🚶 À pied", zone: "Centre-ville Rabat", liv: 320, note: 4.9, gains: 2100, statut: "En attente", ligne: false },
  { id: 6, nom: "Bilal Naciri", tel: "+212 6 12 34 56 78", vehicule: "🛵 Scooter", zone: "Temara", liv: 670, note: 4.5, gains: 4800, statut: "Suspendu", ligne: false },
];

const MOCK_ENTREPRISES = BUSINESSES.slice(0, 8).map((b, i) => ({
  id: b.id, nom: b.name, cat: b.cat === "restaurant" ? "Restaurant" : b.cat === "pharmacy" ? "Pharmacie" : b.cat === "groceries" ? "Épicerie" : "Mode",
  ville: i % 3 === 0 ? "Casablanca" : i % 3 === 1 ? "Rabat" : "Marrakech", cmdMois: 120 + i * 15, ca: 45000 + i * 8000, commission: 12 + (i % 3), note: b.rating, statut: i === 5 ? "En attente" : "Actif", ouvert: i !== 5,
}));

const MOCK_COMMANDES = [
  { id: "SW-9821", client: "Yasmine El Amrani", ent: "Burger Palace", liv: "Rachid Mansouri", articles: ["Burger", "Frites"], montant: 86.5, commission: 10.4, statut: "Livré", cree: "05/05/2026 12:14", livre: "05/05/2026 12:42" },
  { id: "SW-9820", client: "Mehdi Benali", ent: "PharmaCare", liv: "Amine Kettani", articles: ["Pansement", "Sirop"], montant: 124, commission: 14.9, statut: "En livraison", cree: "05/05/2026 12:30", livre: null },
  { id: "SW-9819", client: "Salma Idrissi", ent: "Sushi Zen", liv: null, articles: ["Menu sushi"], montant: 210, commission: 25.2, statut: "En préparation", cree: "05/05/2026 12:05", livre: null },
  { id: "SW-9818", client: "Omar Tazi", ent: "FreshMarket", liv: "Soufiane Zahiri", articles: ["Fruits"], montant: 65, commission: 7.8, statut: "Annulé", cree: "05/05/2026 11:50", livre: null },
  { id: "SW-9817", client: "Lina Cherkaoui", ent: "Zara", liv: "Rachid Mansouri", articles: ["Robe"], montant: 890, commission: 106.8, statut: "Livré", cree: "04/05/2026 19:20", livre: "04/05/2026 19:55" },
  { id: "SW-9816", client: "Hicham Fassi", ent: "Pizza Roma", liv: "Amine Kettani", articles: ["Pizza M"], montant: 72, commission: 8.6, statut: "Livré", cree: "04/05/2026 18:10", livre: "04/05/2026 18:38" },
  { id: "SW-9815", client: "Nadia Berrada", ent: "Sephora", liv: "Ilham Sabri", articles: ["Rouge à lèvres"], montant: 189, commission: 22.7, statut: "En attente", cree: "05/05/2026 12:45", livre: null },
  { id: "SW-9814", client: "Karim Alaoui", ent: "MediPlus", liv: "Bilal Naciri", articles: ["Vitamines"], montant: 156, commission: 18.7, statut: "Livré", cree: "03/05/2026 10:00", livre: "03/05/2026 10:28" },
  { id: "SW-9813", client: "Yasmine El Amrani", ent: "Rose & Co", liv: "Rachid Mansouri", articles: ["Bouquet"], montant: 240, commission: 28.8, statut: "Livré", cree: "02/05/2026 14:00", livre: "02/05/2026 14:35" },
  { id: "SW-9812", client: "Mehdi Benali", ent: "GreenLeaf", liv: "Hassan Oubella", articles: ["Salade"], montant: 45, commission: 5.4, statut: "Livré", cree: "01/05/2026 13:20", livre: "01/05/2026 13:48" },
];

function SwiftMobileApp() {
  const [orders, setOrders] = useState([]);
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <style>{`
        html { scroll-behavior: smooth; }
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes marqueeR { from { transform: translateX(-50%); } to { transform: translateX(0); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.65; } }
        @keyframes skeleton { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        .swift-btn-hover { transition: transform .2s, box-shadow .2s, filter .2s; }
        .swift-btn-hover:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(255,107,0,.2); filter: saturate(1.06); }
        .swift-btn-hover:active { transform: scale(.97); }
        .lift-card { transition: transform .25s, box-shadow .25s; }
        .lift-card:hover { transform: translateY(-6px); box-shadow: 0 16px 40px rgba(0,0,0,.12); }
        .icon-float { display: inline-block; transition: transform .25s; }
        .lift-card:hover .icon-float { transform: translateY(-3px); }
        .reveal-on-scroll { opacity: 0; transform: translateY(18px); transition: opacity .55s ease, transform .55s ease; }
        .reveal-on-scroll.is-visible { opacity: 1; transform: translateY(0); }
        .role-card { transition: transform .25s, box-shadow .25s, border-color .25s; }
        .role-card:hover { transform: translateY(-6px) scale(1.01); box-shadow: 0 22px 50px rgba(255,107,0,.18); border-color: #FF8C35; }
        .top-nav-link { transition: color .2s, transform .2s; display: inline-block; }
        .top-nav-link:hover { color: ${COLORS.primary}; transform: translateY(-1px); }
      `}</style>
      <ClientAppPlatform orders={orders} setOrders={setOrders} />
    </>
  );
}

/* ═══════════════ CLIENT APP ═══════════════ */
function ClientAppPlatform({ orders, setOrders }) {
  const [screen, setScreen] = useState("landing");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [regStep, setRegStep] = useState(1);
  const [forgotSent, setForgotSent] = useState(false);
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [biz, setBiz] = useState(null);
  const [checkoutOk, setCheckoutOk] = useState(false);
  const [trackStep, setTrackStep] = useState(0);
  const [catF, setCatF] = useState(null);
  const [priceF, setPriceF] = useState("All");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [name, setName] = useState("");
  const [addr, setAddr] = useState("Bd Zerktouni 32, Casablanca");
  const [pay, setPay] = useState("cash");
  const [histOpen, setHistOpen] = useState(null);
  const [landFade, setLandFade] = useState(0);
  const [actor, setActor] = useState(0);
  const [profNotif, setProfNotif] = useState({ cmd: true, promo: false, news: true });
  const [authErr, setAuthErr] = useState("");
  const go = (s) => setScreen(s);

  useEffect(() => { const t = setTimeout(() => setLandFade(1), 80); return () => clearTimeout(t); }, []);
  useEffect(() => {
    if (screen !== "landing") return undefined;
    const nodes = Array.from(document.querySelectorAll(".reveal-on-scroll"));
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });
    nodes.forEach((n) => obs.observe(n));
    return () => obs.disconnect();
  }, [screen]);
  useEffect(() => {
    if (screen !== "tracking") return;
    if (trackStep >= 2) return;
    const tm = setTimeout(() => setTrackStep((x) => Math.min(x + 1, 2)), 4000);
    return () => clearTimeout(tm);
  }, [screen, trackStep]);
  useEffect(() => {
    const protectedScreens = ["dashboard", "catalogue", "cart", "checkout", "tracking", "history", "profile"];
    if (protectedScreens.includes(screen) && !isAuthenticated) go("login");
  }, [screen, isAuthenticated]);

  const cartN = cart.reduce((a, i) => a + i.qty, 0);
  const subtotal = cart.reduce((a, i) => a + i.price * i.qty, 0);
  const livBiz = useMemo(() => BUSINESSES.filter((b) => !catF || b.cat === catF), [catF]);
  const filtProd = useMemo(() => PRODUCTS.filter((p) => priceF === "All" || (priceF === "<5" && p.price < 5) || (priceF === "5-10" && p.price >= 5 && p.price <= 10) || (priceF === ">10" && p.price > 10)), [priceF]);
  const inCart = (id) => cart.some((c) => c.id === id);
  const addCart = (p) => setCart((prev) => prev.find((x) => x.id === p.id) ? prev.map((x) => (x.id === p.id ? { ...x, qty: x.qty + 1 } : x)) : [...prev, { ...p, qty: 1 }]);
  const produitsRestaurant = [
    { nom: "Classic Burger", prix: 8.99, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&q=80" },
    { nom: "Cheese Fries", prix: 4.99, image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=300&q=80" },
    { nom: "Cola Drink", prix: 2.49, image: "https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=300&q=80" },
    { nom: "BBQ Chicken", prix: 12.99, image: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=300&q=80" },
    { nom: "Onion Rings", prix: 3.99, image: "https://images.unsplash.com/photo-1639024471283-03518883512d?w=300&q=80" },
    { nom: "Milkshake", prix: 5.49, image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=300&q=80" },
  ];
  const produitsPharmacies = [
    { nom: "Vitamine C 1000mg", prix: 12.50, image: "https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=300&q=80" },
    { nom: "Doliprane 500mg", prix: 4.20, image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&q=80" },
    { nom: "Crème Hydratante", prix: 18.90, image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&q=80" },
    { nom: "Sérum Visage", prix: 24.99, image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=300&q=80" },
    { nom: "Masque Purifiant", prix: 9.50, image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=300&q=80" },
    { nom: "Eau Micellaire", prix: 7.80, image: "https://images.unsplash.com/photo-1571781565036-d3f759be73e4?w=300&q=80" },
  ];
  const produitsEpicerie = [
    { nom: "Lait Entier 1L", prix: 1.20, image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&q=80" },
    { nom: "Pain de Campagne", prix: 2.50, image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&q=80" },
    { nom: "Tomates Bio 1kg", prix: 3.80, image: "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=300&q=80" },
    { nom: "Fromage Gouda", prix: 5.60, image: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=300&q=80" },
    { nom: "Jus d'Orange 1L", prix: 2.90, image: "https://images.unsplash.com/photo-1600271772470-bd22a42787b3?w=300&q=80" },
    { nom: "Yaourt Nature x6", prix: 3.20, image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300&q=80" },
  ];
  const produitsFleurs = [
    { nom: "Bouquet de Roses Rouges", prix: 29.99, image: "https://images.unsplash.com/photo-1587556930799-8dca6fad6d43?w=300&q=80" },
    { nom: "Tulipes Colorées", prix: 19.50, image: "https://images.unsplash.com/photo-1490750967868-88df5691cc6f?w=300&q=80" },
    { nom: "Orchidée Blanche", prix: 34.00, image: "https://images.unsplash.com/photo-1566907225472-514215c03768?w=300&q=80" },
    { nom: "Lys Blancs", prix: 22.00, image: "https://images.unsplash.com/photo-1518895312237-a9e23508077d?w=300&q=80" },
    { nom: "Tournesols Frais", prix: 15.90, image: "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=300&q=80" },
    { nom: "Pivoine Rose", prix: 27.50, image: "https://images.unsplash.com/photo-1560717845-968823efbee1?w=300&q=80" },
  ];
  const produitsSports = [
    { nom: "Ballon de Football", prix: 39.99, image: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=300&q=80" },
    { nom: "Raquette de Tennis", prix: 89.00, image: "https://images.unsplash.com/photo-1617083934555-ac7b4d500f7e?w=300&q=80" },
    { nom: "Gants de Boxe", prix: 49.90, image: "https://images.unsplash.com/photo-1550919247-a2cc49c9c975?w=300&q=80" },
    { nom: "Tapis de Yoga", prix: 29.00, image: "https://images.unsplash.com/photo-1601925228548-54be0c59e49a?w=300&q=80" },
    { nom: "Haltères 5kg", prix: 24.99, image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300&q=80" },
    { nom: "Vélo de Fitness", prix: 299.00, image: "https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=300&q=80" },
  ];
  const getMenuByCategorie = (categorie) => {
    switch (categorie) {
      case "Restaurant": return produitsRestaurant;
      case "Pharmacie": return produitsPharmacies;
      case "Épicerie": return produitsEpicerie;
      case "Fleurs": return produitsFleurs;
      case "Sports": return produitsSports;
      default: return produitsRestaurant;
    }
  };

  const ClientSidebar = () => (
    <aside style={{ width: 220, flexShrink: 0, background: "#FFFFFF", borderRight: "1px solid #EBEBEB", display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <div style={{ padding: 20, borderBottom: "1px solid #EBEBEB" }}>
        <div style={{ ...RF, fontWeight: 900, fontSize: 20, color: "#0D0D0D" }}><span style={{ color: COLORS.primary }}>●</span> Swift</div>
        <div style={{ fontSize: 11, color: "#888888", marginTop: 4 }}>Espace client</div>
      </div>
      {[
        ["dashboard", "🏠", "Accueil"],
        ["dashboard", "🛒", "Boutiques"],
        ["cart", "📦", "Panier", cartN],
        ["history", "📜", "Commandes"],
        ["profile", "👤", "Profil"],
      ].map(([sc, ic, lb, badge]) => {
        const active = (sc === "dashboard" && screen === "dashboard" && lb === "Accueil") || (sc === "dashboard" && screen === "dashboard" && lb === "Boutiques") || screen === sc;
        const nav = () => {
          if (!isAuthenticated) { go("login"); return; }
          if (lb === "Boutiques") { setCatF(null); go("dashboard"); } else go(sc);
        };
        return (
          <button key={lb} type="button" onClick={nav} style={{ ...RF, textAlign: "left", margin: "4px 12px", padding: "12px 14px", borderRadius: 12, border: active ? "1px solid #FF6B00" : "1px solid transparent", borderLeft: active ? "3px solid #FF6B00" : "3px solid transparent", background: active ? "#FFF3EA" : "transparent", color: active ? "#FF6B00" : "#555555", fontWeight: active ? 800 : 600, fontSize: 14, cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 10, position: "relative" }}>
            <span>{ic}</span>{lb}
            {badge > 0 && <span style={{ marginLeft: "auto", background: COLORS.primary, color: COLORS.white, fontSize: 10, minWidth: 18, height: 18, borderRadius: 9, display: "grid", placeItems: "center" }}>{badge}</span>}
          </button>
        );
      })}
      <div style={{ marginTop: "auto", padding: 16, borderTop: "1px solid #EBEBEB", display: "flex", alignItems: "center", gap: 10 }}>
        <Avatar emoji="👤" size={40} />
        <div><div style={{ fontWeight: 700, fontSize: 13, color: "#0D0D0D" }}>{user?.name || "Invité"}</div><div style={{ fontSize: 11, color: "#888888" }}>Casablanca</div></div>
      </div>
    </aside>
  );

  const Landing = () => {
    const roleCards = [
      { icon: "👤", title: "Client", desc: "Commander et suivre vos livraisons", screen: "login" },
      { icon: "🛵", title: "Livreur", desc: "Accepter et livrer les commandes", screen: "livreur_dashboard" },
      { icon: "🏪", title: "Entreprise", desc: "Gérer catalogue et commandes", screen: "enterprise_dashboard" },
      { icon: "⚙️", title: "Admin", desc: "Superviser la plateforme Swift", screen: "admin_dashboard" },
    ];
    return (
    <div style={{ ...RF, opacity: landFade, transition: "opacity 0.5s", background: COLORS.white, minHeight: "100vh" }}>
      <header style={{ position: "sticky", top: 0, zIndex: 20, height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 40px", background: "rgba(255,255,255,0.92)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${COLORS.border}` }}>
        <div style={{ fontWeight: 900, fontSize: 22, display: "flex", alignItems: "center", gap: 10 }}><span style={{ width: 10, height: 10, borderRadius: "50%", background: COLORS.primary }} />Swift</div>
        <nav style={{ display: "flex", gap: 28, fontSize: 14, color: COLORS.muted }}>
          <a className="top-nav-link" href="#features" style={{ color: "inherit", textDecoration: "none" }}>Fonctionnalités</a>
          <a className="top-nav-link" href="#entreprises" style={{ color: "inherit", textDecoration: "none" }}>Entreprises</a>
          <a className="top-nav-link" href="#roles" style={{ color: "inherit", textDecoration: "none" }}>Livreurs</a>
          <a className="top-nav-link" href="#apropos" style={{ color: "inherit", textDecoration: "none" }}>À propos</a>
        </nav>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button type="button" onClick={() => go("login")} style={{ ...RF, border: "none", background: "none", color: COLORS.muted, fontWeight: 600, cursor: "pointer" }}>Se connecter</button>
          <div className="swift-btn-hover"><Btn size="sm" onClick={() => go("register")}>Télécharger l'app →</Btn></div>
        </div>
      </header>
      <section className="reveal-on-scroll" style={{ maxWidth: 1200, margin: "0 auto", padding: "84px 60px 72px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>
        <div>
          <div style={{ ...RF, color: COLORS.primary, fontSize: 11, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase" }}>Livraison express · Casablanca</div>
          <h1 style={{ ...RF, fontSize: 52, fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.05, margin: "16px 0", color: COLORS.black }}>Tout ce dont vous avez besoin, livré en <span style={{ color: COLORS.primary, borderBottom: `4px solid ${COLORS.primary}` }}>moins de 30 min.</span></h1>
          <p style={{ color: COLORS.muted, fontSize: 16, lineHeight: 1.8, maxWidth: 480 }}>Swift relie clients, commerçants et livreurs pour une expérience fluide partout au Maroc.</p>
          <div style={{ display: "flex", gap: 14, marginTop: 24 }}>
            <div className="swift-btn-hover"><Btn size="lg" onClick={() => go("register")}>Commander maintenant</Btn></div>
            <div className="swift-btn-hover"><Btn size="lg" variant="outline" onClick={() => { const node = document.getElementById("solution"); if (node) node.scrollIntoView({ behavior: "smooth" }); }}>▶ Voir comment ça marche</Btn></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", marginTop: 36, borderTop: `1px solid ${COLORS.border}`, paddingTop: 24 }}>
            {[["50+", "Partenaires"], ["2 400", "Cmd·jour"], ["98%", "Satisfaction"], ["<12", "Min livrés"]].map(([n, l], i) => (
              <div key={l} style={{ textAlign: "center", borderRight: i < 3 ? `1px solid ${COLORS.border}` : "none" }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: COLORS.primary }}>{n}</div><div style={{ fontSize: 11, color: COLORS.muted, fontWeight: 600 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <Card className="lift-card" style={{ padding: 28, background: "linear-gradient(135deg,#FF6B00,#FF3500)", border: "none", color: COLORS.white }}>
            <div style={{ fontSize: 13, opacity: 0.9 }}>En cours · Commande #0042</div>
            <div style={{ fontSize: 32, fontWeight: 900, marginTop: 8 }}>Arrivée dans 8 min</div>
            <div style={{ fontSize: 14, marginTop: 8, opacity: 0.85 }}>📍 2,3 km · En route</div>
            <div style={{ fontSize: 56, textAlign: "right" }}>🛵</div>
          </Card>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
            {CAT_CLIENT.slice(0, 6).map((c) => <Badge key={c.id} variant="info">{c.icon} {c.label}</Badge>)}
            <Badge variant="muted">+6 autres →</Badge>
          </div>
        </div>
      </section>
      <section className="reveal-on-scroll" style={{ background: "#F0EFE9", padding: "56px 60px", borderTop: `1px solid ${COLORS.border}` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <div><div style={{ color: COLORS.primary, fontWeight: 800, fontSize: 10, letterSpacing: "0.2em" }}>NOS PARTENAIRES</div><div style={{ fontWeight: 900, fontSize: 22 }}>50+ enseignes vous font confiance</div></div>
          <Btn variant="outline" size="sm">Voir tout →</Btn>
        </div>
        <MarqueeRow items={PARTNERS.slice(0, 8)} lightBg /><div style={{ height: 12 }} /><MarqueeRow items={[...PARTNERS.slice(8), ...PARTNERS.slice(0, 4)]} reverse lightBg />
      </section>
      <section id="apropos" className="reveal-on-scroll" style={{ background: COLORS.cream, padding: "64px 60px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
          {["⏳ Attentes interminables", "📞 Appels sans fin", "❌ Mauvaises commandes"].map((t) => <Card className="lift-card" key={t} style={{ padding: 20 }}><div style={{ fontWeight: 700 }}>{t}</div></Card>)}
        </div>
        <Card style={{ maxWidth: 1200, margin: "20px auto 0", padding: 20, border: `2px solid ${COLORS.primary}` }}><strong style={{ color: COLORS.primary }}>Swift a été conçu pour résoudre exactement ces problèmes.</strong></Card>
      </section>
      <section id="solution" className="reveal-on-scroll" style={{ padding: "64px 60px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, maxWidth: 1200, margin: "0 auto" }}>
        <div>
          <div style={{ color: COLORS.primary, fontWeight: 800, fontSize: 10, letterSpacing: "0.2em" }}>LA SOLUTION</div>
          <h2 style={{ fontSize: 42, fontWeight: 900, letterSpacing: "-0.03em", margin: "8px 0" }}>Une plateforme. Trois acteurs.</h2>
          <div style={{ fontSize: 42, fontWeight: 900, color: COLORS.primary }}>Zero friction.</div>
          <p style={{ color: COLORS.muted, lineHeight: 1.7 }}>Une interface unique pour commander, livrer et piloter votre activité.</p>
          {["👤 CLIENT", "🛵 LIVREUR", "⚙️ ADMIN"].map((t, i) => (
            <button key={t} type="button" onClick={() => setActor(i)} className="lift-card" style={{ ...RF, width: "100%", textAlign: "left", marginTop: 8, padding: 14, borderRadius: 14, border: actor === i ? `2px solid ${COLORS.primary}` : `1px solid ${COLORS.border}`, background: actor === i ? COLORS.white : "transparent", cursor: "pointer", transition: "all 0.25s", fontWeight: 800 }}>{t}</button>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "repeat(3,100px)", gap: 8 }}>
          <div style={{ gridRow: "span 2", background: "linear-gradient(145deg,#3d2818,#1f1510)", borderRadius: 18, display: "grid", placeItems: "center", color: COLORS.white, fontWeight: 800 }}>🏪 RESTAURANT</div>
          <div style={{ background: "linear-gradient(145deg,#FF6B00,#FF3500)", borderRadius: 18, display: "grid", placeItems: "center", color: COLORS.white, fontWeight: 800 }}>💊 PHARMACIE</div>
          <div style={{ background: "radial-gradient(circle at top,#3a2a1d,#141419)", borderRadius: 18, display: "grid", placeItems: "center", color: COLORS.white, fontWeight: 800 }}>☕ CAFÉ</div>
          <div style={{ background: "linear-gradient(145deg,#1f2e48,#0f172a)", borderRadius: 18, display: "grid", placeItems: "center", color: COLORS.white, fontWeight: 800 }}>👗 MODE</div>
          <div style={{ background: "linear-gradient(145deg,#164e39,#0f3325)", borderRadius: 18, display: "grid", placeItems: "center", color: COLORS.white, fontWeight: 800 }}>🛒 ÉPICERIE</div>
        </div>
      </section>
      <section id="roles" className="reveal-on-scroll" style={{ padding: "64px 60px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ color: COLORS.primary, fontWeight: 800, fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase" }}>CHOISISSEZ VOTRE RÔLE</div>
        <h3 style={{ fontSize: 34, fontWeight: 900, letterSpacing: "-0.03em", margin: "8px 0 18px" }}>Accédez à l’interface qui vous correspond</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
          {roleCards.map((r) => (
            <div key={r.title} onClick={() => go(r.screen)} className="role-card" style={{ color: COLORS.black, border: `1px solid ${COLORS.border}`, borderRadius: 20, padding: 18, background: "linear-gradient(180deg,#fff,#fff8f3)", cursor: "pointer" }}>
              <div className="icon-float" style={{ fontSize: 34 }}>{r.icon}</div>
              <div style={{ marginTop: 8, fontWeight: 900, fontSize: 18 }}>{r.title}</div>
              <div style={{ fontSize: 13, color: COLORS.muted, marginTop: 6, lineHeight: 1.55 }}>{r.desc}</div>
              <div style={{ marginTop: 12, color: COLORS.primary, fontWeight: 800 }}>Accéder →</div>
            </div>
          ))}
        </div>
      </section>
      <section className="reveal-on-scroll" style={{ background: COLORS.cream, padding: "64px 60px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
          {["Choisissez 👆", "Commandez ✅", "On s'occupe du reste 🛵", "Recevez à votre porte 📦"].map((x, i) => <Card className="lift-card" key={x} style={{ padding: 20 }}><div style={{ color: COLORS.primary, fontWeight: 900 }}>0{i + 1}</div><div style={{ fontWeight: 700, marginTop: 8 }}>{x}</div></Card>)}
        </div>
        <Card style={{ maxWidth: 1200, margin: "24px auto 0", padding: 20, fontStyle: "italic", color: COLORS.muted }}>"Chaque minute compte." <span style={{ color: COLORS.primary, fontStyle: "normal", fontWeight: 800 }}>— L'équipe Swift</span></Card>
      </section>
      <section id="features" className="reveal-on-scroll" style={{ padding: "64px 60px", maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
        <div>
          {[["⚡", "Dispatch automatique", "<3 s"], ["📡", "Tracking WebSocket", "GPS 5 s"], ["🏢", "Multi-entreprises", "Une interface"], ["🔔", "Notifications", "Alertes utiles"]].map(([ic, ti, de]) => (
            <div className="lift-card" key={ti} style={{ display: "flex", gap: 14, marginBottom: 16, padding: 16, background: COLORS.card, borderRadius: 14 }}><span className="icon-float" style={{ fontSize: 28 }}>{ic}</span><div><div style={{ fontWeight: 800 }}>{ti}</div><div style={{ fontSize: 13, color: COLORS.muted }}>{de}</div></div></div>
          ))}
        </div>
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>{[["50+", "Actifs"], ["2 400", "Cmd/jour"]].map(([a, b]) => <StatCard key={b} value={a} label={b} />)}</div>
          <Card className="lift-card" style={{ marginTop: 12, padding: 16 }}><div style={{ color: COLORS.yellow }}>★★★★★</div><div style={{ fontStyle: "italic", color: COLORS.muted }}>« Livraison toujours à l'heure à Casa. »</div><div style={{ fontWeight: 800, marginTop: 8 }}>Leila · Casablanca</div></Card>
        </div>
      </section>
      <section className="reveal-on-scroll" style={{ background: COLORS.cream, padding: "64px 60px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 12 }}>
          {CAT_CLIENT.map((c) => <Card className="lift-card" key={c.id} style={{ padding: 16, textAlign: "center" }}><div className="icon-float" style={{ fontSize: 28 }}>{c.icon}</div><div style={{ fontSize: 11, fontWeight: 700 }}>{c.label}</div></Card>)}
        </div>
      </section>
      <section id="entreprises" className="reveal-on-scroll" style={{ padding: "64px 60px", maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
        <div><h3 style={{ fontSize: 28, fontWeight: 900 }}>Augmentez vos ventes de <span style={{ color: COLORS.primary }}>40%</span></h3><ul style={{ color: COLORS.muted, lineHeight: 2 }}><li>Zéro frais d'installation</li><li>Tableau de bord temps réel</li><li>Livreurs disponibles</li><li>Support 7j/7</li></ul></div>
        <Card style={{ padding: 24, border: `2px solid ${COLORS.primary}` }}>
          <div style={{ fontSize: 36, fontWeight: 900 }}>0 MAD</div><div style={{ color: COLORS.muted }}>frais d'installation</div>
          <div className="swift-btn-hover"><Btn full style={{ marginTop: 16 }} onClick={() => go("enterprise_dashboard")}>Démarrer avec Swift →</Btn></div>
        </Card>
      </section>
      <section className="reveal-on-scroll" style={{ background: COLORS.primary, padding: "56px 60px", textAlign: "center", color: COLORS.white }}>
        <h3 style={{ fontSize: 28, fontWeight: 900 }}>Prêt à commander ?</h3>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 20 }}>
          <div className="swift-btn-hover"><Btn variant="white" size="lg" onClick={() => go("register")}>Créer mon compte gratuitement →</Btn></div>
          <div className="swift-btn-hover"><Btn variant="outline" size="lg" style={{ borderColor: COLORS.white, color: COLORS.white }} onClick={() => go("login")}>Se connecter</Btn></div>
        </div>
      </section>
      <footer style={{ background: COLORS.black, color: COLORS.white, padding: 40 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "2fr repeat(4,1fr)", gap: 24, fontSize: 13 }}>
          <div><div style={{ fontWeight: 900, fontSize: 20 }}>⚡ Swift</div><div style={{ opacity: 0.7, marginTop: 8 }}>Livraison express au Maroc.</div></div>
          {["Produit", "Entreprise", "Aide", "Légal"].map((h) => <div key={h}><div style={{ fontWeight: 800 }}>{h}</div><div style={{ opacity: 0.6, marginTop: 8 }}>Liens</div></div>)}
        </div>
        <div style={{ textAlign: "center", marginTop: 32, opacity: 0.5, fontSize: 12 }}>© 2026 Swift Maroc · Casablanca</div>
      </footer>
      <div style={{ position: "fixed", bottom: 16, left: 16, zIndex: 40 }}><div className="swift-btn-hover"><Btn size="sm" variant="ghost" onClick={() => { const node = document.getElementById("roles"); if (node) node.scrollIntoView({ behavior: "smooth" }); }}>↕ Changer de rôle</Btn></div></div>
    </div>
  );
  };

  const AuthCard = ({ children }) => (
    <div style={{ minHeight: "100vh", background: COLORS.bgDark, display: "grid", placeItems: "center", padding: 24, position: "relative" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 0%, rgba(255,107,0,0.25), transparent 55%)" }} />
      <Card dark style={{ width: "100%", maxWidth: 480, padding: 36, position: "relative", zIndex: 1 }}>{children}</Card>
      <Btn size="sm" variant="ghost" style={{ position: "fixed", top: 16, left: 16 }} onClick={() => go("landing")}>← Accueil</Btn>
    </div>
  );

  if (screen === "landing") return <Landing />;
  if (screen === "login") return (
    <AuthCard>
      <div style={{ textAlign: "center", fontSize: 40 }}>🔐</div>
      <h1 style={{ ...RF, color: COLORS.textDark, fontWeight: 900, fontSize: 26, textAlign: "center" }}>Bon retour !</h1>
      <p style={{ textAlign: "center", color: COLORS.textMuted, fontSize: 14 }}>Connectez-vous à Swift</p>
      <Input icon="✉️" placeholder="Email" value={email} onChange={setEmail} />
      <Input icon="🔒" type="password" placeholder="Mot de passe" value={pass} onChange={setPass} />
      {authErr && <div style={{ color: COLORS.red, fontSize: 12, marginBottom: 8 }}>{authErr}</div>}
      <div style={{ textAlign: "right", marginBottom: 12 }}><button type="button" onClick={() => go("forgot")} style={{ ...RF, border: "none", background: "none", color: COLORS.primary, cursor: "pointer", fontWeight: 700 }}>Mot de passe oublié ?</button></div>
      <Btn full onClick={async () => {
        if (!email || !pass) return;
        try {
          setAuthErr("");
          const r = await api("/login", { method: "POST", body: JSON.stringify({ username: email, password: pass }) });
          setUser({ name: r.username || email, email: r.username || email, city: "Casablanca" });
          setIsAuthenticated(true);
          go("dashboard");
        } catch (e) {
          setAuthErr(e.message);
        }
      }}>Se connecter</Btn>
      <div style={{ textAlign: "center", marginTop: 16, color: COLORS.textMuted }}><button type="button" style={{ ...RF, border: "none", background: "none", color: COLORS.primary, cursor: "pointer" }} onClick={() => go("register")}>Créer un compte</button></div>
      <button type="button" onClick={() => go("landing")} style={{ ...RF, border: "none", background: "none", color: COLORS.textMuted, cursor: "pointer", marginTop: 12, fontSize: 12 }}>← Retour à l'accueil</button>
    </AuthCard>
  );
  if (screen === "register") return (
    <AuthCard>
      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}><div style={{ flex: 1, height: 4, borderRadius: 4, background: COLORS.primary }} /><div style={{ flex: 1, height: 4, borderRadius: 4, background: regStep === 2 ? COLORS.primary : COLORS.borderDark }} /></div>
      {regStep === 1 ? <>
        <h1 style={{ color: COLORS.textDark, fontWeight: 900, fontSize: 24 }}>Créer un compte</h1>
        <Input icon="👤" placeholder="Nom complet" value={name} onChange={setName} />
        <Input icon="✉️" placeholder="Email" value={email} onChange={setEmail} />
        <Btn full onClick={() => name && email && setRegStep(2)}>Continuer →</Btn>
      </> : <>
        <h1 style={{ color: COLORS.textDark, fontWeight: 900, fontSize: 24 }}>Sécuriser le compte</h1>
        <Input icon="🔒" type="password" placeholder="Mot de passe" value={pass} onChange={setPass} />
        <Btn full onClick={async () => {
          try {
            setAuthErr("");
            await api("/register", { method: "POST", body: JSON.stringify({ username: email || name, password: pass || "123456", role: "client" }) });
            await api("/login", { method: "POST", body: JSON.stringify({ username: email || name, password: pass || "123456" }) });
            setUser({ name: name || "Client", email: email || name, city: "Casablanca" });
            setIsAuthenticated(true);
            go("dashboard");
          } catch (e) {
            setAuthErr(e.message);
          }
        }}>Créer mon compte 🎉</Btn>
      </>}
      {authErr && <div style={{ color: COLORS.red, fontSize: 12, marginTop: 8 }}>{authErr}</div>}
      <button type="button" onClick={() => regStep === 2 ? setRegStep(1) : go("landing")} style={{ ...RF, marginTop: 12, border: "none", background: "none", color: COLORS.textMuted, cursor: "pointer" }}>← Retour</button>
    </AuthCard>
  );
  if (screen === "forgot") return (
    <AuthCard>
      {!forgotSent ? <>
        <h1 style={{ color: COLORS.textDark, fontWeight: 900 }}>Mot de passe oublié</h1>
        <Input icon="✉️" value={email} onChange={setEmail} placeholder="Email" />
        <Btn full onClick={() => setForgotSent(true)}>Envoyer le lien</Btn>
      </> : <>
        <div style={{ textAlign: "center", fontSize: 56 }}>📬</div>
        <h1 style={{ textAlign: "center", color: COLORS.textDark, fontWeight: 900 }}>Email envoyé !</h1>
        <Btn full onClick={() => go("login")}>Retour à la connexion</Btn>
      </>}
    </AuthCard>
  );

  const shell = (body) => (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F5F4F0" }}>
      <ClientSidebar />
      <main style={{ flex: 1, overflow: "auto", background: "#F5F4F0" }}>
        <PageFade>{body}</PageFade>
      </main>
      <Btn size="sm" variant="ghost" style={{ position: "fixed", top: 12, right: 12, zIndex: 50 }} onClick={() => go("landing")}>← Accueil</Btn>
    </div>
  );

  if (screen === "livreur_dashboard") return <LivreurAppPlatform initialScreen="app" onBackToLanding={() => go("landing")} />;
  if (screen === "enterprise_dashboard") return <EnterpriseAppPlatform initialScreen="app" onBackToLanding={() => go("landing")} />;
  if (screen === "admin_dashboard") return <AdminAppPlatform initialScreen="app" onBackToLanding={() => go("landing")} orders={orders} />;

  if (screen === "dashboard" && !isAuthenticated) return go("login"), null;
  if (screen === "dashboard") return shell(
    <div style={{ padding: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div><div style={{ color: COLORS.textMuted, fontSize: 14 }}>Bonjour 👋</div><div style={{ fontSize: 28, fontWeight: 900, color: COLORS.textDark }}>Que souhaitez-vous ?</div></div>
        <input placeholder="Rechercher…" style={{ ...RF, width: 340, padding: "12px 20px", borderRadius: 50, border: "1px solid #EBEBEB", background: "#F8F8F8", color: "#0D0D0D" }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        <Card style={{ padding: 20, background: "linear-gradient(135deg,#FF6B00,#FF3500)", border: "none", color: COLORS.white }}><div style={{ fontWeight: 800 }}>Livraison gratuite</div><div style={{ fontSize: 24 }}>🛵</div></Card>
        <StatCard value="<12 min" label="Délai moyen" />
        <StatCard value="22" label="Enseignes" />
        <StatCard value="2400" label="Cmd / jour" />
      </div>
      <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 20, paddingBottom: 8 }}>
        <button type="button" onClick={() => setCatF(null)} style={{ ...RF, padding: "8px 16px", borderRadius: 50, border: "1px solid #EBEBEB", background: !catF ? COLORS.primary : "#FFFFFF", color: !catF ? "#FFFFFF" : "#0D0D0D", cursor: "pointer", whiteSpace: "nowrap" }}>Tout</button>
        {CAT_CLIENT.map((c) => <button key={c.id} type="button" onClick={() => setCatF(c.id)} style={{ ...RF, padding: "8px 16px", borderRadius: 50, border: "1px solid #EBEBEB", background: catF === c.id ? COLORS.primary : "#FFFFFF", color: catF === c.id ? "#FFFFFF" : "#0D0D0D", cursor: "pointer", whiteSpace: "nowrap" }}>{c.icon} {c.label}</button>)}
      </div>
      <div style={{ fontWeight: 800, color: COLORS.textDark, marginBottom: 12 }}>Près de vous ({livBiz.length})</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 14 }}>
        {livBiz.map((b) => (
          <Card key={b.id} style={{ padding: 16, cursor: "pointer", background: "#FFFFFF" }} onClick={() => { setBiz(b); go("catalogue"); }}>
            <div style={{ fontSize: 36 }}>{b.icon}</div>
            <div style={{ fontWeight: 800, color: COLORS.textDark }}>{b.name}</div>
            <div style={{ fontSize: 12, color: COLORS.textMuted }}>{b.cat} · {b.time} min</div>
            <div style={{ color: COLORS.yellow, fontWeight: 700 }}>★ {b.rating}</div>
          </Card>
        ))}
      </div>
    </div>
  );

  if (screen === "catalogue" && !isAuthenticated) return go("login"), null;
  if (screen === "catalogue") return shell(
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
        <Btn size="sm" variant="ghost" onClick={() => go("dashboard")}>←</Btn>
        <div style={{ flex: 1 }}><div style={{ fontWeight: 900, fontSize: 20, color: COLORS.textDark }}>{biz?.name}</div><div style={{ color: COLORS.textMuted, fontSize: 13 }}>★ {biz?.rating} · {biz?.time} min</div></div>
        {cartN > 0 && <Btn size="sm" onClick={() => go("cart")}>Voir le panier ({cartN})</Btn>}
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>{["All", "<5", "5-10", ">10"].map((p) => <Btn key={p} size="sm" variant={priceF === p ? "primary" : "ghost"} onClick={() => setPriceF(p)}>{p === "All" ? "Tous" : p === "<5" ? "< 5 €" : p === "5-10" ? "5–10 €" : "> 10 €"}</Btn>)}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 14 }}>
        {getMenuByCategorie(
          biz?.cat === "restaurant" ? "Restaurant" :
          biz?.cat === "pharmacy" ? "Pharmacie" :
          biz?.cat === "groceries" ? "Épicerie" :
          biz?.cat === "flowers" ? "Fleurs" :
          biz?.cat === "sports" ? "Sports" : "Restaurant"
        ).filter((p) => priceF === "All" || (priceF === "<5" && p.prix < 5) || (priceF === "5-10" && p.prix >= 5 && p.prix <= 10) || (priceF === ">10" && p.prix > 10)).map((p, idx) => (
          <Card key={`${p.nom}-${idx}`} style={{ padding: 16, background: "#FFFFFF" }}>
            <img
              src={p.image}
              alt={p.nom}
              style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 12, marginBottom: 12, backgroundColor: "#222" }}
              onError={(e) => { e.target.style.display = "none"; }}
            />
            <div style={{ fontWeight: 700, color: "#0D0D0D", marginTop: 8 }}>{p.nom}</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
              <span style={{ color: COLORS.primary, fontWeight: 900 }}>{eur(p.prix)}</span>
              <button type="button" onClick={() => addCart({ id: `${biz?.id}-${idx}`, name: p.nom, price: p.prix, icon: "🛍️" })} style={{ ...RF, width: 32, height: 32, borderRadius: 10, border: "none", background: COLORS.primary, color: COLORS.white, cursor: "pointer", fontWeight: 900 }}>+</button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  if (screen === "cart" && !isAuthenticated) return go("login"), null;
  if (screen === "cart") return shell(
    <div style={{ padding: 24, display: "grid", gridTemplateColumns: "1fr 360px", gap: 24 }}>
      <div>
        <h1 style={{ color: COLORS.textDark, fontWeight: 900, fontSize: 24 }}>Mon panier</h1>
        {!cart.length ? <Card style={{ padding: 48, textAlign: "center", marginTop: 24, background: "#FFFFFF" }}><div style={{ fontSize: 48 }}>🛒</div><p style={{ color: COLORS.textMuted }}>Votre panier est vide</p><Btn onClick={() => go("dashboard")}>Parcourir les boutiques</Btn></Card> : cart.map((i) => (
          <Card key={i.id} style={{ padding: 16, marginTop: 12, display: "flex", alignItems: "center", gap: 14, background: "#FFFFFF" }}>
            <span style={{ fontSize: 32 }}>{i.icon}</span>
            <div style={{ flex: 1 }}><div style={{ fontWeight: 700, color: COLORS.textDark }}>{i.name}</div><div style={{ color: COLORS.primary, fontWeight: 900 }}>{eur(i.price * i.qty)}</div></div>
            <Btn size="sm" variant="ghost" onClick={() => setCart((prev) => prev.flatMap((x) => x.id !== i.id ? [x] : x.qty > 1 ? [{ ...x, qty: x.qty - 1 }] : []))}>−</Btn>
            <span style={{ color: COLORS.textDark, fontWeight: 800 }}>{i.qty}</span>
            <Btn size="sm" onClick={() => setCart((prev) => prev.map((x) => x.id === i.id ? { ...x, qty: x.qty + 1 } : x))}>+</Btn>
          </Card>
        ))}
      </div>
      <div>
        <Card style={{ padding: 20, position: "sticky", top: 24, background: "#FFFFFF" }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: COLORS.textMuted }}><span>Sous-total</span><span>{eur(subtotal)}</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, color: COLORS.textMuted }}><span>Livraison</span><span>{eur(2.99)}</span></div>
          <div style={{ height: 1, background: COLORS.border, margin: "16px 0" }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 900, fontSize: 20, color: COLORS.primary }}><span>Total</span><span>{eur(subtotal + (cart.length ? 2.99 : 0))}</span></div>
          <Btn full style={{ marginTop: 16 }} disabled={!cart.length} onClick={() => { setCheckoutOk(false); go("checkout"); }}>Passer la commande →</Btn>
        </Card>
      </div>
    </div>
  );

  if (screen === "checkout" && !isAuthenticated) return go("login"), null;
  if (screen === "checkout") return shell(
    checkoutOk ? <div style={{ minHeight: "70vh", display: "grid", placeItems: "center", textAlign: "center" }}>
      <div style={{ fontSize: 72 }}>🎉</div>
      <h1 style={{ color: COLORS.textDark, fontWeight: 900 }}>Commande confirmée !</h1>
      <Btn onClick={() => { setTrackStep(0); go("tracking"); }}>Suivre ma commande 📍</Btn>
    </div> : <div style={{ padding: 24, display: "grid", gridTemplateColumns: "1fr 380px", gap: 24 }}>
      <div>
        <h1 style={{ color: COLORS.textDark, fontWeight: 900 }}>Finaliser</h1>
        <Card style={{ padding: 20, marginTop: 16, background: "#FFFFFF" }}><div style={{ fontWeight: 800, marginBottom: 8 }}>🏠 Adresse</div><Input light value={addr} onChange={setAddr} placeholder="Adresse" /></Card>
        <Card style={{ padding: 20, marginTop: 16, background: "#FFFFFF" }}>
          <div style={{ fontWeight: 800, marginBottom: 8 }}>Paiement</div>
          {[["cash", "💵 Espèces"], ["card", "💳 En ligne"]].map(([k, lab]) => (
            <button key={k} type="button" onClick={() => setPay(k)} style={{ ...RF, width: "100%", padding: 14, marginBottom: 8, borderRadius: 12, border: `1px solid ${pay === k ? COLORS.primary : COLORS.border}`, background: pay === k ? COLORS.primaryGlow : "#F8F8F8", color: "#0D0D0D", cursor: "pointer", textAlign: "left" }}>{lab}</button>
          ))}
        </Card>
      </div>
      <Card style={{ padding: 20, height: "fit-content", background: "#FFFFFF" }}>
        <div style={{ color: COLORS.textMuted, display: "flex", justifyContent: "space-between" }}><span>Total</span><span style={{ color: COLORS.primary, fontWeight: 900 }}>{eur(subtotal + 2.99)}</span></div>
        <Btn full style={{ marginTop: 16 }} onClick={() => {
          const newOrder = {
            id: `#${String(orders.length + 1).padStart(4, "0")}`,
            entreprise: biz?.name || "Entreprise",
            date: new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
            articles: cart,
            total: subtotal + 2.99,
            statut: "Livré",
          };
          setOrders((prev) => [newOrder, ...prev]);
          setCheckoutOk(true);
          setCart([]);
        }}>Confirmer la commande ✅</Btn>
      </Card>
    </div>
  );

  if (screen === "tracking" && !isAuthenticated) return go("login"), null;
  if (screen === "tracking") return shell(
    <div style={{ padding: 24, display: "grid", gridTemplateColumns: "1fr 360px", gap: 24 }}>
      <Card style={{ padding: 40, minHeight: 320, display: "grid", placeItems: "center", background: "#FFFFFF" }}>
        <div style={{ textAlign: "center" }}><div style={{ fontSize: 64 }}>🗺️</div><div style={{ fontWeight: 800, color: COLORS.textDark }}>Carte en temps réel</div>{trackStep === 1 && <div style={{ fontSize: 40, marginTop: 16 }}>🛵</div>}</div>
      </Card>
      <Card style={{ padding: 20, background: "#FFFFFF" }}>
        {[["👨‍🍳", "En préparation"], ["🛵", "En route"], ["✅", "Livré"]].map(([ic, lb], i) => (
          <div key={lb} style={{ display: "flex", gap: 12, marginBottom: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: i <= trackStep ? COLORS.primary : "#F5F4F0", display: "grid", placeItems: "center" }}>{ic}</div>
            <div style={{ color: i <= trackStep ? COLORS.textDark : COLORS.textMuted, fontWeight: 700 }}>{lb}</div>
          </div>
        ))}
        <Btn full variant="ghost" style={{ marginTop: 16 }} onClick={() => go("history")}>Voir mes commandes</Btn>
      </Card>
    </div>
  );

  if (screen === "history" && !isAuthenticated) return go("login"), null;
  if (screen === "history") return shell(
    <div style={{ padding: 24 }}>
      <h1 style={{ color: COLORS.textDark, fontWeight: 900 }}>Mes commandes</h1>
      {orders.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
          <div style={{ fontWeight: 700, fontSize: 18, color: "#0D0D0D", marginBottom: 8 }}>Aucune commande pour l'instant</div>
          <div style={{ color: "#888", marginBottom: 24 }}>Vos commandes passées apparaîtront ici.</div>
          <button type="button" onClick={() => go("dashboard")} style={{ ...RF, border: "none", background: COLORS.primary, color: "#fff", padding: "10px 18px", borderRadius: 999, cursor: "pointer", fontWeight: 700 }}>
            Parcourir les boutiques
          </button>
        </div>
      ) : orders.map((o) => (
        <Card key={o.id} style={{ padding: 16, marginTop: 12, cursor: "pointer", background: "#FFFFFF" }} onClick={() => setHistOpen(histOpen === o.id ? null : o.id)}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div><Badge variant="warning">{o.id}</Badge><div style={{ fontWeight: 800, color: COLORS.black }}>{o.entreprise}</div><div style={{ fontSize: 12, color: COLORS.muted }}>{o.date}</div></div>
            <div style={{ textAlign: "right" }}><div style={{ color: COLORS.primary, fontWeight: 900 }}>{eur(o.total)}</div><Badge variant="success">{o.statut}</Badge></div>
          </div>
          {histOpen === o.id && <div style={{ marginTop: 12, borderTop: `1px solid ${COLORS.border}`, paddingTop: 12 }}>{o.articles.map((it, i) => <Badge key={`${it.name}-${i}`} variant="muted" style={{ marginRight: 6 }}>{it.name} x{it.qty}</Badge>)}<div style={{ display: "flex", gap: 8, marginTop: 12 }}><Btn size="sm" variant="outline">⭐ Évaluer</Btn><Btn size="sm" variant="ghost">🔁 Recommander</Btn></div></div>}
        </Card>
      ))}
    </div>
  );

  if (screen === "profile" && !isAuthenticated) return go("login"), null;
  if (screen === "profile") return shell(
    <div style={{ padding: 24, display: "grid", gridTemplateColumns: "1fr 400px", gap: 24 }}>
      <div>
        <Card style={{ padding: 24, background: "linear-gradient(145deg,#FF6B00,#FF3500)", border: "none", color: COLORS.white }}>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}><Avatar emoji="👤" size={64} /><div><div style={{ fontWeight: 900, fontSize: 22 }}>{user?.name}</div><div style={{ opacity: 0.9 }}>{user?.email}</div><div style={{ fontSize: 13 }}>Casablanca</div></div></div>
        </Card>
        {["Informations personnelles", "Adresses", "Modes de paiement", "Sécurité"].map((t) => <Card key={t} style={{ padding: 16, marginTop: 12, display: "flex", justifyContent: "space-between", cursor: "pointer", background: "#FFFFFF" }}><span>{t}</span><span>›</span></Card>)}
      </div>
      <Card style={{ padding: 20, background: "#FFFFFF" }}>
        <div style={{ fontWeight: 800, marginBottom: 16 }}>Notifications</div>
        {[
          ["Mises à jour commandes", "cmd"],
          ["Promotions", "promo"],
          ["Nouveautés", "news"],
        ].map(([label, key]) => (
          <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <span>{label}</span>
            <Toggle on={profNotif[key]} onToggle={(v) => setProfNotif((p) => ({ ...p, [key]: v }))} />
          </div>
        ))}
        <Btn full variant="danger" style={{ marginTop: 24 }} onClick={() => { setUser(null); setIsAuthenticated(false); go("landing"); }}>Se déconnecter</Btn>
      </Card>
    </div>
  );

  return null;
}

/* ═══════════════ LIVREUR APP (mobile 480px) ═══════════════ */
function LivreurAppPlatform({ initialScreen = "login", onBackToLanding }) {
  const [screen, setScreen] = useState(initialScreen);
  const [online, setOnline] = useState(false);
  const [onboardStep, setOnboardStep] = useState(1);
  const [delStep, setDelStep] = useState(0);
  const [livTab, setLivTab] = useState("encours");
  const [lemail, setLemail] = useState("");
  const [lpass, setLpass] = useState("");
  const go = (s) => setScreen(s);
  const showLivNav = !["login", "onboard"].includes(screen);

  const Shell = ({ children }) => (
    <div style={{ ...RF, minHeight: "100vh", background: COLORS.bgDark, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ width: "100%", maxWidth: 480, flex: 1, position: "relative", display: "flex", flexDirection: "column" }}>
        {children}
        {showLivNav && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", padding: "10px 8px", background: COLORS.surfaceDark, borderTop: `1px solid ${COLORS.borderDark}` }}>
            {[
              ["app", "🏠", "Accueil"],
              ["livraisons", "📦", "Livraisons"],
              ["gains", "💰", "Gains"],
              ["lprof", "👤", "Profil"],
            ].map(([k, ic, lb]) => (
              <button key={k} type="button" onClick={() => go(k)} style={{ ...RF, border: "none", background: "none", color: screen === k ? COLORS.primary : COLORS.textMuted, fontSize: 10, fontWeight: 700, cursor: "pointer" }}>{ic}<div>{lb}</div></button>
            ))}
          </div>
        )}
      </div>
      <div
        onClick={() => onBackToLanding && onBackToLanding()}
        style={{
          color: "#7777A0",
          fontSize: 12,
          fontWeight: 600,
          cursor: "pointer",
          padding: "12px 14px",
          textAlign: "center",
          borderTop: "1px solid #26263A",
          marginTop: "auto",
          width: "100%",
          maxWidth: 480,
        }}
      >
        ← Retour à l'accueil
      </div>
    </div>
  );

  if (screen === "login") return (
    <Shell>
      <div style={{ flex: 1, padding: 24, background: `radial-gradient(circle at 50% 0%, ${COLORS.primaryGlow}, transparent 50%)`, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ fontSize: 64, marginTop: 40 }}>🛵</div>
        <h1 style={{ color: COLORS.textDark, fontWeight: 900, fontSize: 26 }}>Livreur Swift</h1>
        <p style={{ color: COLORS.textMuted }}>Connectez-vous pour démarrer</p>
        <div style={{ width: "100%", marginTop: 24 }}><Input icon="✉️" placeholder="Email" value={lemail} onChange={setLemail} /><Input icon="🔒" type="password" placeholder="Mot de passe" value={lpass} onChange={setLpass} /></div>
        <Btn full style={{ marginTop: 8 }} onClick={() => setScreen("app")}>Connexion</Btn>
        <button type="button" onClick={() => go("onboard")} style={{ ...RF, marginTop: 16, border: "none", background: "none", color: COLORS.primary, cursor: "pointer" }}>Pas encore livreur ? Rejoindre Swift</button>
      </div>
    </Shell>
  );

  if (screen === "onboard") return (
    <Shell>
      <div style={{ padding: 20 }}>
        <ProgressBar pct={(onboardStep / 5) * 100} />
        <h2 style={{ color: COLORS.textDark, fontWeight: 900 }}>Étape {onboardStep}/5</h2>
        {onboardStep === 5 ? <Card dark style={{ padding: 20, marginTop: 16 }}><p>Votre dossier est en cours de validation. Email sous 24h.</p><Btn full onClick={() => go("login")}>OK</Btn></Card> : <>
          <Input placeholder="Prénom" value="" onChange={() => { }} />
          <Btn full onClick={() => setOnboardStep((s) => s + 1)}>Suivant</Btn>
        </>}
      </div>
    </Shell>
  );

  if (screen === "livraisons") return (
    <Shell>
      <div style={{ padding: 16, flex: 1 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>{["encours", "done", "cancel"].map((t) => <Btn key={t} size="sm" variant={livTab === t ? "primary" : "ghost"} onClick={() => setLivTab(t)}>{t === "encours" ? "En cours" : t === "done" ? "Terminées" : "Annulées"}</Btn>)}</div>
        <Card dark style={{ padding: 16 }}><div style={{ fontWeight: 800 }}>Burger Palace → Maarif</div><div style={{ color: COLORS.green, fontWeight: 900 }}>+ 24 MAD</div></Card>
      </div>
    </Shell>
  );

  if (screen === "detail") return (
    <Shell>
      <div style={{ padding: 16 }}>
        <ProgressBar pct={(delStep + 1) * 25} />
        {["Aller chercher", "Récupérer", "Livrer", "Terminé"][delStep]}
        <Btn full style={{ marginTop: 16 }} onClick={() => delStep < 3 ? setDelStep(delStep + 1) : go("app")}>Continuer</Btn>
      </div>
    </Shell>
  );

  if (screen === "gains") return (
    <Shell>
      <div style={{ padding: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>{[["Auj.", "86 €"], ["Sem.", "412 €"], ["Mois", "1840 €"]].map(([a, b]) => <StatCard key={a} dark value={b} label={a} />)}</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 120, marginTop: 24 }}>{[40, 55, 30, 70, 45, 90, 60].map((h, i) => <div key={i} style={{ flex: 1, height: `${h}%`, background: i === 5 ? COLORS.primary : COLORS.cardDark, borderRadius: 6 }} />)}</div>
      </div>
    </Shell>
  );

  if (screen === "lprof") return (
    <Shell>
      <div style={{ padding: 16 }}>
        <Card dark style={{ padding: 20, borderTop: `4px solid ${COLORS.primary}` }}><div style={{ fontWeight: 900, fontSize: 20 }}>Rachid Mansouri</div><div style={{ color: COLORS.yellow }}>★ 4,8</div></Card>
        <Btn full variant="danger" style={{ marginTop: 24 }} onClick={() => go("login")}>Déconnexion</Btn>
      </div>
    </Shell>
  );

  if (screen === "notif") return <Shell><div style={{ padding: 16 }}><Card dark style={{ padding: 16 }}>Nouvelle commande — Accepter ?</Card></div></Shell>;

  /* app home */
  return (
    <Shell>
      <div style={{ flex: 1, overflow: "auto", padding: 16 }}>
        <Card style={{ padding: 20, background: "linear-gradient(135deg,#FF6B00,#FF3500)", border: "none", color: COLORS.white }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 800 }}>{online ? "En ligne · Disponible" : "Hors ligne"}</span>
            <Toggle wide on={online} onToggle={setOnline} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", marginTop: 16, fontSize: 12 }}><div>📦 12</div><div>💰 86 €</div><div>⭐ 4,8</div></div>
        </Card>
        <Card dark style={{ padding: 16, marginTop: 16, border: online ? `2px solid ${COLORS.green}` : undefined, animation: online ? "pulse 2s infinite" : undefined }}>
          <div style={{ fontWeight: 800 }}>Commande #SW-9820</div>
          <div style={{ fontSize: 13, color: COLORS.textMuted }}>PharmaCare → Client Maarif</div>
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}><Btn size="sm" variant="success">Accepter</Btn><Btn size="sm" variant="danger">Refuser</Btn></div>
          <Btn size="sm" variant="ghost" style={{ marginTop: 8 }} onClick={() => go("detail")}>Détail livraison →</Btn>
        </Card>
        <Card dark style={{ padding: 40, marginTop: 16, textAlign: "center" }}><div style={{ fontSize: 48 }}>🗺️</div>Zone Casablanca</Card>
      </div>
    </Shell>
  );
}

/* ═══════════════ ENTERPRISE APP ═══════════════ */
function EnterpriseAppPlatform({ initialScreen = "login", onBackToLanding }) {
  const [screen, setScreen] = useState(initialScreen);
  const [nav, setNav] = useState("dash");
  const [open, setOpen] = useState(false);
  const [obStep, setObStep] = useState(1);

  const Side = () => (
    <aside style={{ width: 240, background: COLORS.white, borderRight: `1px solid ${COLORS.border}`, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <div style={{ padding: 20, fontWeight: 900 }}>🏪 Espace Entreprise</div>
      {[
        ["dash", "📊", "Tableau de bord"],
        ["cmd", "📋", "Commandes"],
        ["cat", "🛒", "Catalogue"],
        ["stats", "📈", "Statistiques"],
        ["fin", "💰", "Finances"],
        ["param", "⚙️", "Paramètres"],
        ["sup", "🆘", "Support"],
      ].map(([k, i, l]) => (
        <button key={k} type="button" onClick={() => { setNav(k); setScreen("app"); }} style={{ ...RF, textAlign: "left", padding: "12px 20px", border: "none", background: nav === k ? COLORS.primaryPale : "transparent", color: nav === k ? COLORS.primary : COLORS.black, fontWeight: 700, cursor: "pointer" }}>{i} {l}</button>
      ))}
      <div style={{ marginTop: "auto", padding: 16, display: "flex", alignItems: "center", gap: 8 }}>
        <Avatar emoji="🍔" size={36} /><div><div style={{ fontWeight: 700, fontSize: 13 }}>Burger Palace</div><Badge variant="success">En ligne</Badge></div>
      </div>
      <div
        onClick={() => onBackToLanding && onBackToLanding()}
        style={{
          color: "#7777A0",
          fontSize: 12,
          fontWeight: 600,
          cursor: "pointer",
          padding: "12px 14px",
          textAlign: "center",
          borderTop: "1px solid #26263A",
          marginTop: "auto"
        }}
      >
        ← Retour à l'accueil
      </div>
    </aside>
  );

  if (screen === "login") return (
    <div style={{ ...RF, minHeight: "100vh", background: COLORS.cream, display: "grid", placeItems: "center" }}>
      <Card style={{ width: "100%", maxWidth: 500, padding: 40 }}>
        <div style={{ textAlign: "center", fontWeight: 800, color: COLORS.primary, letterSpacing: "0.15em", fontSize: 10 }}>ESPACE ENTREPRISE</div>
        <h1 style={{ textAlign: "center", fontWeight: 900 }}>Connexion</h1>
        <Input light icon="✉️" placeholder="Email" value="" onChange={() => { }} />
        <Input light icon="🔒" type="password" placeholder="Mot de passe" value="" onChange={() => { }} />
        <Btn full onClick={() => setScreen("app")}>Connexion</Btn>
        <button type="button" onClick={() => { setObStep(1); setScreen("eob"); }} style={{ ...RF, border: "none", background: "none", color: COLORS.primary, cursor: "pointer", marginTop: 12, width: "100%" }}>Créer mon espace entreprise</button>
      </Card>
      <Btn size="sm" variant="outline" style={{ position: "fixed", top: 12, left: 12 }} onClick={() => onBackToLanding && onBackToLanding()}>← Accueil</Btn>
    </div>
  );

  if (screen === "eob") return (
    <div style={{ padding: 40, background: COLORS.cream, minHeight: "100vh" }}>
      <Btn size="sm" onClick={() => setScreen("login")}>←</Btn>
      <h2>Inscription entreprise — Étape {obStep}/5</h2>
      <ProgressBar pct={(obStep / 5) * 100} />
      {obStep === 5 ? <p>Validation sous 24h.</p> : <Btn onClick={() => setObStep(obStep + 1)}>Suivant</Btn>}
    </div>
  );

  const Main = () => {
    if (nav === "cmd") return <div style={{ padding: 28 }}><h1 style={{ fontWeight: 900 }}>Commandes</h1><Btn size="sm">Nouvelles</Btn><Card style={{ padding: 16, marginTop: 12 }}>#SW-9821 · Yasmine · <Badge variant="warning">Nouvelle</Badge><div style={{ marginTop: 8 }}><Btn size="sm" variant="success">Accepter</Btn> <Btn size="sm" variant="danger">Refuser</Btn></div></Card></div>;
    if (nav === "cat") return <div style={{ padding: 28 }}><h1 style={{ fontWeight: 900 }}>Mon catalogue</h1><Btn onClick={() => setOpen(true)}>Ajouter un produit +</Btn><div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginTop: 16 }}>{PRODUCTS.map((p) => <Card key={p.id} style={{ padding: 16 }}><div style={{ fontSize: 32 }}>{p.icon}</div><div style={{ fontWeight: 700 }}>{p.name}</div><div>{eur(p.price)}</div><Toggle on onToggle={() => { }} /></Card>)}</div><Modal open={open} onClose={() => setOpen(false)}><h3>Nouveau produit</h3><Input light placeholder="Nom" value="" onChange={() => { }} /><Btn full onClick={() => setOpen(false)}>Enregistrer</Btn></Modal></div>;
    if (nav === "stats") return <div style={{ padding: 28 }}><h1 style={{ fontWeight: 900 }}>Statistiques</h1><div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>{[["Cmd", "124"], ["CA", "18 400 €"], ["Panier moy.", "148 €"], ["Nouv.", "32"]].map(([a, b]) => <StatCard key={a} value={b} label={a} />)}</div><div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 160, marginTop: 24 }}>{[30, 45, 38, 60, 55, 70, 48].map((h, i) => <div key={i} style={{ flex: 1, height: `${h}%`, background: COLORS.primary, borderRadius: 6 }} />)}</div></div>;
    if (nav === "fin") return <div style={{ padding: 28 }}><Card style={{ padding: 24, background: "linear-gradient(135deg,#FF6B00,#FF3500)", border: "none", color: COLORS.white }}><div>Solde disponible</div><div style={{ fontSize: 32, fontWeight: 900 }}>12 450 MAD</div><Btn variant="white">Demander un virement</Btn></Card></div>;
    if (nav === "param") return <div style={{ padding: 28 }}><h1 style={{ fontWeight: 900 }}>Paramètres</h1><Input light label="Nom du commerce" value="Burger Palace" onChange={() => { }} /></div>;
    if (nav === "sup") return <div style={{ padding: 28 }}><h1 style={{ fontWeight: 900 }}>Support</h1><Card style={{ padding: 16 }}>FAQ — cliquez pour développer</Card></div>;
    return (
      <div style={{ padding: 28, background: COLORS.cream, flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}><div><div style={{ color: COLORS.muted }}>Bonjour</div><div style={{ fontSize: 24, fontWeight: 900 }}>Burger Palace 👋</div></div><span style={{ color: COLORS.primary, cursor: "pointer" }}>Voir ma page publique →</span></div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginTop: 24 }}>
          <StatCard value="8 420 MAD" label="CA aujourd'hui" sub="+12 % vs hier" />
          <StatCard value="48" label="Commandes" sub="En cours : 6" />
          <StatCard value="4,8" label="Note moyenne" />
          <StatCard value="18 min" label="Temps livraison" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginTop: 24 }}>
          <Card style={{ padding: 16 }}><div style={{ fontWeight: 800, marginBottom: 12 }}>Commandes récentes</div><table style={{ width: "100%", fontSize: 13 }}><tbody>{MOCK_COMMANDES.slice(0, 4).map((o, i) => <tr key={o.id} style={{ background: i % 2 ? COLORS.card : COLORS.white }}><td style={{ padding: 8 }}>{o.id}</td><td>{o.client}</td><td>{eur(o.montant)}</td><td><Badge variant="info">{o.statut}</Badge></td></tr>)}</tbody></table></Card>
          <div><Card style={{ padding: 16, marginBottom: 12 }}><div>Ouvert / Fermé</div><Toggle on onToggle={() => { }} wide /></Card><Card style={{ padding: 16 }}><div>Horaires : 08:00 – 23:00</div><div style={{ fontSize: 13, color: COLORS.muted, marginTop: 8 }}>Acceptation 96 %</div></Card></div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ ...RF, display: "flex", minHeight: "100vh" }}>
      <Side />
      <Main />
      <Btn size="sm" variant="outline" style={{ position: "fixed", top: 12, right: 12 }} onClick={() => onBackToLanding && onBackToLanding()}>← Accueil</Btn>
    </div>
  );
}

/* ═══════════════ ADMIN APP ═══════════════ */
function AdminAppPlatform({ initialScreen = "login", onBackToLanding, orders = [] }) {
  const [screen, setScreen] = useState(initialScreen);
  const [nav, setNav] = useState("dash");
  const [panel, setPanel] = useState(null);
  const [modal, setModal] = useState(null);
  const CLIENTS = MOCK_CLIENTS;
  const LIVREURS = MOCK_LIVREURS;
  const ENTREPRISES = MOCK_ENTREPRISES;
  const COMMANDES = orders;
  const aujourdhui = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  const totalClients = CLIENTS.length;
  const totalLivreurs = LIVREURS.length;
  const livreursActifs = LIVREURS.filter((l) => l.statut === "Actif" || l.statut === "En ligne").length;
  const totalEntreprises = ENTREPRISES.length;
  const entreprisesActives = ENTREPRISES.filter((e) => e.statut === "Actif" || e.statut === "Active").length;
  const commandesAujourdhui = COMMANDES.filter((c) => c.date === aujourdhui).length;
  const gmvAujourdhui = COMMANDES.reduce((sum, c) => sum + (c.total || 0), 0);
  const commissionPercue = gmvAujourdhui * 0.12;

  const Side = () => (
    <aside style={{ width: 260, background: COLORS.surfaceDark, borderRight: `1px solid ${COLORS.borderDark}`, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: 20, fontWeight: 900, color: COLORS.textDark }}>⚙️ Administration</div>
      {[
        ["dash", "📊", "Vue d'ensemble"],
        ["clients", "👤", "Clients"],
        ["liv", "🛵", "Livreurs"],
        ["ent", "🏪", "Entreprises"],
        ["cmd", "📦", "Commandes"],
        ["fin", "💰", "Finances"],
        ["zone", "🗺️", "Zones"],
        ["mkt", "📢", "Marketing"],
        ["param", "⚙️", "Paramètres"],
        ["logs", "📋", "Logs"],
      ].map(([k, i, l]) => (
        <button key={k} type="button" onClick={() => { setNav(k); setScreen("app"); }} style={{ ...RF, display: "block", width: "100%", textAlign: "left", padding: "12px 20px", border: "none", background: nav === k ? COLORS.primaryGlow : "transparent", color: nav === k ? COLORS.primary : COLORS.textMuted, fontWeight: 700, cursor: "pointer" }}>{i} {l}</button>
      ))}
      <div
        onClick={() => onBackToLanding && onBackToLanding()}
        style={{
          color: "#7777A0",
          fontSize: 12,
          fontWeight: 600,
          cursor: "pointer",
          padding: "12px 14px",
          textAlign: "center",
          borderTop: "1px solid #26263A",
          marginTop: "auto"
        }}
      >
        ← Retour à l'accueil
      </div>
    </aside>
  );

  if (screen === "login") return (
    <div style={{ ...RF, minHeight: "100vh", background: COLORS.bgDark, display: "grid", placeItems: "center" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 0%, rgba(255,107,0,0.2), transparent 50%)" }} />
      <Card dark style={{ width: 420, padding: 32, zIndex: 1 }}>
        <h1 style={{ color: COLORS.textDark, fontWeight: 900, textAlign: "center" }}>⚙️ Admin Swift</h1>
        <Badge variant="warning" style={{ display: "block", textAlign: "center", margin: "12px 0" }}>Accès réservé aux administrateurs</Badge>
        <Input placeholder="Email admin" value="" onChange={() => { }} />
        <Input type="password" placeholder="Mot de passe" value="" onChange={() => { }} />
        <Btn full onClick={() => setScreen("app")}>Connexion sécurisée</Btn>
      </Card>
      <Btn size="sm" variant="ghost" style={{ position: "fixed", top: 12, left: 12 }} onClick={() => onBackToLanding && onBackToLanding()}>← Accueil</Btn>
    </div>
  );

  const Main = () => {
    if (nav === "clients") return (
      <div style={{ padding: 28, flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}><h1 style={{ color: COLORS.textDark, fontWeight: 900 }}>Clients</h1><Btn size="sm">Exporter CSV</Btn></div>
        <table style={{ width: "100%", marginTop: 16, borderCollapse: "collapse", fontSize: 13, color: COLORS.textDark }}>
          <tbody>{MOCK_CLIENTS.map((c, i) => <tr key={c.id} style={{ background: i % 2 ? COLORS.cardDark : COLORS.surfaceDark }}><td style={{ padding: 10 }}>{c.nom}</td><td>{c.email}</td><td>{c.ville}</td><td>{c.cmd}</td><td><button type="button" onClick={() => setPanel(c)} style={{ ...RF, border: "none", background: "none", color: COLORS.primary, cursor: "pointer" }}>Voir</button></td></tr>)}</tbody>
        </table>
        <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 380, background: COLORS.cardDark, borderLeft: `1px solid ${COLORS.borderDark}`, transform: panel ? "translateX(0)" : "translateX(100%)", transition: "transform 0.3s", padding: 24, zIndex: 50, overflow: "auto" }}>
          {panel && <><h3 style={{ color: COLORS.textDark }}>{panel.nom}</h3><p style={{ color: COLORS.textMuted }}>{panel.email}</p><Btn variant="danger" full>Bloquer</Btn><Btn variant="ghost" full style={{ marginTop: 8 }} onClick={() => setPanel(null)}>Fermer</Btn></>}
        </div>
      </div>
    );
    if (nav === "liv") return <div style={{ padding: 28, flex: 1, color: COLORS.textDark }}><h1 style={{ fontWeight: 900 }}>Livreurs</h1><table style={{ width: "100%", fontSize: 13 }}><tbody>{MOCK_LIVREURS.map((x, i) => <tr key={x.id} style={{ background: i % 2 ? COLORS.cardDark : "transparent" }}><td style={{ padding: 8 }}>{x.nom}</td><td>{x.vehicule}</td><td><Badge variant={x.ligne ? "success" : "muted"}>{x.statut}</Badge></td></tr>)}</tbody></table></div>;
    if (nav === "ent") return <div style={{ padding: 28, flex: 1, color: COLORS.textDark }}><h1 style={{ fontWeight: 900 }}>Entreprises</h1><table style={{ width: "100%", fontSize: 13 }}><tbody>{MOCK_ENTREPRISES.map((x, i) => <tr key={x.id} style={{ background: i % 2 ? COLORS.cardDark : "transparent" }}><td style={{ padding: 8 }}>{x.nom}</td><td>{x.cat}</td><td>{mad(x.ca)}</td></tr>)}</tbody></table></div>;
    if (nav === "cmd") return <div style={{ padding: 28, flex: 1, color: COLORS.textDark }}><h1 style={{ fontWeight: 900 }}>Commandes</h1><table style={{ width: "100%", fontSize: 12 }}><tbody>{MOCK_COMMANDES.map((o, i) => <tr key={o.id} style={{ background: i % 2 ? COLORS.cardDark : "transparent" }}><td style={{ padding: 8 }}>{o.id}</td><td>{o.client}</td><td>{eur(o.montant)}</td><td><button type="button" style={{ color: COLORS.primary, border: "none", background: "none", cursor: "pointer" }} onClick={() => setModal(o)}>Détail</button></td></tr>)}</tbody></table><Modal open={!!modal} onClose={() => setModal(null)}>{modal && <><h3 style={{ color: COLORS.textDark }}>{modal.id}</h3><p style={{ color: COLORS.textMuted }}>Timeline complète…</p><Btn full onClick={() => setModal(null)}>Fermer</Btn></>}</Modal></div>;
    if (nav === "fin") return <div style={{ padding: 28, flex: 1 }}><h1 style={{ color: COLORS.textDark, fontWeight: 900 }}>Finances</h1><div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>{[["GMV", "48 230 €"], ["Comm.", "5 627 €"], ["Remb.", "120 €"], ["Net", "42 483 €"]].map(([a, b]) => <StatCard key={a} dark value={b} label={a} />)}</div></div>;
    if (nav === "zone") return <div style={{ padding: 28, flex: 1, color: COLORS.textDark }}><h1 style={{ fontWeight: 900 }}>Zones</h1><Card dark style={{ padding: 120, textAlign: "center" }}>🗺️ Carte interactive (maquette)</Card></div>;
    if (nav === "mkt") return <div style={{ padding: 28, flex: 1, color: COLORS.textDark }}><h1 style={{ fontWeight: 900 }}>Marketing</h1><Btn>Créer une promotion +</Btn></div>;
    if (nav === "param") return <div style={{ padding: 28, flex: 1, color: COLORS.textDark }}><h1 style={{ fontWeight: 900 }}>Paramètres plateforme</h1><Toggle on onToggle={() => { }} /><span style={{ marginLeft: 8 }}>Maintenance</span></div>;
    if (nav === "logs") return <div style={{ padding: 28, flex: 1, color: COLORS.textMuted, fontSize: 13 }}><h1 style={{ color: COLORS.textDark, fontWeight: 900 }}>Logs</h1>{["12:01 admin — Client bloqué", "11:58 admin — Promo créée"].map((l) => <div key={l}>{l}</div>)}</div>;
    return (
      <div style={{ padding: 28, flex: 1, background: COLORS.bgDark }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}><div style={{ fontWeight: 900, color: COLORS.textDark, fontSize: 20 }}>Vue d'ensemble</div><Badge variant="danger">3 alertes</Badge></div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 12 }}>
          <StatCard dark value={totalClients} label="Total Clients" />
          <StatCard dark value={`${livreursActifs}/${totalLivreurs}`} label="Livreurs actifs" />
          <StatCard dark value={totalEntreprises} label="Entreprises" />
          <StatCard dark value={entreprisesActives} label="Entreprises actives" />
          <StatCard dark value={commandesAujourdhui} label="Commandes aujourd'hui" />
          <StatCard dark value={`${gmvAujourdhui.toFixed(2)} MAD`} label="GMV aujourd'hui" sub={`Commission: ${commissionPercue.toFixed(2)} MAD`} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 20, marginTop: 24 }}>
          <Card dark style={{ padding: 20, height: 240 }}><div style={{ fontWeight: 800, color: COLORS.textDark, marginBottom: 12 }}>Revenus plateforme (30 j.)</div><svg width="100%" height="160" viewBox="0 0 300 120"><polyline fill="none" stroke={COLORS.primary} strokeWidth="2" points="0,100 50,80 100,90 150,40 200,50 250,30 300,20" /></svg></Card>
          <Card dark style={{ padding: 16 }}>
            <div style={{ fontWeight: 800, color: COLORS.textDark }}>Flux commandes</div>
            {COMMANDES.length === 0 ? (
              <div style={{ color: "#7777A0", textAlign: "center", padding: 24, fontSize: 14 }}>Aucune commande pour l'instant</div>
            ) : (
              COMMANDES.slice(0, 10).map((o) => <div key={o.id} style={{ fontSize: 12, padding: "8px 0", borderBottom: `1px solid ${COLORS.borderDark}` }}><span style={{ color: COLORS.primary }}>{o.id}</span> · {eur(o.total)} · <span style={{ color: COLORS.textMuted }}>{o.entreprise}</span></div>)
            )}
          </Card>
        </div>
      </div>
    );
  };

  return (
    <div style={{ ...RF, display: "flex", minHeight: "100vh", background: COLORS.bgDark }}>
      <Side />
      <Main />
      <Btn size="sm" variant="ghost" style={{ position: "fixed", top: 12, right: 12 }} onClick={() => setScreen("login")}>Déconnexion</Btn>
      <Btn size="sm" variant="ghost" style={{ position: "fixed", top: 12, right: 100 }} onClick={() => onBackToLanding && onBackToLanding()}>← Accueil</Btn>
    </div>
  );
}

