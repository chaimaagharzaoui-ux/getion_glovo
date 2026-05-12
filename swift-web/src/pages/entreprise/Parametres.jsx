import { useEffect, useState } from "react";
import { api, mediaUrl } from "../../api/client.js";

const BG = "#f5f4f0";
const TEXT = "#1a1a1a";
const MUTED = "#888";
const BORDER = "#eeeeee";
const ORANGE = "#FF6B00";

const CATS = ["restaurant", "pharmacie", "épicerie", "café", "mode", "autre"];

export default function Parametres() {
  const eid = localStorage.getItem("entreprise_id");
  const [form, setForm] = useState({
    nom: "",
    description: "",
    adresse: "",
    telephone: "",
    email: "",
    horairesDebut: "09:00",
    horairesFin: "22:00",
    categorie: "restaurant",
    rayonKm: 5,
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [pwd, setPwd] = useState({ ancien: "", nouveau: "", confirm: "" });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/api/entreprises/me");
        setForm({
          nom: data.nom || "",
          description: data.description || "",
          adresse: data.adresse || "",
          telephone: data.telephone || "",
          email: data.email || "",
          horairesDebut: data.horairesDebut || "09:00",
          horairesFin: data.horairesFin || "22:00",
          categorie: data.categorie || "restaurant",
          rayonKm: data.rayonKm ?? 5,
        });
        if (data.logoUrl) setLogoPreview(mediaUrl(data.logoUrl));
      } catch (e) {
        setErr(e.response?.data?.error || e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const saveProfile = async (e) => {
    e.preventDefault();
    setMsg("");
    setErr("");
    try {
      if (logoFile) {
        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => fd.append(k, v));
        fd.append("logo", logoFile);
        await api.put(`/api/entreprises/${eid}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.put(`/api/entreprises/${eid}`, form);
      }
      localStorage.setItem("entreprise_nom", form.nom);
      setMsg("Modifications enregistrées.");
      setLogoFile(null);
    } catch (e2) {
      setErr(e2.response?.data?.error || e2.message);
    }
  };

  const savePwd = async (e) => {
    e.preventDefault();
    setMsg("");
    setErr("");
    if (pwd.nouveau !== pwd.confirm) {
      setErr("Les mots de passe ne correspondent pas.");
      return;
    }
    try {
      await api.post(`/api/entreprises/${eid}/password`, {
        ancien: pwd.ancien,
        nouveau: pwd.nouveau,
      });
      setPwd({ ancien: "", nouveau: "", confirm: "" });
      setMsg("Mot de passe mis à jour.");
    } catch (e2) {
      setErr(e2.response?.data?.error || e2.message);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 40, background: BG }}>
        <div style={{ height: 200, background: "#e8e8e8", borderRadius: 16, animation: "skeleton-pulse 1.2s infinite" }} />
      </div>
    );
  }

  return (
    <div style={{ padding: "24px 28px 40px", background: BG, minHeight: "100%" }}>
      <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: TEXT }}>Paramètres</h1>
      {msg ? <div style={{ marginTop: 12, color: "#22C55E", fontWeight: 700 }}>{msg}</div> : null}
      {err ? <div style={{ marginTop: 12, color: "#EF4444", fontWeight: 700 }}>{err}</div> : null}

      <form
        onSubmit={saveProfile}
        style={{
          marginTop: 24,
          background: "#fff",
          borderRadius: 16,
          padding: 24,
          border: `1px solid ${BORDER}`,
          maxWidth: 640,
        }}
      >
        <h2 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 900 }}>Établissement</h2>
        {[
          ["nom", "Nom de l'entreprise"],
          ["description", "Description / bio"],
          ["adresse", "Adresse complète"],
          ["telephone", "Téléphone"],
          ["email", "Email"],
        ].map(([key, label]) => (
          <div key={key} style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: MUTED }}>{label}</label>
            {key === "description" ? (
              <textarea
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                rows={3}
                style={{ width: "100%", marginTop: 6, padding: 12, borderRadius: 10, border: `1px solid ${BORDER}`, fontFamily: "inherit", boxSizing: "border-box" }}
              />
            ) : (
              <input
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                style={{ width: "100%", marginTop: 6, padding: 12, borderRadius: 10, border: `1px solid ${BORDER}`, fontFamily: "inherit", boxSizing: "border-box" }}
              />
            )}
          </div>
        ))}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: MUTED }}>Ouverture</label>
            <input
              type="time"
              value={form.horairesDebut}
              onChange={(e) => setForm({ ...form, horairesDebut: e.target.value })}
              style={{ width: "100%", marginTop: 6, padding: 12, borderRadius: 10, border: `1px solid ${BORDER}`, fontFamily: "inherit" }}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: MUTED }}>Fermeture</label>
            <input
              type="time"
              value={form.horairesFin}
              onChange={(e) => setForm({ ...form, horairesFin: e.target.value })}
              style={{ width: "100%", marginTop: 6, padding: 12, borderRadius: 10, border: `1px solid ${BORDER}`, fontFamily: "inherit" }}
            />
          </div>
        </div>
        <div style={{ marginTop: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: MUTED }}>Catégorie</label>
          <select
            value={form.categorie}
            onChange={(e) => setForm({ ...form, categorie: e.target.value })}
            style={{ width: "100%", marginTop: 6, padding: 12, borderRadius: 10, border: `1px solid ${BORDER}`, fontFamily: "inherit", background: "#fff" }}
          >
            {CATS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div style={{ marginTop: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: MUTED }}>Rayon livraison (km)</label>
          <input
            type="number"
            min={1}
            value={form.rayonKm}
            onChange={(e) => setForm({ ...form, rayonKm: Number(e.target.value) })}
            style={{ width: "100%", marginTop: 6, padding: 12, borderRadius: 10, border: `1px solid ${BORDER}`, fontFamily: "inherit" }}
          />
        </div>
        <div style={{ marginTop: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: MUTED }}>Logo</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const f = e.target.files?.[0];
              setLogoFile(f || null);
              if (f) setLogoPreview(URL.createObjectURL(f));
            }}
            style={{ marginTop: 6 }}
          />
          {logoPreview ? <img alt="" src={logoPreview} style={{ marginTop: 10, maxHeight: 80, borderRadius: 10 }} /> : null}
        </div>
        <button
          type="submit"
          style={{
            marginTop: 20,
            padding: "14px 28px",
            borderRadius: 50,
            border: "none",
            background: ORANGE,
            color: "#fff",
            fontWeight: 900,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Enregistrer les modifications
        </button>
      </form>

      <form
        onSubmit={savePwd}
        style={{
          marginTop: 28,
          background: "#fff",
          borderRadius: 16,
          padding: 24,
          border: `1px solid ${BORDER}`,
          maxWidth: 640,
        }}
      >
        <h2 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 900 }}>Sécurité</h2>
        {[
          ["ancien", "Ancien mot de passe"],
          ["nouveau", "Nouveau mot de passe"],
          ["confirm", "Confirmer"],
        ].map(([key, label]) => (
          <div key={key} style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: MUTED }}>{label}</label>
            <input
              type="password"
              value={pwd[key]}
              onChange={(e) => setPwd({ ...pwd, [key]: e.target.value })}
              style={{ width: "100%", marginTop: 6, padding: 12, borderRadius: 10, border: `1px solid ${BORDER}`, fontFamily: "inherit", boxSizing: "border-box" }}
            />
          </div>
        ))}
        <button
          type="submit"
          style={{
            marginTop: 8,
            padding: "12px 24px",
            borderRadius: 50,
            border: `2px solid ${TEXT}`,
            background: "#fff",
            fontWeight: 800,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Changer le mot de passe
        </button>
      </form>
    </div>
  );
}
