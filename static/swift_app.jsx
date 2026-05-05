const { useEffect, useMemo, useState, useRef } = React;

const C = {
  orange: "#FF6B00",
  orangeLight: "#FF8C35",
  orangeGlow: "rgba(255,107,0,0.15)",
  orangePale: "#FFF3EA",
  black: "#0D0D0D",
  dark: "#1A1A1A",
  card: "#F8F8F8",
  border: "#EBEBEB",
  muted: "#888888",
  white: "#FFFFFF",
  green: "#22C55E",
  bg: "#0A0A0F",
  surface: "#13131A",
  darkCard: "#1C1C28",
  darkBorder: "#2A2A3D",
  text: "#F0F0FA",
  textMuted: "#8888A8",
};

const categories = [
  { id: "restaurant", label: "Restaurants", icon: "🍽️", color: "#FF6B00", bg: "#FFF3EA", image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80" },
  { id: "groceries", label: "Épicerie", icon: "🛒", color: "#22C55E", bg: "#EDFDF5", image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80" },
  { id: "pharmacy", label: "Pharmacie", icon: "💊", color: "#3B82F6", bg: "#EFF6FF", image: "https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&w=800&q=80" },
  { id: "sports", label: "Sports", icon: "⚽", color: "#8B5CF6", bg: "#F5F3FF", image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=800&q=80" },
  { id: "flowers", label: "Fleurs", icon: "💐", color: "#EC4899", bg: "#FDF2F8", image: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=800&q=80" },
  { id: "perfumes", label: "Parfums", icon: "🌸", color: "#A855F7", bg: "#FAF5FF", image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80" },
  { id: "clothes", label: "Vêtements", icon: "👗", color: "#F59E0B", bg: "#FFFBEB", image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80" },
  { id: "bags", label: "Sacs", icon: "👜", color: "#B45309", bg: "#FEF3C7", image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80" },
  { id: "shoes", label: "Chaussures", icon: "👟", color: "#06B6D4", bg: "#ECFEFF", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80" },
  { id: "makeup", label: "Maquillage", icon: "💄", color: "#EF4444", bg: "#FEF2F2", image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80" },
  { id: "watches", label: "Apple Watch", icon: "⌚", color: "#1D4ED8", bg: "#EFF6FF", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80" },
  { id: "food", label: "Alimentation", icon: "🍔", color: "#EA580C", bg: "#FFF7ED", image: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=800&q=80" },
];

const businesses = [
  { id: 1, name: "Burger Palace", cat: "restaurant", rating: 4.8, time: "20-30", icon: "🍔", color: "#FF6B00" },
  { id: 2, name: "Pizza Roma", cat: "restaurant", rating: 4.6, time: "25-35", icon: "🍕", color: "#E74C3C" },
  { id: 3, name: "Sushi Zen", cat: "restaurant", rating: 4.7, time: "30-40", icon: "🍱", color: "#8B5CF6" },
  { id: 4, name: "PharmaCare", cat: "pharmacy", rating: 4.9, time: "15-20", icon: "💊", color: "#3B82F6" },
  { id: 5, name: "MediPlus", cat: "pharmacy", rating: 4.8, time: "10-15", icon: "🏥", color: "#06B6D4" },
  { id: 6, name: "FreshMarket", cat: "groceries", rating: 4.5, time: "20-25", icon: "🥦", color: "#22C55E" },
  { id: 7, name: "SportZone", cat: "sports", rating: 4.7, time: "60-90", icon: "⚽", color: "#8B5CF6" },
  { id: 8, name: "Nike Store", cat: "sports", rating: 4.9, time: "60-90", icon: "👟", color: "#1D4ED8" },
  { id: 9, name: "Rose & Co", cat: "flowers", rating: 4.8, time: "30-45", icon: "🌹", color: "#EC4899" },
  { id: 10, name: "Flower Garden", cat: "flowers", rating: 4.6, time: "25-40", icon: "💐", color: "#F472B6" },
  { id: 11, name: "Dior Parfums", cat: "perfumes", rating: 4.9, time: "60-90", icon: "🌸", color: "#A855F7" },
  { id: 12, name: "Fragrance World", cat: "perfumes", rating: 4.7, time: "60-90", icon: "✨", color: "#7C3AED" },
  { id: 13, name: "Zara", cat: "clothes", rating: 4.6, time: "60-90", icon: "👗", color: "#F59E0B" },
  { id: 14, name: "H&M Fashion", cat: "clothes", rating: 4.5, time: "60-90", icon: "🧥", color: "#D97706" },
  { id: 15, name: "LV Bags", cat: "bags", rating: 4.9, time: "60-90", icon: "👜", color: "#B45309" },
  { id: 16, name: "Shoe Palace", cat: "shoes", rating: 4.8, time: "60-90", icon: "👠", color: "#0E7490" },
  { id: 17, name: "Sephora", cat: "makeup", rating: 4.8, time: "45-60", icon: "💄", color: "#EF4444" },
  { id: 18, name: "MAC Cosmetics", cat: "makeup", rating: 4.7, time: "45-60", icon: "💅", color: "#DC2626" },
  { id: 19, name: "Apple Store", cat: "watches", rating: 5.0, time: "60-90", icon: "⌚", color: "#1D4ED8" },
  { id: 20, name: "iWatch Premium", cat: "watches", rating: 4.8, time: "60-90", icon: "🖥️", color: "#374151" },
  { id: 21, name: "GreenLeaf", cat: "food", rating: 4.5, time: "20-25", icon: "🥗", color: "#16A34A" },
  { id: 22, name: "Sweet Bakery", cat: "food", rating: 4.7, time: "20-30", icon: "🥐", color: "#D97706" },
];

const catalogueProducts = [
  { id: 1, name: "Classic Burger", price: 8.99, cat: "Burgers", icon: "🍔" },
  { id: 2, name: "Cheese Fries", price: 4.99, cat: "Sides", icon: "🍟" },
  { id: 3, name: "Cola Drink", price: 2.49, cat: "Drinks", icon: "🥤" },
  { id: 4, name: "BBQ Chicken", price: 12.99, cat: "Burgers", icon: "🍗" },
  { id: 5, name: "Onion Rings", price: 3.99, cat: "Sides", icon: "🧅" },
  { id: 6, name: "Milkshake", price: 5.49, cat: "Drinks", icon: "🥛" },
];

const partners = [
  { name: "McDonald's", icon: "🍔" }, { name: "Carrefour", icon: "🛒" }, { name: "Pharmaprix", icon: "💊" }, { name: "Nike", icon: "👟" },
  { name: "Zara", icon: "👗" }, { name: "Sephora", icon: "💄" }, { name: "Starbucks", icon: "☕" }, { name: "Apple", icon: "⌚" },
  { name: "Adidas", icon: "⚽" }, { name: "L'Oréal", icon: "🌸" }, { name: "Decathlon", icon: "🏋️" }, { name: "Dior", icon: "✨" },
  { name: "Louis Vuitton", icon: "👜" }, { name: "KFC", icon: "🍗" }, { name: "Jumia", icon: "📦" }, { name: "Marjane", icon: "🏪" },
];

const rootFont = { fontFamily: "Outfit, sans-serif" };
const money = (n) => `${n.toFixed(2)}€`;
const isAuthScreen = (s) => ["landing", "login", "register", "forgot"].includes(s);

function Btn({ children, onClick, variant = "primary", full, sm, style }) {
  const map = {
    primary: { background: C.orange, color: C.white, border: "1px solid transparent", boxShadow: `0 10px 30px ${C.orangeGlow}` },
    outline: { background: "transparent", color: C.orange, border: `1px solid ${C.orange}` },
    dark: { background: C.dark, color: C.white, border: "1px solid transparent" },
    ghost: { background: C.darkCard, color: C.text, border: `1px solid ${C.darkBorder}` },
    danger: { background: "#EF4444", color: C.white, border: "1px solid transparent" },
  };
  return <button onClick={onClick} style={{ ...rootFont, width: full ? "100%" : "auto", borderRadius: sm ? 10 : 50, padding: sm ? "8px 12px" : "12px 18px", fontWeight: 700, fontSize: sm ? 12 : 13, cursor: "pointer", ...map[variant], ...style }}>{children}</button>;
}

function Input({ label, type = "text", value, onChange, icon, placeholder, light, error }) {
  const bg = light ? C.card : C.darkCard;
  const color = light ? C.black : C.text;
  const border = error ? "#EF4444" : light ? C.border : C.darkBorder;
  return (
    <div style={{ marginBottom: 12 }}>
      {label && <div style={{ ...rootFont, color: light ? C.black : C.textMuted, fontSize: 11, marginBottom: 6, fontWeight: 600 }}>{label}</div>}
      <div style={{ position: "relative" }}>
        {icon && <span style={{ position: "absolute", left: 12, top: 11, fontSize: 16 }}>{icon}</span>}
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={{ ...rootFont, width: "100%", background: bg, color, border: `1px solid ${border}`, borderRadius: 12, padding: `12px 12px 12px ${icon ? 38 : 12}px`, outline: "none", fontSize: 13, boxSizing: "border-box" }} />
      </div>
      {error && <div style={{ color: "#EF4444", fontSize: 11, marginTop: 4 }}>{error}</div>}
    </div>
  );
}

function Tag({ children, active, onClick }) {
  return <button onClick={onClick} style={{ ...rootFont, borderRadius: 20, padding: "8px 12px", fontSize: 11, cursor: "pointer", fontWeight: 700, border: active ? `1px solid ${C.orange}` : `1px solid ${C.darkBorder}`, background: active ? C.orange : C.darkCard, color: active ? C.white : C.textMuted }}>{children}</button>;
}

function MarqueeRow({ items, reverse }) {
  return <div style={{ overflow: "hidden", width: "100%" }}><div style={{ display: "flex", width: "max-content", gap: 10, animation: `${reverse ? "marqueeR" : "marquee"} 28s linear infinite` }}>{[...items, ...items].map((p, i) => <div key={`${p.name}-${i}`} style={{ ...rootFont, display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: 999, background: C.white, border: `1px solid ${C.border}`, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", fontSize: 12, fontWeight: 600 }}><span>{p.icon}</span><span>{p.name}</span></div>)}</div></div>;
}

function Login({ go, onLogin }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [errors, setErrors] = useState({});
  const submit = () => {
    const e = {};
    if (!email.trim()) e.email = "Veuillez remplir votre email.";
    if (!pass.trim()) e.pass = "Veuillez remplir votre mot de passe.";
    setErrors(e);
    if (Object.keys(e).length) return;
    onLogin({ name: "Client Swift", email });
    go("dashboard");
  };
  return (
    <div style={{ ...rootFont, background: C.bg, minHeight: "100%", padding: "32px 24px", color: C.text }}>
      <Btn sm variant="ghost" onClick={() => go("landing")}>← Retour</Btn>
      <div style={{ fontSize: 38, marginTop: 26 }}>🔐</div>
      <div style={{ fontSize: 26, fontWeight: 900 }}>Bon retour !</div>
      <div style={{ color: C.textMuted, fontSize: 12, marginBottom: 16 }}>Connectez-vous à votre compte Swift</div>
      <Input label="Email" value={email} onChange={setEmail} icon="✉️" placeholder="vous@swift.ma" error={errors.email} />
      <Input label="Mot de passe" type="password" value={pass} onChange={setPass} icon="🔒" placeholder="••••••••" error={errors.pass} />
      <div style={{ textAlign: "right", marginBottom: 12 }}><button onClick={() => go("forgot")} style={{ ...rootFont, border: "none", background: "none", color: C.orange, cursor: "pointer", fontWeight: 700 }}>Mot de passe oublié ?</button></div>
      <Btn full onClick={submit}>Se connecter</Btn>
      <div style={{ textAlign: "center", color: C.textMuted, fontSize: 12, marginTop: 14 }}>Pas encore de compte ? <button onClick={() => go("register")} style={{ ...rootFont, color: C.orange, border: "none", background: "none", fontWeight: 700, cursor: "pointer" }}>Créer un compte</button></div>
    </div>
  );
}

function Register({ go, onRegister }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [errors, setErrors] = useState({});
  const next = () => {
    const e = {};
    if (!name.trim()) e.name = "Le nom est obligatoire.";
    if (!email.trim()) e.email = "L'email est obligatoire.";
    setErrors(e);
    if (!Object.keys(e).length) setStep(2);
  };
  const create = () => {
    const e = {};
    if (!pass.trim()) e.pass = "Le mot de passe est obligatoire.";
    setErrors(e);
    if (Object.keys(e).length) return;
    onRegister({ name, email });
    go("dashboard");
  };
  return (
    <div style={{ ...rootFont, background: C.bg, minHeight: "100%", padding: "28px 24px", color: C.text }}>
      <Btn sm variant="ghost" onClick={() => (step === 1 ? go("landing") : setStep(1))}>← Retour</Btn>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, margin: "14px 0 20px" }}>
        <div style={{ height: 4, borderRadius: 8, background: C.orange, transition: "all 0.3s" }} />
        <div style={{ height: 4, borderRadius: 8, background: step === 2 ? C.orange : C.darkBorder, transition: "all 0.3s" }} />
      </div>
      {step === 1 ? (
        <>
          <div style={{ fontSize: 38 }}>👋</div>
          <div style={{ fontSize: 24, fontWeight: 900 }}>Créer un compte</div>
          <div style={{ color: C.textMuted, fontSize: 12, marginBottom: 14 }}>C'est gratuit et rapide !</div>
          <Input label="Nom complet" icon="👤" value={name} onChange={setName} placeholder="Alexandre Martin" error={errors.name} />
          <Input label="Email" icon="✉️" value={email} onChange={setEmail} placeholder="vous@swift.ma" error={errors.email} />
          <Btn full onClick={next}>Continuer →</Btn>
        </>
      ) : (
        <>
          <div style={{ fontSize: 38 }}>🔒</div>
          <div style={{ fontSize: 24, fontWeight: 900 }}>Sécuriser le compte</div>
          <div style={{ color: C.textMuted, fontSize: 12, marginBottom: 14 }}>Choisissez un mot de passe sécurisé</div>
          <Input label="Mot de passe" type="password" icon="🔒" value={pass} onChange={setPass} placeholder="••••••••" error={errors.pass} />
          <Input label="Confirmer" type="password" icon="🔒" value={pass} onChange={setPass} placeholder="••••••••" />
          <Btn full onClick={create}>Créer mon compte 🎉</Btn>
        </>
      )}
      <div style={{ textAlign: "center", color: C.textMuted, fontSize: 12, marginTop: 14 }}>Déjà inscrit ? <button onClick={() => go("login")} style={{ ...rootFont, border: "none", background: "none", color: C.orange, fontWeight: 700, cursor: "pointer" }}>Se connecter</button></div>
    </div>
  );
}

function Forgot({ go }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  return <div style={{ ...rootFont, background: C.bg, minHeight: "100%", padding: "32px 24px", color: C.text }}><Btn sm variant="ghost" onClick={() => go("login")}>← Retour</Btn>{!sent ? <><div style={{ fontSize: 44, marginTop: 20 }}>🔑</div><div style={{ fontSize: 24, fontWeight: 900 }}>Mot de passe oublié</div><div style={{ color: C.textMuted, fontSize: 12, marginBottom: 14 }}>Entrez votre email et nous vous enverrons un lien.</div><Input label="Email" icon="✉️" value={email} onChange={setEmail} placeholder="vous@swift.ma" /><Btn full onClick={() => setSent(true)}>Envoyer le lien</Btn></> : <div style={{ textAlign: "center", marginTop: 28 }}><div style={{ fontSize: 60 }}>📬</div><div style={{ fontSize: 24, fontWeight: 900 }}>Email envoyé !</div><div style={{ color: C.textMuted, fontSize: 12, margin: "8px 0 14px" }}>Vérifiez votre boîte mail pour réinitialiser le mot de passe.</div><Btn full onClick={() => go("login")}>Retour à la connexion</Btn></div>}</div>;
}

function Landing({ go, isAuth, onNeedAuth }) {
  const [fade, setFade] = useState(false);
  const [actor, setActor] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [showAllCompanies, setShowAllCompanies] = useState(false);
  const [otherProblem, setOtherProblem] = useState("");
  const [sentProblem, setSentProblem] = useState(false);
  const [catPick, setCatPick] = useState(null);
  const [typePick, setTypePick] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const refs = { problem: useRef(null), solution: useRef(null), steps: useRef(null), enterprise: useRef(null) };
  useEffect(() => { const t = setTimeout(() => setFade(true), 80); return () => clearTimeout(t); }, []);
  const scrollTo = (key) => refs[key].current?.scrollIntoView({ behavior: "smooth", block: "start" });
  const categoryTypes = { restaurant: ["Fast-food", "Pizza", "Sushi"], flowers: ["Bouquets", "Roses", "Mariage"], groceries: ["Fruits", "Légumes", "Boissons"] };
  const typeMenu = { "Fast-food": [{ name: "Menu Burger", price: "89 MAD" }], Pizza: [{ name: "Pizza Margherita", price: "75 MAD" }], Sushi: [{ name: "Sushi Mix", price: "120 MAD" }], Bouquets: [{ name: "Bouquet Premium", price: "149 MAD" }], Roses: [{ name: "Roses rouges x12", price: "99 MAD" }], Mariage: [{ name: "Pack Mariage", price: "499 MAD" }], Fruits: [{ name: "Panier de fruits", price: "59 MAD" }], Légumes: [{ name: "Panier légumes", price: "49 MAD" }], Boissons: [{ name: "Pack boissons", price: "39 MAD" }] };
  const actors = [{ icon: "👤", t: "CLIENT", d: "Commander en 3 clics, suivre en temps réel" }, { icon: "🚴", t: "LIVREUR", d: "Accepter, livrer, gagner — tout depuis l'app" }, { icon: "🏢", t: "ENTREPRISES", d: "Gérer vos ventes, commandes et performances" }];
  const actionSavoirPlus = () => { if (isAuth) go("dashboard"); else onNeedAuth(); };
  const submitProblem = () => { if (!otherProblem.trim()) return; setSentProblem(true); setOtherProblem(""); setTimeout(() => setSentProblem(false), 2500); };
  return (
    <div style={{ ...rootFont, background: C.white, color: C.black, opacity: fade ? 1 : 0, transition: "opacity 0.5s" }}>
      <style>{`@keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}@keyframes marqueeR{from{transform:translateX(-50%)}to{transform:translateX(0)}}`}</style>
      <div style={{ position: "sticky", top: 0, zIndex: 4, background: C.white, borderBottom: `1px solid ${C.border}`, padding: "10px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 900, fontSize: 18 }}><span style={{ width: 8, height: 8, borderRadius: 999, background: C.orange }} />Swift</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <Btn sm variant="outline" onClick={() => scrollTo("solution")}>Fonctionnalités</Btn>
          <Btn sm variant="outline" onClick={() => scrollTo("enterprise")}>Entreprises</Btn>
          <Btn sm variant="outline" onClick={() => scrollTo("steps")}>Livreurs</Btn>
          <Btn sm variant="outline" onClick={() => scrollTo("problem")}>A propos</Btn>
          <Btn sm onClick={() => go("login")}>Se connecter</Btn>
        </div>
      </div>
      <section style={{ padding: "36px 30px" }}>
        <div style={{ color: C.orange, fontWeight: 800, fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase" }}>Livraison express · Casablanca</div>
        <h1 style={{ margin: "10px 0", fontSize: 42, lineHeight: 1.05, letterSpacing: "-0.03em", fontWeight: 900, maxWidth: 760 }}>Tout ce dont vous avez besoin, livré en <span style={{ color: C.orange, borderBottom: `3px solid ${C.orange}` }}>moins de 30 min.</span></h1>
        <p style={{ color: C.muted, fontSize: 15, lineHeight: 1.75, maxWidth: 760 }}>Swift connecte clients, commerçants et livreurs pour des livraisons ultra-rapides, fiables et traçables partout à Casablanca.</p>
        <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
          <Btn onClick={() => go("register")}>Commander maintenant</Btn>
          <button onClick={() => scrollTo("solution")} style={{ ...rootFont, border: "none", background: "transparent", color: C.muted, fontWeight: 700, cursor: "pointer" }}>▶ Voir comment ça marche</button>
        </div>
      </section>

      <section style={{ background: "#F5F4F0", borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
          <div><div style={{ color: C.orange, fontSize: 9, letterSpacing: "0.15em", fontWeight: 800 }}>NOS PARTENAIRES</div><div style={{ fontSize: 18, fontWeight: 900 }}>50+ enseignes vous font confiance</div></div>
          <Btn sm variant="outline" onClick={() => setShowAllCompanies((v) => !v)}>{showAllCompanies ? "Fermer" : "Voir tout →"}</Btn>
        </div>
        {showAllCompanies && <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 8, marginBottom: 10 }}>{businesses.map((b) => <div key={b.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 10, fontSize: 12, fontWeight: 700 }}>{b.icon} {b.name}</div>)}</div>}
        <MarqueeRow items={partners.slice(0, 8)} /><div style={{ height: 10 }} /><MarqueeRow items={[...partners.slice(8, 16), ...partners.slice(0, 3)]} reverse />
      </section>

      <section ref={refs.problem} style={{ background: "#F5F4F0", padding: "28px 30px" }}>
        <div style={{ color: C.orange, fontSize: 9, letterSpacing: "0.15em", fontWeight: 800 }}>LE PROBLÈME</div>
        <h2 style={{ marginTop: 8, fontSize: 30, fontWeight: 900, maxWidth: 840 }}>Vous en avez assez de… retards et commandes sans visibilité</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 10 }}>
          {["⏳ Temps d'attente imprévisibles", "📞 Appels interminables au support", "❌ Mauvaises commandes et peu de transparence"].map((t) => <div key={t} style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: 12, fontSize: 13, fontWeight: 600 }}>{t}</div>)}
        </div>
        <div style={{ marginTop: 10, background: C.white, borderRadius: 14, border: `1.5px solid ${C.orange}`, padding: 12, color: C.orange, fontSize: 12, fontWeight: 800 }}>Swift a été conçu pour résoudre exactement ces problèmes.</div>
        <div style={{ marginTop: 12, background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: 12 }}>
          <div style={{ fontWeight: 800, marginBottom: 8 }}>Autres problèmes ?</div>
          <textarea value={otherProblem} onChange={(e) => setOtherProblem(e.target.value)} placeholder="Décrivez votre problème..." style={{ ...rootFont, width: "100%", minHeight: 80, border: `1px solid ${C.border}`, borderRadius: 10, padding: 10, boxSizing: "border-box", resize: "vertical" }} />
          <Btn onClick={submitProblem} style={{ marginTop: 8 }}>Submit</Btn>
          {sentProblem && <div style={{ marginTop: 8, color: C.green, fontWeight: 800 }}>Opération succée</div>}
        </div>
      </section>

      <section ref={refs.solution} style={{ padding: "28px 30px" }}>
        <div style={{ color: C.orange, fontSize: 9, letterSpacing: "0.15em", fontWeight: 800 }}>LA SOLUTION</div>
        <h2 style={{ margin: "8px 0 0", fontSize: 34, fontWeight: 900, letterSpacing: "-0.03em" }}>Une plateforme. Trois acteurs.</h2>
        <h3 style={{ margin: 0, fontSize: 34, fontWeight: 900, color: C.orange }}>Zero friction.</h3>
        <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
          {actors.map((a, i) => <button key={a.t} onClick={() => setActor(i)} style={{ ...rootFont, textAlign: "left", transition: "all 0.25s", borderRadius: 14, border: `${i === actor ? 1.5 : 1}px solid ${i === actor ? C.orange : C.border}`, background: i === actor ? C.white : "transparent", padding: 12, cursor: "pointer" }}><div style={{ fontWeight: 800 }}>{a.icon} {a.t}</div>{i === actor && <><div style={{ fontSize: 12, color: C.muted }}>{a.d}</div><button onClick={actionSavoirPlus} style={{ ...rootFont, marginTop: 8, border: "none", background: "none", color: C.orange, fontWeight: 800, cursor: "pointer", padding: 0 }}>En savoir plus →</button></>}</button>)}
        </div>
      </section>

      <section ref={refs.steps} style={{ background: "#F5F4F0", padding: "28px 30px" }}>
        <div style={{ color: C.orange, fontSize: 9, letterSpacing: "0.15em", fontWeight: 800 }}>ÉTAPES</div>
        <h2 style={{ margin: "8px 0 2px", fontSize: 30, fontWeight: 900 }}>Livré en 4 étapes simples</h2>
        <div style={{ marginTop: 12, display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))" }}>
          {["Choisissez 👆", "Commandez ✅", "On s'occupe du reste 🛵", "Recevez à votre porte 📦"].map((x, i) => <div key={x} onClick={() => setActiveStep(i)} style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: 12, cursor: "pointer" }}><span style={{ display: "inline-flex", width: 26, height: 26, borderRadius: 999, alignItems: "center", justifyContent: "center", border: activeStep === i ? "none" : `1px solid ${C.border}`, background: activeStep === i ? C.orange : C.white, color: activeStep === i ? C.white : C.muted, fontWeight: 800, fontSize: 11 }}>{String(i + 1).padStart(2, "0")}</span><div style={{ marginTop: 8, fontWeight: 700, fontSize: 12 }}>{x}</div></div>)}
        </div>
        <button onClick={() => scrollTo("problem")} style={{ ...rootFont, marginTop: 12, background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: 12, color: C.muted, fontStyle: "italic", fontSize: 12, width: "100%", textAlign: "left", cursor: "pointer" }}>"Chaque minute compte. Swift est pensé pour la vitesse, sans compromis." <span style={{ color: C.orange, fontWeight: 700, fontStyle: "normal" }}>— L'équipe Swift</span></button>
      </section>

      <section ref={refs.enterprise} style={{ padding: "28px 30px" }}>
        <div style={{ color: C.orange, fontSize: 9, letterSpacing: "0.15em", fontWeight: 800 }}>POUR LES ENTREPRISES</div>
        <h2 style={{ margin: "8px 0", fontSize: 34, fontWeight: 900 }}>Augmentez vos ventes de <span style={{ color: C.orange }}>40% en rejoignant Swift</span></h2>
        <Btn onClick={() => go("register")}>Entreprises</Btn>
      </section>

      <section style={{ background: "#F5F4F0", padding: "28px 30px" }}>
        <div style={{ color: C.orange, fontSize: 9, letterSpacing: "0.15em", fontWeight: 800 }}>CATÉGORIES</div>
        <h2 style={{ margin: "8px 0", fontSize: 28, fontWeight: 900 }}>Explorer nos catégories</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 10 }}>
          {categories.map((cat) => <button key={cat.id} onClick={() => { setCatPick(cat); setTypePick(null); setMenuOpen(false); }} style={{ ...rootFont, border: `1px solid ${cat.color}22`, background: C.white, borderRadius: 14, overflow: "hidden", cursor: "pointer", padding: 0 }}><img src={cat.image} alt={cat.label} style={{ width: "100%", height: 110, objectFit: "cover" }} /><div style={{ padding: 8, color: cat.color, fontSize: 12, fontWeight: 700 }}>{cat.label}</div></button>)}
        </div>
        {catPick && <div style={{ marginTop: 12, background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: 12 }}>
          <div style={{ fontWeight: 900, marginBottom: 8 }}>Types de {catPick.label}</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{(categoryTypes[catPick.id] || ["Standard", "Premium"]).map((t) => <Btn key={t} sm variant={typePick === t ? "primary" : "outline"} onClick={() => { setTypePick(t); setMenuOpen(false); }}>{t}</Btn>)}</div>
          {typePick && <div style={{ marginTop: 10 }}><Btn sm onClick={() => setMenuOpen(true)}>Voir le menu de {typePick}</Btn></div>}
          {menuOpen && <div style={{ marginTop: 10, display: "grid", gap: 8 }}>{(typeMenu[typePick] || [{ name: "Produit du jour", price: "79 MAD" }]).map((item) => <button key={item.name} onClick={() => (isAuth ? go("dashboard") : go("login"))} style={{ ...rootFont, textAlign: "left", border: `1px solid ${C.border}`, borderRadius: 10, background: C.card, padding: 10, cursor: "pointer" }}>{item.name} — <strong>{item.price}</strong> · {isAuth ? "Aller au compte" : "Se connecter"}</button>)}</div>}
        </div>}
      </section>
    </div>
  );
}

function Dashboard({ go, setSelectedBiz }) {
  const [activeCat, setActiveCat] = useState(null);
  const [search, setSearch] = useState("");
  const visible = useMemo(() => businesses.filter((b) => (!activeCat || b.cat === activeCat) && b.name.toLowerCase().includes(search.toLowerCase())), [activeCat, search]);
  const catLabel = activeCat ? categories.find((c) => c.id === activeCat)?.label : "Près de vous";
  return <div style={{ ...rootFont, background: C.bg, minHeight: "100%" }}><div style={{ padding: "24px 20px", background: "linear-gradient(145deg,#FF6B00,#FF3E00)", color: C.white }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div><div style={{ fontSize: 11, opacity: 0.85 }}>Bonjour 👋</div><div style={{ fontSize: 28, fontWeight: 900 }}>Que souhaitez-vous ?</div></div><button onClick={() => go("profile")} style={{ ...rootFont, width: 40, height: 40, borderRadius: "50%", border: "none", background: "rgba(255,255,255,0.25)", color: C.white, cursor: "pointer" }}>👤</button></div><div style={{ marginTop: 12, position: "relative" }}><span style={{ position: "absolute", left: 12, top: 9 }}>🔍</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un commerce..." style={{ ...rootFont, width: "100%", background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 14, color: C.white, padding: "10px 12px 10px 34px", outline: "none", boxSizing: "border-box" }} /></div></div><div style={{ padding: "20px 16px" }}><div style={{ color: C.text, fontSize: 15, fontWeight: 800 }}>Catégories</div><div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginTop: 10 }}>{categories.map((cat) => <button key={cat.id} onClick={() => setActiveCat(activeCat === cat.id ? null : cat.id)} style={{ ...rootFont, background: activeCat === cat.id ? C.orange : C.darkCard, border: `1px solid ${activeCat === cat.id ? C.orange : C.darkBorder}`, borderRadius: 14, padding: "10px 6px", color: activeCat === cat.id ? C.white : C.textMuted, cursor: "pointer" }}><div style={{ fontSize: 18 }}>{cat.icon}</div><div style={{ fontSize: 9, fontWeight: 700 }}>{cat.label}</div></button>)}</div><div style={{ color: C.text, fontSize: 15, fontWeight: 800, margin: "14px 0 10px" }}>{catLabel} ({visible.length})</div><div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{visible.length ? visible.map((biz) => <button key={biz.id} onClick={() => { setSelectedBiz(biz); go("catalogue"); }} style={{ ...rootFont, textAlign: "left", background: C.darkCard, border: `1px solid ${C.darkBorder}`, borderRadius: 18, padding: 10, color: C.text, cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}><img src={categories.find((c) => c.id === biz.cat)?.image} alt={biz.name} style={{ width: 74, height: 52, borderRadius: 14, objectFit: "cover" }} /><div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: 14 }}>{biz.name}</div><div style={{ fontSize: 11, color: C.textMuted }}>{categories.find((c) => c.id === biz.cat)?.label} · {biz.time} min</div></div><div style={{ textAlign: "right" }}><div style={{ color: "#F59E0B", fontSize: 12, fontWeight: 700 }}>★ {biz.rating}</div><div style={{ color: C.orange, fontSize: 11, fontWeight: 700 }}>Voir →</div></div></button>) : <div style={{ color: C.textMuted, textAlign: "center", padding: 14 }}>Aucun résultat trouvé 😕</div>}</div></div></div>;
}

function Catalogue({ go, selectedBiz, cart, setCart }) {
  const [catFilter, setCatFilter] = useState("All");
  const [priceFilter, setPriceFilter] = useState("All");
  const filtered = useMemo(() => catalogueProducts.filter((p) => (catFilter === "All" || p.cat === catFilter) && (priceFilter === "All" || (priceFilter === "< 5€" && p.price < 5) || (priceFilter === "5-10€" && p.price >= 5 && p.price <= 10) || (priceFilter === "> 10€" && p.price > 10))), [catFilter, priceFilter]);
  const count = cart.reduce((a, i) => a + i.qty, 0);
  const inCart = (id) => cart.some((x) => x.id === id);
  const add = (p) => setCart((prev) => prev.some((x) => x.id === p.id) ? prev.map((x) => (x.id === p.id ? { ...x, qty: x.qty + 1 } : x)) : [...prev, { ...p, qty: 1 }]);
  return <div style={{ ...rootFont, background: C.bg, minHeight: "100%" }}><div style={{ padding: "20px 16px", background: "linear-gradient(145deg,#FF6B00,#FF3E00)", color: C.white }}><div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}><Btn sm variant="dark" onClick={() => go("dashboard")} style={{ background: "rgba(255,255,255,0.2)" }}>←</Btn><div style={{ textAlign: "center" }}><div style={{ fontSize: 17, fontWeight: 900 }}>{selectedBiz?.name || "Catalogue Swift"}</div><div style={{ fontSize: 11 }}>⏱ {selectedBiz?.time || "20-30"} min · ★ {selectedBiz?.rating || 4.8}</div></div><button onClick={() => go("cart")} style={{ ...rootFont, width: 36, height: 36, borderRadius: "50%", border: "none", background: "rgba(255,255,255,0.2)", color: C.white, cursor: "pointer", position: "relative" }}>🛒{count > 0 && <span style={{ position: "absolute", top: -2, right: -2, width: 16, height: 16, borderRadius: 999, background: C.orange, color: C.white, fontSize: 9, display: "grid", placeItems: "center", fontWeight: 800 }}>{count}</span>}</button></div></div><div style={{ padding: 16 }}><div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>{["All", "Burgers", "Sides", "Drinks"].map((x) => <Tag key={x} active={catFilter === x} onClick={() => setCatFilter(x)}>{x}</Tag>)}</div><div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>{["All", "< 5€", "5-10€", "> 10€"].map((x) => <Tag key={x} active={priceFilter === x} onClick={() => setPriceFilter(x)}>{x}</Tag>)}</div><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>{filtered.map((p) => <div key={p.id} style={{ background: C.darkCard, borderRadius: 18, padding: 14, border: `1px solid ${C.darkBorder}` }}><div style={{ background: C.surface, borderRadius: 12, padding: "12px 0", textAlign: "center", fontSize: 38 }}>{p.icon}</div><div style={{ color: C.text, fontSize: 13, fontWeight: 700, marginTop: 8 }}>{p.name}</div><div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}><div style={{ color: C.orange, fontWeight: 900, fontSize: 15 }}>{money(p.price)}</div><button onClick={() => add(p)} style={{ ...rootFont, width: 30, height: 30, borderRadius: 10, border: "none", color: C.white, background: inCart(p.id) ? C.green : C.orange, cursor: "pointer", transition: "background 0.2s", fontWeight: 900 }}>{inCart(p.id) ? "✓" : "+"}</button></div></div>)}</div></div></div>;
}

function Cart({ go, cart, setCart }) {
  const inc = (id) => setCart((prev) => prev.map((x) => (x.id === id ? { ...x, qty: x.qty + 1 } : x)));
  const dec = (id) => setCart((prev) => prev.flatMap((x) => (x.id !== id ? [x] : x.qty > 1 ? [{ ...x, qty: x.qty - 1 }] : [])));
  const subtotal = cart.reduce((a, i) => a + i.price * i.qty, 0);
  const total = subtotal + (cart.length ? 2.99 : 0);
  return <div style={{ ...rootFont, background: C.bg, minHeight: "100%", padding: 16 }}><Btn sm variant="ghost" onClick={() => go("catalogue")}>← Retour</Btn><div style={{ fontSize: 20, fontWeight: 900, color: C.text, margin: "8px 0 12px" }}>Mon Panier</div>{!cart.length ? <div style={{ textAlign: "center", color: C.textMuted, marginTop: 34 }}><div style={{ fontSize: 60 }}>🛒</div><div style={{ fontSize: 16, color: C.text }}>Votre panier est vide</div><Btn onClick={() => go("catalogue")} style={{ marginTop: 10 }}>Parcourir le menu</Btn></div> : <><div style={{ display: "grid", gap: 10 }}>{cart.map((i) => <div key={i.id} style={{ background: C.darkCard, border: `1px solid ${C.darkBorder}`, borderRadius: 16, padding: 10, display: "flex", alignItems: "center", gap: 10 }}><div style={{ width: 46, height: 46, borderRadius: "50%", background: C.surface, display: "grid", placeItems: "center", fontSize: 24 }}>{i.icon}</div><div style={{ flex: 1 }}><div style={{ color: C.text, fontWeight: 700 }}>{i.name}</div><div style={{ color: C.orange, fontWeight: 900 }}>{money(i.price * i.qty)}</div></div><button onClick={() => dec(i.id)} style={{ ...rootFont, width: 28, height: 28, borderRadius: 9, border: "none", background: C.surface, color: C.text, cursor: "pointer" }}>−</button><div style={{ color: C.text, fontWeight: 800 }}>{i.qty}</div><button onClick={() => inc(i.id)} style={{ ...rootFont, width: 28, height: 28, borderRadius: 9, border: "none", background: C.orange, color: C.white, cursor: "pointer" }}>+</button></div>)}</div><div style={{ marginTop: 12, background: C.darkCard, border: `1px solid ${C.darkBorder}`, borderRadius: 18, padding: 12, color: C.textMuted }}><div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}><span>Sous-total</span><span>{money(subtotal)}</span></div><div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginTop: 4 }}><span>Livraison</span><span>2.99€</span></div><div style={{ height: 1, background: C.darkBorder, margin: "10px 0" }} /><div style={{ display: "flex", justifyContent: "space-between", fontWeight: 900, color: C.orange, fontSize: 18 }}><span>Total</span><span>{money(total)}</span></div></div><Btn full onClick={() => go("checkout")} style={{ marginTop: 12 }}>Passer la commande →</Btn></>}</div>;
}

function Checkout({ go, cart, setCart }) {
  const [address, setAddress] = useState("32 Boulevard Zerktouni, Casablanca");
  const [payment, setPayment] = useState("cash");
  const [done, setDone] = useState(false);
  if (done) return <div style={{ ...rootFont, background: C.bg, minHeight: "100%", padding: 18, textAlign: "center", color: C.text }}><div style={{ fontSize: 72, marginTop: 40 }}>🎉</div><div style={{ fontSize: 26, fontWeight: 900 }}>Commande confirmée !</div><div style={{ color: C.textMuted, fontSize: 12, margin: "8px 0 14px" }}>Votre commande est en préparation. Un livreur arrive bientôt.</div><Btn full onClick={() => go("tracking")}>Suivre ma commande 📍</Btn></div>;
  return <div style={{ ...rootFont, background: C.bg, minHeight: "100%", padding: 16 }}><Btn sm variant="ghost" onClick={() => go("cart")}>← Retour</Btn><div style={{ fontSize: 22, color: C.text, fontWeight: 900, margin: "8px 0 12px" }}>Finaliser</div><div style={{ background: C.darkCard, border: `1px solid ${C.darkBorder}`, borderRadius: 16, padding: 12, marginBottom: 10 }}><div style={{ color: C.text, fontSize: 12, fontWeight: 700, marginBottom: 8 }}>📍 Adresse de livraison</div><Input value={address} onChange={setAddress} placeholder="Adresse complète" /></div><div style={{ background: C.darkCard, border: `1px solid ${C.darkBorder}`, borderRadius: 16, padding: 12 }}><div style={{ color: C.text, fontSize: 12, fontWeight: 700, marginBottom: 8 }}>💳 Mode de paiement</div>{[["cash", "💵 Paiement en espèces"], ["card", "💳 Paiement en ligne"]].map((p) => <button key={p[0]} onClick={() => setPayment(p[0])} style={{ ...rootFont, width: "100%", textAlign: "left", background: payment === p[0] ? "rgba(255,107,0,0.1)" : C.surface, border: `1px solid ${payment === p[0] ? C.orange : C.darkBorder}`, color: C.text, borderRadius: 12, padding: "10px 12px", marginBottom: 8, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}><span>{p[1]}</span><span style={{ width: 16, height: 16, borderRadius: 999, border: `2px solid ${payment === p[0] ? C.orange : C.darkBorder}`, background: payment === p[0] ? C.orange : "transparent" }} /></button>)}</div><Btn full onClick={() => { setDone(true); if (cart.length) setCart([]); }} style={{ marginTop: 12 }}>Confirmer la commande ✅</Btn></div>;
}

function Tracking({ go }) {
  const [status, setStatus] = useState(0);
  useEffect(() => { if (status >= 2) return undefined; const t = setTimeout(() => setStatus((s) => Math.min(s + 1, 2)), 4000); return () => clearTimeout(t); }, [status]);
  const steps = [["👨‍🍳", "En préparation", "Le restaurant prépare votre commande"], ["🛵", "En route", "Votre livreur est en chemin"], ["✅", "Livré", "Votre commande a été livrée !"]];
  return <div style={{ ...rootFont, background: C.bg, minHeight: "100%", padding: 16 }}><Btn sm variant="ghost" onClick={() => go("dashboard")}>← Retour</Btn><div style={{ fontSize: 22, color: C.text, fontWeight: 900, margin: "8px 0 12px" }}>Suivi commande</div><div style={{ position: "relative", height: 190, borderRadius: 20, overflow: "hidden", background: "linear-gradient(140deg,#14141D,#262642)", marginBottom: 10 }}><div style={{ position: "absolute", width: 240, height: 240, borderRadius: "50%", background: "radial-gradient(circle,#ff6b0033,transparent)", left: 70, top: -80 }} /><div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: C.text }}><div style={{ textAlign: "center" }}><div style={{ fontSize: 48 }}>🗺️</div><div style={{ fontWeight: 700 }}>Carte en temps réel</div></div></div>{status === 1 && <div style={{ position: "absolute", left: "58%", top: "42%", fontSize: 32 }}>🛵</div>}</div><div style={{ background: C.darkCard, border: `1px solid ${C.darkBorder}`, borderRadius: 18, padding: 12 }}>{steps.map((s, i) => <div key={s[1]} style={{ display: "flex", gap: 10 }}><div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}><div style={{ width: 32, height: 32, borderRadius: "50%", border: `1px solid ${i <= status ? C.orange : C.darkBorder}`, background: i <= status ? "linear-gradient(145deg,#FF6B00,#FF3500)" : C.surface, color: C.white, display: "grid", placeItems: "center", transition: "all 0.5s" }}>{s[0]}</div>{i < 2 && <div style={{ width: 2, height: 26, background: i < status ? C.orange : C.darkBorder, transition: "all 0.5s" }} />}</div><div style={{ flex: 1, paddingTop: 3, color: i <= status ? C.text : C.textMuted, transition: "color 0.5s" }}><div style={{ fontWeight: 700 }}>{s[1]}</div>{i === status && <div style={{ fontSize: 11, marginTop: 2 }}>{s[2]}</div>}</div></div>)}</div></div>;
}

function History() {
  const [open, setOpen] = useState(null);
  const orders = [{ id: "#0042", store: "Burger Palace", date: "3 Mai 2026", total: 24.97, status: "Livré", items: ["Classic Burger", "Cheese Fries", "Cola"] }, { id: "#0038", store: "PharmaCare", date: "28 Avr 2026", total: 18.5, status: "Livré", items: ["Vitamine C", "Antidouleur"] }, { id: "#0031", store: "Sushi Zen", date: "20 Avr 2026", total: 32.0, status: "Livré", items: ["Sushi Box", "Soupe Miso"] }];
  return <div style={{ ...rootFont, background: C.bg, minHeight: "100%", padding: 16 }}><div style={{ fontSize: 22, color: C.text, fontWeight: 900, marginBottom: 12 }}>Mes commandes</div><div style={{ display: "grid", gap: 10 }}>{orders.map((o) => <button key={o.id} onClick={() => setOpen(open === o.id ? null : o.id)} style={{ ...rootFont, textAlign: "left", background: C.darkCard, border: `1px solid ${C.darkBorder}`, borderRadius: 16, color: C.text, padding: 12, cursor: "pointer" }}><div style={{ display: "flex", justifyContent: "space-between" }}><div><div style={{ fontWeight: 700 }}>{o.store}</div><div style={{ color: C.textMuted, fontSize: 11 }}>{o.date}</div></div><div style={{ textAlign: "right" }}><div style={{ color: C.orange, fontWeight: 900 }}>{money(o.total)}</div><div style={{ color: C.green, fontSize: 11, fontWeight: 700 }}>✅ {o.status}</div></div></div>{open === o.id && <><div style={{ height: 1, background: C.darkBorder, margin: "10px 0" }} /><div style={{ color: C.textMuted, fontSize: 12 }}>{o.items.map((it) => <div key={it}>• {it}</div>)}</div><div style={{ display: "flex", gap: 8, marginTop: 10 }}><Btn sm variant="outline">⭐ Évaluer</Btn><Btn sm variant="ghost">🔁 Recommander</Btn></div></>}</button>)}</div></div>;
}

function Profile({ go, user }) {
  const [notif, setNotif] = useState({ orders: true, promos: false, news: true });
  const toggle = (k) => setNotif((p) => ({ ...p, [k]: !p[k] }));
  const Row = ({ icon, text }) => <button style={{ ...rootFont, background: C.darkCard, border: `1px solid ${C.darkBorder}`, borderRadius: 16, color: C.text, width: "100%", textAlign: "left", padding: 12, display: "flex", justifyContent: "space-between", cursor: "pointer", marginBottom: 8 }}><span>{icon} {text}</span><span>›</span></button>;
  const Toggle = ({ label, v, on }) => <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}><span style={{ color: C.text, fontSize: 12 }}>{label}</span><button onClick={on} style={{ ...rootFont, width: 44, height: 24, borderRadius: 999, border: "none", background: v ? C.orange : C.surface, position: "relative", cursor: "pointer" }}><span style={{ position: "absolute", top: 3, left: v ? 23 : 3, width: 18, height: 18, borderRadius: "50%", background: C.white, transition: "left 0.2s" }} /></button></div>;
  return <div style={{ ...rootFont, background: C.bg, minHeight: "100%", padding: 16 }}><div style={{ borderRadius: 18, padding: 14, color: C.white, background: "linear-gradient(145deg,#FF6B00,#FF3E00)", marginBottom: 10 }}><div style={{ width: 58, height: 58, borderRadius: "50%", background: "rgba(255,255,255,0.25)", display: "grid", placeItems: "center", fontSize: 28 }}>👤</div><div style={{ marginTop: 8, fontWeight: 900, fontSize: 18 }}>{user?.name || "Client Swift"}</div><div style={{ fontSize: 12, opacity: 0.85 }}>{user?.email || "client@swift.ma"}</div></div><Row icon="👤" text="Informations personnelles" /><Row icon="📍" text="Adresses sauvegardées" /><Row icon="💳" text="Modes de paiement" /><div style={{ background: C.darkCard, border: `1px solid ${C.darkBorder}`, borderRadius: 16, padding: 12, marginBottom: 10 }}><div style={{ color: C.text, fontWeight: 700, marginBottom: 10 }}>🔔 Notifications</div><Toggle label="Mises à jour commandes" v={notif.orders} on={() => toggle("orders")} /><Toggle label="Promotions et offres" v={notif.promos} on={() => toggle("promos")} /><Toggle label="Nouveautés" v={notif.news} on={() => toggle("news")} /></div><Btn full variant="danger" onClick={() => go("landing")}>Se déconnecter</Btn></div>;
}

function SwiftMobileApp() {
  const [screen, setScreen] = useState("landing");
  const [selectedBiz, setSelectedBiz] = useState(null);
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const isAuth = !!user;
  const appScreens = ["dashboard", "catalogue", "cart", "checkout", "tracking", "history", "profile"];
  const showBottom = appScreens.includes(screen);
  const cartCount = cart.reduce((a, i) => a + i.qty, 0);
  const go = (s) => setScreen(s);
  const bg = isAuthScreen(screen) ? C.white : C.bg;
  let view = null;
  if (screen === "landing") view = <Landing go={go} isAuth={isAuth} onNeedAuth={() => go("login")} />;
  if (screen === "login") view = <Login go={go} onLogin={setUser} />;
  if (screen === "register") view = <Register go={go} onRegister={setUser} />;
  if (screen === "forgot") view = <Forgot go={go} />;
  if (screen === "dashboard") view = <Dashboard go={go} setSelectedBiz={setSelectedBiz} />;
  if (screen === "catalogue") view = <Catalogue go={go} selectedBiz={selectedBiz} cart={cart} setCart={setCart} />;
  if (screen === "cart") view = <Cart go={go} cart={cart} setCart={setCart} />;
  if (screen === "checkout") view = <Checkout go={go} cart={cart} setCart={setCart} />;
  if (screen === "tracking") view = <Tracking go={go} />;
  if (screen === "history") view = <History />;
  if (screen === "profile") view = <Profile go={go} user={user} />;

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <div style={{ ...rootFont, minHeight: "100vh", background: "#111", padding: 0 }}>
        <div style={{ width: "100%", minHeight: "100vh", background: bg, display: "flex", flexDirection: "column" }}>
          <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", background: bg }}>{view}</div>
          {showBottom && (
            <div style={{ position: "sticky", bottom: 0, backdropFilter: "blur(20px)", background: "rgba(19,19,26,0.9)", borderTop: `1px solid ${C.darkBorder}`, display: "grid", gridTemplateColumns: "repeat(5,1fr)", padding: "8px 4px 10px" }}>
              {[["dashboard", "🏠", "Home"], ["catalogue", "🛒", "Shop"], ["cart", "📦", "Panier"], ["history", "📜", "Commandes"], ["profile", "👤", "Profil"]].map((t) => {
                const active = screen === t[0];
                return <button key={t[0]} onClick={() => go(t[0])} style={{ ...rootFont, border: "none", background: "none", color: active ? C.orange : C.textMuted, cursor: "pointer", fontSize: 10, fontWeight: active ? 800 : 500, position: "relative" }}><span style={{ display: "inline-grid", placeItems: "center", width: 28, height: 28, borderRadius: 999, background: active ? "rgba(255,107,0,0.18)" : "transparent", boxShadow: active ? `0 0 20px ${C.orangeGlow}` : "none", position: "relative" }}>{t[1]}{t[0] === "cart" && cartCount > 0 && <span style={{ position: "absolute", top: -4, right: -6, width: 16, height: 16, borderRadius: "50%", background: C.orange, color: C.white, fontSize: 9, display: "grid", placeItems: "center", fontWeight: 800 }}>{cartCount}</span>}</span><div>{t[2]}</div></button>;
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
