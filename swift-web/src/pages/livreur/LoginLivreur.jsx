import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../../api/client.js";

const BG = "#09090F";
const CARD = "#18181F";
const BORDER = "#26263A";
const INPUT_BG = "#111118";
const FOCUS = "#00A082";
const MUTED = "#7777A0";
const TEXT = "#F0F0FA";
const ORANGE = "#FF6B00";
const RED = "#EF4444";

export default function LoginLivreur() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [vehicleType, setVehicleType] = useState("moto");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);

  const apiErrMessage = (err) => {
    const d = err.response?.data;
    if (typeof d === "object" && d !== null) {
      return d.error || d.detail || d.message || JSON.stringify(d);
    }
    return err.message || "Erreur réseau.";
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    const em = email.trim();
    const pw = password.trim();
    if (!em || !pw) {
      setError("Veuillez remplir l’email et le mot de passe.");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/api/driver/login/", { email: em, password: pw });
      const token = res.data?.token;
      if (!token) {
        setError("Réponse invalide : token manquant.");
        return;
      }
      localStorage.setItem("livreur_token", token);
      if (res.data?.driver?.id != null) {
        localStorage.setItem("livreur_id", String(res.data.driver.id));
      }
      requestAnimationFrame(() => navigate("/livreur/dashboard", { replace: true }));
    } catch (err) {
      setError(apiErrMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()) {
      setError("Tous les champs sont requis.");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/api/driver/register/", {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim().toLowerCase(),
        password: password.trim(),
        vehicle_type: vehicleType,
      });
      const token = res.data?.token;
      if (!token) {
        setError("Réponse invalide : token manquant.");
        return;
      }
      localStorage.setItem("livreur_token", token);
      if (res.data?.driver?.id != null) {
        localStorage.setItem("livreur_id", String(res.data.driver.id));
      }
      requestAnimationFrame(() => navigate("/livreur/dashboard", { replace: true }));
    } catch (err) {
      setError(apiErrMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (focused) => ({
    width: "100%",
    boxSizing: "border-box",
    padding: "14px 16px",
    borderRadius: 12,
    border: `1.5px solid ${focused ? FOCUS : BORDER}`,
    background: INPUT_BG,
    color: TEXT,
    fontSize: 14,
    outline: "none",
    marginBottom: 14,
    fontFamily: "inherit",
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        background: BG,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "24px 20px 40px",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <div style={{ textAlign: "center", marginTop: 32, marginBottom: 28 }}>
        <div style={{ fontSize: 28, fontWeight: 900, color: TEXT, letterSpacing: "-0.02em" }}>⚡ Swift</div>
        <div
          style={{
            marginTop: 10,
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: "0.35em",
            color: MUTED,
            textTransform: "uppercase",
          }}
        >
          LIVRAISON EXPRESS
        </div>
      </div>

      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: CARD,
          border: `1px solid ${BORDER}`,
          borderRadius: 24,
          padding: "28px 24px 32px",
          boxShadow: "0 24px 48px rgba(0,0,0,0.45)",
        }}
      >
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError("");
            }}
            style={{
              flex: 1,
              padding: "10px 12px",
              borderRadius: 12,
              border: "none",
              fontWeight: 800,
              cursor: "pointer",
              fontFamily: "inherit",
              background: mode === "login" ? ORANGE : "#2a2a35",
              color: "#fff",
            }}
          >
            Connexion
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setError("");
            }}
            style={{
              flex: 1,
              padding: "10px 12px",
              borderRadius: 12,
              border: "none",
              fontWeight: 800,
              cursor: "pointer",
              fontFamily: "inherit",
              background: mode === "register" ? ORANGE : "#2a2a35",
              color: "#fff",
            }}
          >
            Inscription
          </button>
        </div>

        <h1
          style={{
            margin: 0,
            color: "#FFFFFF",
            fontSize: 24,
            fontWeight: 900,
            textAlign: "center",
          }}
        >
          Espace Livreur 🛵
        </h1>
        <p
          style={{
            margin: "10px 0 0",
            textAlign: "center",
            color: MUTED,
            fontSize: 13,
            lineHeight: 1.5,
          }}
        >
          {mode === "login" ? "Connectez-vous pour recevoir des commandes" : "Créez votre compte livreur Swift"}
        </p>

        {mode === "login" ? (
          <form onSubmit={handleLogin} style={{ marginTop: 28 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", color: MUTED, marginBottom: 8 }}>EMAIL</label>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              placeholder="vous@exemple.com"
              style={inputStyle(emailFocused)}
            />
            <label style={{ display: "block", fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", color: MUTED, marginBottom: 8 }}>MOT DE PASSE</label>
            <div style={{ position: "relative", marginBottom: 8 }}>
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setPassFocused(true)}
                onBlur={() => setPassFocused(false)}
                placeholder="••••••••"
                style={{ ...inputStyle(passFocused), marginBottom: 0, paddingRight: 52 }}
              />
              <button
                type="button"
                aria-label={showPassword ? "Masquer" : "Afficher"}
                onClick={() => setShowPassword((v) => !v)}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  fontSize: 18,
                  padding: 4,
                }}
              >
                👁
              </button>
            </div>
            {error ? (
              <div style={{ color: RED, fontSize: 13, fontWeight: 600, marginTop: 8, lineHeight: 1.4 }}>{error}</div>
            ) : null}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                marginTop: 22,
                padding: "16px 20px",
                borderRadius: 50,
                border: "none",
                background: ORANGE,
                color: "#FFFFFF",
                fontSize: 15,
                fontWeight: 800,
                cursor: loading ? "wait" : "pointer",
                fontFamily: "inherit",
                opacity: loading ? 0.85 : 1,
              }}
            >
              {loading ? "Connexion…" : "Se connecter"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} style={{ marginTop: 28 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", color: MUTED, marginBottom: 8 }}>PRÉNOM</label>
            <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} style={inputStyle(false)} />
            <label style={{ display: "block", fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", color: MUTED, marginBottom: 8 }}>NOM</label>
            <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} style={inputStyle(false)} />
            <label style={{ display: "block", fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", color: MUTED, marginBottom: 8 }}>EMAIL</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle(false)} />
            <label style={{ display: "block", fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", color: MUTED, marginBottom: 8 }}>VÉHICULE</label>
            <select
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              style={{ ...inputStyle(false), cursor: "pointer" }}
            >
              <option value="moto">Moto</option>
              <option value="voiture">Voiture</option>
            </select>
            <label style={{ display: "block", fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", color: MUTED, marginBottom: 8 }}>MOT DE PASSE</label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle(false)}
            />
            {error ? (
              <div style={{ color: RED, fontSize: 13, fontWeight: 600, marginTop: 8, lineHeight: 1.4 }}>{error}</div>
            ) : null}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                marginTop: 22,
                padding: "16px 20px",
                borderRadius: 50,
                border: "none",
                background: ORANGE,
                color: "#FFFFFF",
                fontSize: 15,
                fontWeight: 800,
                cursor: loading ? "wait" : "pointer",
                fontFamily: "inherit",
                opacity: loading ? 0.85 : 1,
              }}
            >
              {loading ? "Inscription…" : "Créer mon compte"}
            </button>
          </form>
        )}

        <div style={{ textAlign: "center", marginTop: 22 }}>
          <Link to="/" style={{ color: ORANGE, fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
            ← Retour à l’accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
