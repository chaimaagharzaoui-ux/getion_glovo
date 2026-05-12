import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../api/client.js";

const ORANGE = "#FF6B00";

export default function LoginEntreprise() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusEmail, setFocusEmail] = useState(false);
  const [focusPass, setFocusPass] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Email et mot de passe requis.");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/api/entreprise/login", {
        email: email.trim().toLowerCase(),
        password,
      });
      const body = res?.data;
      const token = body?.token;
      if (!token || !body?.entreprise?.id) {
        setError("Réponse serveur invalide (token manquant).");
        return;
      }
      localStorage.setItem("entreprise_token", token);
      localStorage.setItem("entreprise_id", String(body.entreprise.id));
      localStorage.setItem("entreprise_nom", body.entreprise.nom || "");
      requestAnimationFrame(() => {
        navigate("/entreprise-portal/dashboard", { replace: true });
      });
    } catch (err) {
      const d = err.response?.data;
      setError(d?.message || d?.error || err.message || "Identifiants invalides.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f4f0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Inter, system-ui, sans-serif",
        padding: 20,
      }}
    >
      <div style={{ color: ORANGE, fontWeight: 900, fontSize: 24, marginBottom: 18 }}>⚡ Swift</div>
      <div
        style={{
          width: "100%",
          maxWidth: 440,
          background: "#fff",
          borderRadius: 24,
          border: "1px solid #eee",
          padding: 36,
          boxSizing: "border-box",
          boxShadow: "0 12px 30px rgba(0,0,0,0.06)",
        }}
      >
        <h1 style={{ margin: 0, color: "#1a1a1a", fontSize: 24, fontWeight: 900 }}>Espace Entreprise 🏢</h1>
        <p style={{ margin: "8px 0 22px", color: "#888", fontSize: 13 }}>
          Connectez-vous pour gérer votre établissement
        </p>

        <form onSubmit={onSubmit}>
          <label style={{ display: "block", fontSize: 11, letterSpacing: "0.08em", fontWeight: 800, color: "#888" }}>
            EMAIL
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => setFocusEmail(true)}
            onBlur={() => setFocusEmail(false)}
            autoComplete="email"
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: 12,
              border: `1.5px solid ${focusEmail ? ORANGE : "#ddd"}`,
              outline: "none",
              marginTop: 8,
              marginBottom: 16,
              fontFamily: "inherit",
              boxSizing: "border-box",
              fontSize: 14,
            }}
          />

          <label style={{ display: "block", fontSize: 11, letterSpacing: "0.08em", fontWeight: 800, color: "#888" }}>
            MOT DE PASSE
          </label>
          <div style={{ position: "relative", marginTop: 8 }}>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocusPass(true)}
              onBlur={() => setFocusPass(false)}
              autoComplete="current-password"
              style={{
                width: "100%",
                padding: "12px 44px 12px 16px",
                borderRadius: 12,
                border: `1.5px solid ${focusPass ? ORANGE : "#ddd"}`,
                outline: "none",
                fontFamily: "inherit",
                boxSizing: "border-box",
                fontSize: 14,
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              style={{
                position: "absolute",
                right: 10,
                top: "50%",
                transform: "translateY(-50%)",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontSize: 16,
              }}
              aria-label="Afficher/masquer mot de passe"
            >
              👁
            </button>
          </div>

          {error ? <div style={{ color: "#EF4444", fontSize: 13, marginTop: 12 }}>{error}</div> : null}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              marginTop: 18,
              border: "none",
              borderRadius: 50,
              background: ORANGE,
              color: "#fff",
              padding: 14,
              fontSize: 15,
              fontWeight: 800,
              cursor: loading ? "wait" : "pointer",
              fontFamily: "inherit",
            }}
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 16 }}>
          <Link to="/" style={{ color: ORANGE, textDecoration: "none", fontWeight: 700, fontSize: 14 }}>
            Pas encore inscrit ? Rejoindre Swift →
          </Link>
        </div>
      </div>
    </div>
  );
}
