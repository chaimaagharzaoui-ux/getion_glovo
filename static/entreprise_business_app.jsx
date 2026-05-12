/**
 * Swift Business — Dashboard entreprise (mode clair)
 * React hooks uniquement · styles inline · un seul fichier
 *
 * Données : MOCK_* (remplacer par fetch/axios + useEffect refetch, ou @tanstack/react-query v5).
 * Token démo : localStorage "entreprise_token"
 *
 * Démo Django : GET /entreprise-business/
 *
 * Pour Vite / ES modules : ajoutez en fin de module — export default App;
 */
const { useState, useEffect, useCallback, useMemo, useRef } = React;

const DS = {
  bg: "#F8F7F4",
  surface: "#FFFFFF",
  border: "#E8E6E0",
  borderMed: "#D3D1C7",
  text: "#2C2C2A",
  muted: "#5F5E5A",
  hint: "#888780",
  orange: "#D85A30",
  orangeLight: "#FAECE7",
  orangeBorder: "#F0997B",
  green: "#3B6D11",
  greenLight: "#EAF3DE",
  greenBorder: "#97C459",
  red: "#A32D2D",
  redLight: "#FCEBEB",
  redBorder: "#F09595",
  blue: "#185FA5",
  blueLight: "#E6F1FB",
  blueBorder: "#85B7EB",
  amber: "#854F0B",
  amberLight: "#FAEEDA",
  amberBorder: "#EF9F27",
  purple: "#534AB7",
  purpleLight: "#EEEDFE",
  purpleBorder: "#AFA9EC",
};

const RF = { fontFamily: "'Outfit', 'Segoe UI', sans-serif" };

const TOKEN_KEY = "entreprise_token";

const MOCK_PRODUCTS = [
  { id: "1", emoji: "💊", nom: "Doliprane 1000", categorie: "Pharmacie", prix: 45, stock: 120, description: "Antalgique" },
  { id: "2", emoji: "🧴", nom: "Smecta", categorie: "Pharmacie", prix: 38, stock: 54, description: "Digestif" },
  { id: "3", emoji: "🥖", nom: "Baguette tradition", categorie: "Boulangerie", prix: 3.5, stock: 4, description: "Pain du jour" },
  { id: "4", emoji: "🧀", nom: "Fromage râpé", categorie: "Supermarché", prix: 28, stock: 18, description: "200 g" },
  { id: "5", emoji: "🍕", nom: "Pizza Margherita", categorie: "Restaurant", prix: 65, stock: 0, description: "32 cm" },
  { id: "6", emoji: "🫒", nom: "Huile d’olive", categorie: "Épicerie", prix: 85, stock: 32, description: "1 L" },
];

const MOCK_COMMANDES = [
  { id: "c1", client: "Samira Benali", produits: ["Doliprane 1000", "Smecta"], montant: 83, statut: "enCours", date: "2026-05-08T14:20:00" },
  { id: "c2", client: "Karim Tazi", produits: ["Pizza Margherita"], montant: 65, statut: "enPreparation", date: "2026-05-08T13:05:00" },
  { id: "c3", client: "Leïla Amrani", produits: ["Baguette tradition", "Fromage râpé"], montant: 31.5, statut: "livrée", date: "2026-05-08T12:00:00" },
  { id: "c4", client: "Omar Idrissi", produits: ["Huile d’olive"], montant: 85, statut: "enLivraison", date: "2026-05-08T11:30:00" },
  { id: "c5", client: "Houda Cherkaoui", produits: ["Smecta", "Doliprane 1000"], montant: 83, statut: "annulée", date: "2026-05-07T18:40:00" },
];

const MOCK_LIVREURS = [
  { id: "l1", prenom: "Ahmed", nom: "Laaroussi", zone: "Maarif", statut: "enLivraison", arriveDans: 6, note: 4.8, livraisons: 412, ligne: true },
  { id: "l2", prenom: "Youssef", nom: "El Mansouri", zone: "Ain Diab", statut: "disponible", arriveDans: null, note: 4.6, livraisons: 289, ligne: true },
  { id: "l3", prenom: "Fatima", nom: "Zahra", zone: "Hay Hassani", statut: "hors_ligne", arriveDans: null, note: 4.9, livraisons: 501, ligne: false },
  { id: "l4", prenom: "Mehdi", nom: "Berrada", zone: "Roches Noires", statut: "enLivraison", arriveDans: 14, note: 4.4, livraisons: 156, ligne: true },
];

const GRAPHIQUE_DATA = [
  { jour: "Lun", commandes: 12, revenus: 980 },
  { jour: "Mar", commandes: 18, revenus: 1420 },
  { jour: "Mer", commandes: 9, revenus: 720 },
  { jour: "Jeu", commandes: 22, revenus: 1890 },
  { jour: "Ven", commandes: 15, revenus: 1210 },
  { jour: "Sam", commandes: 28, revenus: 2340 },
  { jour: "Dim", commandes: 11, revenus: 890 },
];

const MOCK_EMPLOYES = [
  { id: "e1", nom: "Salma Kettani", role: "Caissière", embauche: "2024-03-12", statut: "actif" },
  { id: "e2", nom: "Rachid Fassi", role: "Préparateur", embauche: "2023-11-01", statut: "actif" },
  { id: "e3", nom: "Imane Alaoui", role: "Manager", embauche: "2022-06-20", statut: "actif" },
];

const PRODUIT_EMOJIS = ["💊", "🧴", "🥖", "🧀", "🍕", "🫒", "🥛", "🍞", "🧃", "🍫"];

const CATEGORIES = ["Pharmacie", "Restaurant", "Supermarché", "Boulangerie", "Épicerie", "Autre"];
const VILLES = ["Casablanca", "Rabat", "Marrakech", "Fès", "Tanger", "Agadir"];

function Badge({ statut }) {
  const map = {
    livrée: { bg: DS.greenLight, color: DS.green, border: DS.greenBorder, label: "Livrée" },
    livree: { bg: DS.greenLight, color: DS.green, border: DS.greenBorder, label: "Livrée" },
    enCours: { bg: DS.amberLight, color: DS.amber, border: DS.amberBorder, label: "En cours" },
    enPreparation: { bg: DS.blueLight, color: DS.blue, border: DS.blueBorder, label: "Préparation" },
    enLivraison: { bg: DS.orangeLight, color: DS.orange, border: DS.orangeBorder, label: "En livraison" },
    annulée: { bg: DS.redLight, color: DS.red, border: DS.redBorder, label: "Annulée" },
    annulee: { bg: DS.redLight, color: DS.red, border: DS.redBorder, label: "Annulée" },
    disponible: { bg: DS.greenLight, color: DS.green, border: DS.greenBorder, label: "Disponible" },
    hors_ligne: { bg: "#F0F0EE", color: DS.hint, border: DS.borderMed, label: "Hors ligne" },
    actif: { bg: DS.greenLight, color: DS.green, border: DS.greenBorder, label: "Actif" },
  };
  const c = map[statut] || { bg: "#F0F0EE", color: DS.muted, border: DS.border, label: String(statut) };
  return (
    <span
      style={{
        ...RF,
        display: "inline-flex",
        alignItems: "center",
        padding: "4px 10px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 700,
        background: c.bg,
        color: c.color,
        border: `1px solid ${c.border}`,
      }}
    >
      {c.label}
    </span>
  );
}

function StockIndicator({ stock }) {
  let color = DS.green;
  let bg = DS.greenLight;
  let border = DS.greenBorder;
  let prefix = "";
  if (stock <= 5) {
    color = DS.red;
    bg = DS.redLight;
    border = DS.redBorder;
    prefix = "⚠ ";
  } else if (stock <= 20) {
    color = DS.amber;
    bg = DS.amberLight;
    border = DS.amberBorder;
  }
  return (
    <span style={{ ...RF, fontSize: 12, fontWeight: 700, color, background: bg, border: `1px solid ${border}`, padding: "3px 8px", borderRadius: 8 }}>
      {prefix}Stock : {stock}
    </span>
  );
}

function Input({ label, type = "text", value, onChange, placeholder, required, multiline, rows = 3 }) {
  const [focus, setFocus] = useState(false);
  const base = {
    ...RF,
    width: "100%",
    padding: "12px 14px",
    borderRadius: 10,
    border: `1.5px solid ${focus ? DS.orange : DS.border}`,
    background: DS.surface,
    color: DS.text,
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.15s",
  };
  return (
    <div style={{ marginBottom: 14 }}>
      {label && (
        <label style={{ ...RF, display: "block", fontSize: 12, fontWeight: 700, color: DS.muted, marginBottom: 6 }}>
          {label}
          {required && <span style={{ color: DS.red }}> *</span>}
        </label>
      )}
      {multiline ? (
        <textarea style={{ ...base, minHeight: 88, resize: "vertical" }} rows={rows} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} />
      ) : (
        <input type={type} style={base} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} />
      )}
    </div>
  );
}

function Skeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            height: 56,
            borderRadius: 12,
            background: DS.border,
            animation: "ebPulse 1.4s ease-in-out infinite",
            animationDelay: `${i * 0.12}s`,
          }}
        />
      ))}
      <style>{`@keyframes ebPulse { 0%,100%{opacity:1} 50%{opacity:0.45} }`}</style>
    </div>
  );
}

function ToastContainer({ toasts, onDismiss }) {
  return (
    <div style={{ position: "fixed", top: 16, right: 16, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8, maxWidth: 340 }}>
      {toasts.map((t) => (
        <div
          key={t.id}
          style={{
            ...RF,
            padding: "12px 16px",
            borderRadius: 12,
            fontSize: 13,
            fontWeight: 600,
            boxShadow: "0 8px 28px rgba(44,44,42,0.12)",
            border: `1px solid ${t.type === "success" ? DS.greenBorder : DS.redBorder}`,
            background: t.type === "success" ? DS.greenLight : DS.redLight,
            color: t.type === "success" ? DS.green : DS.red,
            cursor: "pointer",
          }}
          onClick={() => onDismiss(t.id)}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}

function InscriptionPage({ onAuthed, pushToast }) {
  const [tab, setTab] = useState("connexion");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nomEnt, setNomEnt] = useState("");
  const [pass2, setPass2] = useState("");
  const [categorie, setCategorie] = useState("Pharmacie");
  const [ville, setVille] = useState("Casablanca");
  const [err, setErr] = useState("");

  const login = () => {
    setErr("");
    if (!email.trim() || !password) {
      setErr("Email et mot de passe requis.");
      return;
    }
    localStorage.setItem(TOKEN_KEY, "mock-jwt-" + Date.now());
    pushToast("success", "Connexion réussie");
    onAuthed();
  };

  const register = () => {
    setErr("");
    if (!nomEnt.trim() || !email.trim() || !password) {
      setErr("Remplissez tous les champs obligatoires.");
      return;
    }
    if (password !== pass2) {
      setErr("Les mots de passe ne correspondent pas.");
      return;
    }
    if (password.length < 6) {
      setErr("Mot de passe : au moins 6 caractères.");
      return;
    }
    localStorage.setItem(TOKEN_KEY, "mock-jwt-" + Date.now());
    pushToast("success", "Compte créé avec succès");
    onAuthed();
  };

  const tabBtn = (id, label) => {
    const active = tab === id;
    return (
      <button
        type="button"
        onClick={() => { setTab(id); setErr(""); }}
        style={{
          ...RF,
          flex: 1,
          padding: "12px 8px",
          border: "none",
          borderBottom: active ? `3px solid ${DS.orange}` : "3px solid transparent",
          background: "transparent",
          color: active ? DS.orange : DS.muted,
          fontWeight: active ? 800 : 600,
          fontSize: 14,
          cursor: "pointer",
        }}
      >
        {label}
      </button>
    );
  };

  return (
    <div style={{ ...RF, minHeight: "100vh", background: DS.bg, display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 20px" }}>
      <div style={{ fontSize: 42, marginBottom: 8 }}>⚡</div>
      <div style={{ ...RF, fontSize: 22, fontWeight: 900, color: DS.text, letterSpacing: "-0.02em" }}>Swift</div>
      <div style={{ ...RF, fontSize: 11, fontWeight: 800, color: DS.orange, letterSpacing: "0.14em", marginBottom: 28 }}>BUSINESS</div>

      <div
        style={{
          width: "100%",
          maxWidth: 440,
          background: DS.surface,
          borderRadius: 20,
          border: `1px solid ${DS.border}`,
          boxShadow: "0 24px 60px rgba(44,44,42,0.08)",
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", borderBottom: `1px solid ${DS.border}` }}>
          {tabBtn("connexion", "Connexion")}
          {tabBtn("inscription", "Inscription")}
        </div>
        <div style={{ padding: "28px 26px 32px" }}>
          {err && (
            <div style={{ ...RF, background: DS.redLight, border: `1px solid ${DS.redBorder}`, color: DS.red, padding: "10px 12px", borderRadius: 10, fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
              {err}
            </div>
          )}
          {tab === "connexion" ? (
            <>
              <Input label="Email" type="email" value={email} onChange={setEmail} placeholder="contact@entreprise.ma" required />
              <Input label="Mot de passe" type="password" value={password} onChange={setPassword} placeholder="••••••••" required />
              <button
                type="button"
                onClick={login}
                style={{
                  ...RF,
                  width: "100%",
                  marginTop: 8,
                  padding: "14px",
                  borderRadius: 12,
                  border: "none",
                  background: DS.orange,
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: 15,
                  cursor: "pointer",
                }}
              >
                Se connecter
              </button>
            </>
          ) : (
            <>
              <Input label="Nom de l’entreprise" value={nomEnt} onChange={setNomEnt} placeholder="Pharmacie Centrale" required />
              <Input label="Email" type="email" value={email} onChange={setEmail} placeholder="contact@entreprise.ma" required />
              <Input label="Mot de passe" type="password" value={password} onChange={setPassword} placeholder="••••••••" required />
              <Input label="Confirmer le mot de passe" type="password" value={pass2} onChange={setPass2} placeholder="••••••••" required />
              <div style={{ marginBottom: 14 }}>
                <label style={{ ...RF, display: "block", fontSize: 12, fontWeight: 700, color: DS.muted, marginBottom: 6 }}>Catégorie</label>
                <select value={categorie} onChange={(e) => setCategorie(e.target.value)} style={{ ...RF, width: "100%", padding: "12px 14px", borderRadius: 10, border: `1.5px solid ${DS.border}`, background: DS.surface, color: DS.text, fontSize: 14 }}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ ...RF, display: "block", fontSize: 12, fontWeight: 700, color: DS.muted, marginBottom: 6 }}>Ville</label>
                <select value={ville} onChange={(e) => setVille(e.target.value)} style={{ ...RF, width: "100%", padding: "12px 14px", borderRadius: 10, border: `1.5px solid ${DS.border}`, background: DS.surface, color: DS.text, fontSize: 14 }}>
                  {VILLES.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <button
                type="button"
                onClick={register}
                style={{
                  ...RF,
                  width: "100%",
                  marginTop: 8,
                  padding: "14px",
                  borderRadius: 12,
                  border: "none",
                  background: DS.orange,
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: 15,
                  cursor: "pointer",
                }}
              >
                Créer mon compte
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function App() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [section, setSection] = useState("dashboard");
  const [toasts, setToasts] = useState([]);
  const toastId = useRef(0);
  const pushToast = useCallback((type, message) => {
    const id = ++toastId.current;
    setToasts((t) => [...t, { id, type, message }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 3000);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    pushToast("success", "Déconnexion effectuée");
  };

  const onAuthed = () => setToken(localStorage.getItem(TOKEN_KEY));

  if (!token) {
    return (
      <>
        <InscriptionPage onAuthed={onAuthed} pushToast={pushToast} />
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </>
    );
  }

  return (
    <>
      <DashboardLayout section={section} setSection={setSection} logout={logout} pushToast={pushToast} />
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}

function DashboardLayout({ section, setSection, logout, pushToast }) {
  const nav = [
    ["dashboard", "🏠", "Dashboard"],
    ["produits", "📦", "Produits"],
    ["commandes", "🛒", "Commandes"],
    ["livreurs", "🚚", "Livreurs"],
    ["statistiques", "📊", "Statistiques"],
    ["employes", "👥", "Employés"],
    ["parametres", "⚙️", "Paramètres"],
  ];

  const title = nav.find((n) => n[0] === section)?.[2] || "Dashboard";
  const ruptureCount = useMemo(() => MOCK_PRODUCTS.filter((p) => p.stock <= 5).length, []);

  return (
    <div style={{ ...RF, minHeight: "100vh", background: DS.bg, display: "flex" }}>
      <aside
        style={{
          width: 230,
          flexShrink: 0,
          background: DS.surface,
          borderRight: `1px solid ${DS.border}`,
          display: "flex",
          flexDirection: "column",
          padding: "20px 14px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 8px 20px", borderBottom: `1px solid ${DS.border}` }}>
          <span style={{ fontSize: 26 }}>⚡</span>
          <div>
            <div style={{ fontWeight: 900, fontSize: 17, color: DS.text }}>Swift</div>
            <div style={{ fontSize: 9, fontWeight: 800, color: DS.orange, letterSpacing: "0.12em" }}>BUSINESS</div>
          </div>
        </div>
        <nav style={{ flex: 1, paddingTop: 16, display: "flex", flexDirection: "column", gap: 4 }}>
          {nav.map(([key, icon, label]) => {
            const active = section === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSection(key)}
                style={{
                  ...RF,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "11px 12px",
                  borderRadius: 10,
                  border: "none",
                  borderLeft: active ? `3px solid ${DS.orange}` : "3px solid transparent",
                  background: active ? DS.orangeLight : "transparent",
                  color: active ? DS.orange : DS.muted,
                  fontWeight: active ? 800 : 600,
                  fontSize: 14,
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <span style={{ fontSize: 17 }}>{icon}</span>
                {label}
              </button>
            );
          })}
        </nav>
        <div style={{ marginTop: "auto", paddingTop: 16 }}>
          <div style={{ background: DS.bg, border: `1px solid ${DS.border}`, borderRadius: 12, padding: "12px 12px", marginBottom: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: DS.text }}>Pharmacie Centrale</div>
            <div style={{ fontSize: 11, color: DS.hint, marginTop: 2 }}>Casablanca · Pro</div>
          </div>
          <button
            type="button"
            onClick={logout}
            style={{
              ...RF,
              width: "100%",
              padding: "11px",
              borderRadius: 10,
              border: `1px solid ${DS.redBorder}`,
              background: DS.redLight,
              color: DS.red,
              fontWeight: 800,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Déconnexion
          </button>
        </div>
      </aside>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <header
          style={{
            height: 58,
            flexShrink: 0,
            background: DS.surface,
            borderBottom: `1px solid ${DS.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
          }}
        >
          <div style={{ fontWeight: 900, fontSize: 17, color: DS.text }}>{title}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {ruptureCount > 0 && (
              <span style={{ ...RF, fontSize: 11, fontWeight: 700, padding: "5px 10px", borderRadius: 999, background: DS.redLight, color: DS.red, border: `1px solid ${DS.redBorder}` }}>
                Rupture stock : {ruptureCount}
              </span>
            )}
            <span style={{ fontSize: 12, color: DS.hint }}>
              {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </span>
          </div>
        </header>

        <main style={{ flex: 1, overflow: "auto", padding: 24 }}>
          {section === "dashboard" && <SectionDashboard pushToast={pushToast} />}
          {section === "produits" && <SectionProduits pushToast={pushToast} />}
          {section === "commandes" && <SectionCommandes />}
          {section === "livreurs" && <SectionLivreurs />}
          {section === "statistiques" && <SectionStatistiques />}
          {section === "employes" && <SectionEmployes pushToast={pushToast} />}
          {section === "parametres" && <SectionParametres pushToast={pushToast} />}
        </main>
      </div>
    </div>
  );
}

function SectionDashboard() {
  const revenuJour = GRAPHIQUE_DATA[GRAPHIQUE_DATA.length - 1].revenus;
  const cmdEnCours = MOCK_COMMANDES.filter((c) => ["enCours", "enPreparation", "enLivraison"].includes(c.statut)).length;
  const totalProd = MOCK_PRODUCTS.length;
  const rupture = MOCK_PRODUCTS.filter((p) => p.stock <= 5).length;
  const livEnLigne = MOCK_LIVREURS.filter((l) => l.ligne).length;
  const livrees = MOCK_COMMANDES.filter((c) => c.statut === "livrée").length;
  const maxBar = Math.max(...GRAPHIQUE_DATA.map((d) => d.commandes), 1);
  const dernieres = [...MOCK_COMMANDES].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 4);

  const kpi = (icon, label, value, color, light, border) => (
    <div
      style={{
        background: DS.surface,
        borderRadius: 16,
        border: `1px solid ${DS.border}`,
        borderTop: `3px solid ${border}`,
        padding: "18px 18px 16px",
        boxShadow: "0 4px 20px rgba(44,44,42,0.04)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: light, display: "grid", placeItems: "center", fontSize: 22 }}>{icon}</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: DS.hint, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</div>
      </div>
      <div style={{ fontSize: 28, fontWeight: 900, color, letterSpacing: "-0.02em" }}>{value}</div>
    </div>
  );

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 22 }}>
        {kpi("💰", "Revenus du jour", `${revenuJour} MAD`, DS.green, DS.greenLight, DS.greenBorder)}
        {kpi("🛒", "Commandes en cours", cmdEnCours, DS.orange, DS.orangeLight, DS.orangeBorder)}
        {kpi("📦", "Total produits", totalProd, DS.blue, DS.blueLight, DS.blueBorder)}
        {kpi("⚠", "Rupture de stock", rupture, DS.red, DS.redLight, DS.redBorder)}
        {kpi("🚚", "Livreurs en ligne", livEnLigne, DS.purple, DS.purpleLight, DS.purpleBorder)}
        {kpi("✅", "Commandes livrées", livrees, DS.green, DS.greenLight, DS.greenBorder)}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 18, alignItems: "stretch" }}>
        <div style={{ background: DS.surface, borderRadius: 16, border: `1px solid ${DS.border}`, padding: 22 }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: DS.text, marginBottom: 18 }}>Commandes sur 7 jours</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 180, paddingTop: 8 }}>
            {GRAPHIQUE_DATA.map((d) => (
              <div key={d.jour} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: DS.orange }}>{d.commandes}</div>
                <div
                  style={{
                    width: "100%",
                    height: `${Math.max(8, (d.commandes / maxBar) * 130)}px`,
                    background: `linear-gradient(180deg, ${DS.orange}, ${DS.orangeLight})`,
                    borderRadius: "8px 8px 4px 4px",
                    border: `1px solid ${DS.orangeBorder}`,
                  }}
                />
                <div style={{ fontSize: 11, fontWeight: 700, color: DS.muted }}>{d.jour}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ background: DS.surface, borderRadius: 16, border: `1px solid ${DS.border}`, padding: 20 }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: DS.text, marginBottom: 14 }}>Dernières commandes</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {dernieres.map((c) => (
              <div key={c.id} style={{ padding: "10px 12px", borderRadius: 12, background: DS.bg, border: `1px solid ${DS.border}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: DS.text }}>{c.client}</div>
                    <div style={{ fontSize: 11, color: DS.hint, marginTop: 2 }}>{c.montant} MAD</div>
                  </div>
                  <Badge statut={c.statut === "livrée" ? "livree" : c.statut} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionProduits({ pushToast }) {
  const [products, setProducts] = useState(() => JSON.parse(JSON.stringify(MOCK_PRODUCTS)));
  const [q, setQ] = useState("");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ emoji: "💊", nom: "", prix: "", stock: "", categorie: "Pharmacie", description: "" });

  const filtered = products.filter((p) => p.nom.toLowerCase().includes(q.toLowerCase()) || p.categorie.toLowerCase().includes(q.toLowerCase()));

  const openAdd = () => {
    setForm({ emoji: "💊", nom: "", prix: "", stock: "", categorie: "Pharmacie", description: "" });
    setModal({ mode: "add" });
  };

  const openEdit = (p) => {
    setForm({ emoji: p.emoji, nom: p.nom, prix: String(p.prix), stock: String(p.stock), categorie: p.categorie, description: p.description || "" });
    setModal({ mode: "edit", id: p.id });
  };

  const save = () => {
    const prix = parseFloat(form.prix);
    const stock = parseInt(form.stock, 10);
    if (!form.nom.trim() || Number.isNaN(prix) || Number.isNaN(stock)) {
      pushToast("error", "Nom, prix et stock valides requis");
      return;
    }
    if (modal.mode === "add") {
      const id = "p" + Date.now();
      setProducts((x) => [...x, { id, emoji: form.emoji, nom: form.nom.trim(), categorie: form.categorie, prix, stock, description: form.description }]);
      pushToast("success", "Produit ajouté avec succès");
    } else {
      setProducts((x) => x.map((p) => (p.id === modal.id ? { ...p, ...form, prix, stock, nom: form.nom.trim() } : p)));
      pushToast("success", "Produit modifié avec succès");
    }
    setModal(null);
  };

  const remove = (p) => {
    if (!confirm("Supprimer ce produit ?")) return;
    setProducts((x) => x.filter((y) => y.id !== p.id));
    pushToast("success", "Produit supprimé");
  };

  const stockBar = (stock) => {
    const pct = Math.min(100, stock * 2);
    return (
      <div style={{ height: 4, borderRadius: 99, background: DS.border, overflow: "hidden", marginTop: 8 }}>
        <div style={{ width: `${pct}%`, height: "100%", borderRadius: 99, background: stock <= 5 ? DS.red : stock <= 20 ? DS.amber : DS.green, transition: "width 0.3s" }} />
      </div>
    );
  };

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 20, alignItems: "center" }}>
        <div style={{ position: "relative", flex: "1 1 220px", minWidth: 180 }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", opacity: 0.45 }}>🔍</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher un produit…"
            style={{ ...RF, width: "100%", padding: "12px 14px 12px 38px", borderRadius: 12, border: `1px solid ${DS.border}`, fontSize: 14, boxSizing: "border-box" }}
          />
        </div>
        <button
          type="button"
          onClick={openAdd}
          style={{ ...RF, padding: "12px 20px", borderRadius: 12, border: "none", background: DS.orange, color: "#fff", fontWeight: 800, cursor: "pointer" }}
        >
          + Ajouter produit
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
        {filtered.map((p) => (
          <div key={p.id} style={{ background: DS.surface, borderRadius: 16, border: `1px solid ${DS.border}`, padding: 18, display: "flex", flexDirection: "column" }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: DS.orangeLight, display: "grid", placeItems: "center", fontSize: 26, marginBottom: 12 }}>{p.emoji}</div>
            <div style={{ fontWeight: 800, fontSize: 15, color: DS.text }}>{p.nom}</div>
            <div style={{ fontSize: 12, color: DS.hint, marginBottom: 8 }}>{p.categorie}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: DS.orange, marginBottom: 8 }}>{p.prix} MAD</div>
            <StockIndicator stock={p.stock} />
            {stockBar(p.stock)}
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <button type="button" onClick={() => openEdit(p)} style={{ ...RF, flex: 1, padding: "9px", borderRadius: 10, border: `1px solid ${DS.blueBorder}`, background: DS.blueLight, color: DS.blue, fontWeight: 700, cursor: "pointer" }}>✏ Modifier</button>
              <button type="button" onClick={() => remove(p)} style={{ ...RF, flex: 1, padding: "9px", borderRadius: 10, border: `1px solid ${DS.redBorder}`, background: DS.redLight, color: DS.red, fontWeight: 700, cursor: "pointer" }}>🗑 Supprimer</button>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(44,44,42,0.45)", zIndex: 8000, display: "grid", placeItems: "center", padding: 20 }} onClick={() => setModal(null)}>
          <div style={{ ...RF, width: "100%", maxWidth: 480, background: DS.surface, borderRadius: 18, padding: 24, border: `1px solid ${DS.border}` }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontWeight: 900, fontSize: 18, color: DS.text, marginBottom: 16 }}>{modal.mode === "add" ? "Ajouter un produit" : "Modifier le produit"}</div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: DS.muted, marginBottom: 8 }}>Icône</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {PRODUIT_EMOJIS.map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, emoji: em }))}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      border: form.emoji === em ? `2px solid ${DS.orange}` : `1px solid ${DS.border}`,
                      background: form.emoji === em ? DS.orangeLight : DS.bg,
                      fontSize: 22,
                      cursor: "pointer",
                    }}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>
            <Input label="Nom" value={form.nom} onChange={(v) => setForm((f) => ({ ...f, nom: v }))} placeholder="Nom du produit" required />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Input label="Prix (MAD)" value={form.prix} onChange={(v) => setForm((f) => ({ ...f, prix: v }))} placeholder="0" required />
              <Input label="Stock" value={form.stock} onChange={(v) => setForm((f) => ({ ...f, stock: v }))} placeholder="0" required />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ ...RF, display: "block", fontSize: 12, fontWeight: 700, color: DS.muted, marginBottom: 6 }}>Catégorie</label>
              <select value={form.categorie} onChange={(e) => setForm((f) => ({ ...f, categorie: e.target.value }))} style={{ ...RF, width: "100%", padding: "12px 14px", borderRadius: 10, border: `1.5px solid ${DS.border}` }}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <Input label="Description" multiline value={form.description} onChange={(v) => setForm((f) => ({ ...f, description: v }))} placeholder="Description courte" />
            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button type="button" onClick={() => setModal(null)} style={{ ...RF, flex: 1, padding: "12px", borderRadius: 12, border: `1px solid ${DS.border}`, background: DS.bg, fontWeight: 700, cursor: "pointer" }}>Annuler</button>
              <button type="button" onClick={save} style={{ ...RF, flex: 1, padding: "12px", borderRadius: 12, border: "none", background: DS.orange, color: "#fff", fontWeight: 800, cursor: "pointer" }}>{modal.mode === "add" ? "Ajouter" : "Sauvegarder"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SectionCommandes() {
  const [filtre, setFiltre] = useState("toutes");
  const pills = [
    ["toutes", "Toutes"],
    ["enCours", "En cours"],
    ["enPreparation", "Préparation"],
    ["livrée", "Livrées"],
    ["annulée", "Annulées"],
  ];

  const match = (c) => {
    if (filtre === "toutes") return true;
    if (filtre === "enCours") return c.statut === "enCours";
    if (filtre === "enPreparation") return c.statut === "enPreparation";
    if (filtre === "livrée") return c.statut === "livrée";
    if (filtre === "annulée") return c.statut === "annulée";
    return true;
  };

  const list = MOCK_COMMANDES.filter(match);

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
        {pills.map(([v, lab]) => (
          <button
            key={v}
            type="button"
            onClick={() => setFiltre(v)}
            style={{
              ...RF,
              padding: "9px 18px",
              borderRadius: 999,
              border: `1px solid ${filtre === v ? DS.orange : DS.border}`,
              background: filtre === v ? DS.orange : DS.surface,
              color: filtre === v ? "#fff" : DS.muted,
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            {lab}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {list.map((c) => (
          <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", background: DS.surface, borderRadius: 14, border: `1px solid ${DS.border}` }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: DS.orangeLight, display: "grid", placeItems: "center", fontSize: 22 }}>🛒</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 800, color: DS.text }}>{c.client}</div>
              <div style={{ fontSize: 12, color: DS.hint, marginTop: 2 }}>{c.produits.join(", ")} · {new Date(c.date).toLocaleString("fr-FR")}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: 900, color: DS.orange, fontSize: 16 }}>{c.montant} MAD</div>
                  <div style={{ marginTop: 6 }}><Badge statut={c.statut} /></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionLivreurs() {
  const [livreurs, setLivreurs] = useState(() => MOCK_LIVREURS.map((l) => ({ ...l })));

  useEffect(() => {
    const id = setInterval(() => {
      setLivreurs((prev) =>
        prev.map((l) => {
          if (l.statut !== "enLivraison" || l.arriveDans == null) return l;
          const n = Math.max(0, (l.arriveDans || 0) - 1);
          return { ...l, arriveDans: n };
        })
      );
    }, 30000);
    return () => clearInterval(id);
  }, []);

  const dot = (l) => {
    if (!l.ligne) return DS.hint;
    if (l.statut === "enLivraison") return DS.orange;
    return DS.green;
  };

  return (
    <div>
      <div style={{ ...RF, padding: "12px 16px", borderRadius: 12, background: DS.blueLight, border: `1px solid ${DS.blueBorder}`, color: DS.blue, fontSize: 13, fontWeight: 700, marginBottom: 18 }}>
        🔴 Suivi en temps réel · Mise à jour toutes les 30 secondes
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {livreurs.map((l) => (
          <div key={l.id} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 18px", background: DS.surface, borderRadius: 16, border: `1px solid ${DS.border}` }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: DS.purpleLight, border: `2px solid ${DS.purpleBorder}`, display: "grid", placeItems: "center", fontWeight: 900, color: DS.purple, fontSize: 18 }}>
                {(l.prenom[0] || "") + (l.nom[0] || "")}
              </div>
              <span style={{ position: "absolute", bottom: 2, right: 2, width: 12, height: 12, borderRadius: "50%", background: dot(l), border: `2px solid ${DS.surface}` }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 800, color: DS.text }}>Livreur : {l.prenom} {l.nom}</div>
              <div style={{ fontSize: 13, color: DS.muted, marginTop: 4 }}>Zone : {l.zone}</div>
              {l.statut === "enLivraison" && l.arriveDans != null && (
                <div style={{ fontSize: 13, fontWeight: 700, color: DS.orange, marginTop: 6 }}>🕐 Arrive dans : {l.arriveDans} min</div>
              )}
              <div style={{ fontSize: 12, color: DS.amber, fontWeight: 700, marginTop: 6 }}>★ {l.note} · {l.livraisons} livraisons</div>
            </div>
            <Badge statut={l.statut === "disponible" ? "disponible" : l.statut === "hors_ligne" ? "hors_ligne" : "enLivraison"} />
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionStatistiques() {
  const revenusTotaux = MOCK_COMMANDES.filter((c) => c.statut === "livrée").reduce((s, c) => s + c.montant, 0) + 12400;
  const annulees = MOCK_COMMANDES.filter((c) => c.statut === "annulée").length;
  const clientsActifs = 128;
  const produitsStock = MOCK_PRODUCTS.reduce((s, p) => s + p.stock, 0);
  const top = [
    { nom: "Doliprane 1000", vendus: 420 },
    { nom: "Smecta", vendus: 310 },
    { nom: "Pizza Margherita", vendus: 256 },
    { nom: "Baguette tradition", vendus: 198 },
    { nom: "Huile d’olive", vendus: 142 },
  ];
  const maxV = Math.max(...top.map((t) => t.vendus), 1);

  const mc = (icon, label, value, color, light, border) => (
    <div style={{ background: DS.surface, borderRadius: 16, border: `1px solid ${DS.border}`, borderTop: `3px solid ${border}`, padding: "20px 18px" }}>
      <div style={{ fontSize: 22, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 26, fontWeight: 900, color }}>{value}</div>
      <div style={{ fontSize: 12, fontWeight: 700, color: DS.hint, marginTop: 4 }}>{label}</div>
    </div>
  );

  const medals = ["🥇", "🥈", "🥉", "4.", "5."];

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {mc("💰", "Revenus totaux", `${revenusTotaux.toLocaleString("fr-FR")} MAD`, DS.green, DS.greenLight, DS.greenBorder)}
        {mc("❌", "Commandes annulées", annulees, DS.red, DS.redLight, DS.redBorder)}
        {mc("👥", "Clients actifs", clientsActifs, DS.blue, DS.blueLight, DS.blueBorder)}
        {mc("📦", "Produits en stock", produitsStock, DS.orange, DS.orangeLight, DS.orangeBorder)}
      </div>
      <div style={{ background: DS.surface, borderRadius: 16, border: `1px solid ${DS.border}`, padding: 22 }}>
        <div style={{ fontWeight: 900, fontSize: 16, color: DS.text, marginBottom: 18 }}>Top 5 produits les plus vendus</div>
        {top.map((t, i) => (
          <div key={t.nom} style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: DS.text }}>{medals[i]} {t.nom}</span>
              <span style={{ fontWeight: 800, color: DS.orange }}>{t.vendus}</span>
            </div>
            <div style={{ height: 8, borderRadius: 99, background: DS.border, overflow: "hidden" }}>
              <div style={{ width: `${(t.vendus / maxV) * 100}%`, height: "100%", borderRadius: 99, background: DS.orange, transition: "width 0.4s ease" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionEmployes({ pushToast }) {
  const [emps, setEmps] = useState(() => [...MOCK_EMPLOYES]);
  const [showAdd, setShowAdd] = useState(false);
  const [nf, setNf] = useState({ nom: "", role: "" });

  const add = () => {
    if (!nf.nom.trim() || !nf.role.trim()) {
      pushToast("error", "Nom et rôle requis");
      return;
    }
    setEmps((e) => [...e, { id: "e" + Date.now(), nom: nf.nom.trim(), role: nf.role.trim(), embauche: new Date().toISOString().slice(0, 10), statut: "actif" }]);
    setNf({ nom: "", role: "" });
    setShowAdd(false);
    pushToast("success", "Employé ajouté");
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <button type="button" onClick={() => setShowAdd(true)} style={{ ...RF, padding: "11px 18px", borderRadius: 12, border: "none", background: DS.orange, color: "#fff", fontWeight: 800, cursor: "pointer" }}>+ Ajouter employé</button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {emps.map((e) => (
          <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", background: DS.surface, borderRadius: 14, border: `1px solid ${DS.border}` }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: DS.purpleLight, border: `2px solid ${DS.purpleBorder}`, display: "grid", placeItems: "center", fontWeight: 900, color: DS.purple }}>
              {e.nom.split(" ").map((x) => x[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, color: DS.text }}>{e.nom}</div>
              <div style={{ fontSize: 12, color: DS.muted }}>{e.role} · Embauche {new Date(e.embauche).toLocaleDateString("fr-FR")}</div>
            </div>
            <Badge statut="actif" />
          </div>
        ))}
      </div>

      {showAdd && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(44,44,42,0.45)", zIndex: 8000, display: "grid", placeItems: "center", padding: 20 }} onClick={() => setShowAdd(false)}>
          <div style={{ ...RF, width: "100%", maxWidth: 400, background: DS.surface, borderRadius: 16, padding: 22, border: `1px solid ${DS.border}` }} onClick={(ev) => ev.stopPropagation()}>
            <div style={{ fontWeight: 900, marginBottom: 14 }}>Nouvel employé</div>
            <Input label="Nom complet" value={nf.nom} onChange={(v) => setNf((f) => ({ ...f, nom: v }))} />
            <Input label="Rôle" value={nf.role} onChange={(v) => setNf((f) => ({ ...f, role: v }))} />
            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button type="button" onClick={() => setShowAdd(false)} style={{ ...RF, flex: 1, padding: "11px", borderRadius: 10, border: `1px solid ${DS.border}`, cursor: "pointer", fontWeight: 700 }}>Annuler</button>
              <button type="button" onClick={add} style={{ ...RF, flex: 1, padding: "11px", borderRadius: 10, border: "none", background: DS.orange, color: "#fff", fontWeight: 800, cursor: "pointer" }}>Ajouter</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SectionParametres({ pushToast }) {
  const [nom, setNom] = useState("Pharmacie Centrale");
  const [email, setEmail] = useState("contact@pharmacie.ma");
  const [tel, setTel] = useState("+212 5 22 00 00 00");
  const [ville, setVille] = useState("Casablanca");
  const [ho, setHo] = useState("08:00");
  const [hf, setHf] = useState("22:00");
  const [adr, setAdr] = useState("123 Bd Zerktouni, Maarif");
  const [saveState, setSaveState] = useState("idle");
  const [ap, setAp] = useState("");
  const [np, setNp] = useState("");
  const [cp, setCp] = useState("");

  const saveInfo = () => {
    setSaveState("saved");
    pushToast("success", "Informations enregistrées");
    setTimeout(() => setSaveState("idle"), 2000);
  };

  const changePw = () => {
    if (!ap || !np || np !== cp) {
      pushToast("error", "Vérifiez les mots de passe");
      return;
    }
    pushToast("success", "Mot de passe mis à jour (démo)");
    setAp("");
    setNp("");
    setCp("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div style={{ background: DS.surface, borderRadius: 16, border: `1px solid ${DS.border}`, padding: 22 }}>
        <div style={{ fontWeight: 900, fontSize: 16, color: DS.text, marginBottom: 16 }}>Informations entreprise</div>
        <Input label="Nom" value={nom} onChange={setNom} />
        <Input label="Email" type="email" value={email} onChange={setEmail} />
        <Input label="Téléphone" value={tel} onChange={setTel} />
        <Input label="Ville" value={ville} onChange={setVille} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Input label="Horaire ouverture" value={ho} onChange={setHo} />
          <Input label="Horaire fermeture" value={hf} onChange={setHf} />
        </div>
        <Input label="Adresse complète" multiline value={adr} onChange={setAdr} />
        <button
          type="button"
          onClick={saveInfo}
          style={{
            ...RF,
            marginTop: 8,
            padding: "12px 20px",
            borderRadius: 12,
            border: "none",
            background: saveState === "saved" ? DS.green : DS.text,
            color: "#fff",
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          {saveState === "saved" ? "✅ Sauvegardé !" : "💾 Sauvegarder"}
        </button>
      </div>

      <div style={{ background: DS.surface, borderRadius: 16, border: `1px solid ${DS.border}`, padding: 22 }}>
        <div style={{ fontWeight: 900, fontSize: 16, color: DS.text, marginBottom: 16 }}>Sécurité</div>
        <Input label="Mot de passe actuel" type="password" value={ap} onChange={setAp} />
        <Input label="Nouveau mot de passe" type="password" value={np} onChange={setNp} />
        <Input label="Confirmer" type="password" value={cp} onChange={setCp} />
        <button type="button" onClick={changePw} style={{ ...RF, marginTop: 8, padding: "12px 20px", borderRadius: 12, border: `1px solid ${DS.redBorder}`, background: DS.redLight, color: DS.red, fontWeight: 800, cursor: "pointer" }}>🔑 Changer le mot de passe</button>
      </div>
    </div>
  );
}

if (typeof document !== "undefined") {
  const el = document.getElementById("entreprise-business-root");
  if (el) {
    const root = ReactDOM.createRoot(el);
    root.render(<App />);
  }
}

window.EntrepriseBusinessApp = App;
