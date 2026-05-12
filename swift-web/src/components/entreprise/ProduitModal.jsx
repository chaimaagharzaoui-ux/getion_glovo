import { useState, useEffect } from "react";
import { api, mediaUrl } from "../../api/client.js";

const ORANGE = "#FF6B00";
const BORDER = "#eeeeee";
const TEXT = "#1a1a1a";
const MUTED = "#888";

const CATEGORIES = [
  "Menus",
  "Burgers",
  "Boissons",
  "Salades & wraps",
  "Desserts",
  "Pharmacie",
  "Épicerie",
  "Autre",
];

export default function ProduitModal({ open, produit, onClose, onSaved }) {
  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");
  const [prix, setPrix] = useState("");
  const [categorie, setCategorie] = useState("Autre");
  const [disponible, setDisponible] = useState(true);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!open) return;
    if (produit) {
      setNom(produit.nom || "");
      setDescription(produit.description || "");
      setPrix(String(produit.prix ?? ""));
      setCategorie(produit.categorie || "Autre");
      setDisponible(!!produit.disponible);
    } else {
      setNom("");
      setDescription("");
      setPrix("");
      setCategorie("Autre");
      setDisponible(true);
    }
    setFile(null);
    setErr("");
  }, [open, produit]);

  if (!open) return null;

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("nom", nom);
      fd.append("description", description);
      fd.append("prix", prix);
      fd.append("categorie", categorie);
      fd.append("disponible", disponible ? "true" : "false");
      if (file) fd.append("image", file);
      if (produit?.id) {
        await api.put(`/api/produits/${produit.id}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/api/produits", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      onSaved();
      onClose();
    } catch (e2) {
      setErr(e2.response?.data?.error || e2.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        zIndex: 200,
        display: "grid",
        placeItems: "center",
        padding: 16,
      }}
      onClick={onClose}
    >
      <form
        onSubmit={submit}
        style={{
          background: "#fff",
          borderRadius: 20,
          maxWidth: 480,
          width: "100%",
          padding: 24,
          border: `1px solid ${BORDER}`,
          maxHeight: "90vh",
          overflow: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900 }}>{produit ? "Modifier" : "Ajouter"} un produit</h2>
          <button type="button" onClick={onClose} style={{ border: "none", background: "#f3f3f3", borderRadius: 8, width: 36, height: 36, cursor: "pointer", fontFamily: "inherit" }}>
            ×
          </button>
        </div>
        <label style={{ display: "block", marginTop: 16, fontSize: 12, fontWeight: 700, color: MUTED }}>Nom</label>
        <input
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          required
          style={{ width: "100%", marginTop: 6, padding: 12, borderRadius: 10, border: `1px solid ${BORDER}`, fontFamily: "inherit", boxSizing: "border-box" }}
        />
        <label style={{ display: "block", marginTop: 12, fontSize: 12, fontWeight: 700, color: MUTED }}>Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          style={{ width: "100%", marginTop: 6, padding: 12, borderRadius: 10, border: `1px solid ${BORDER}`, fontFamily: "inherit", boxSizing: "border-box", resize: "vertical" }}
        />
        <label style={{ display: "block", marginTop: 12, fontSize: 12, fontWeight: 700, color: MUTED }}>Prix (MAD)</label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={prix}
          onChange={(e) => setPrix(e.target.value)}
          required
          style={{ width: "100%", marginTop: 6, padding: 12, borderRadius: 10, border: `1px solid ${BORDER}`, fontFamily: "inherit", boxSizing: "border-box" }}
        />
        <label style={{ display: "block", marginTop: 12, fontSize: 12, fontWeight: 700, color: MUTED }}>Catégorie</label>
        <select
          value={categorie}
          onChange={(e) => setCategorie(e.target.value)}
          style={{ width: "100%", marginTop: 6, padding: 12, borderRadius: 10, border: `1px solid ${BORDER}`, fontFamily: "inherit", background: "#fff" }}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <label style={{ display: "block", marginTop: 12, fontSize: 12, fontWeight: 700, color: MUTED }}>Image</label>
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} style={{ marginTop: 6, width: "100%" }} />
        {produit?.imageUrl ? (
          <img alt="" src={mediaUrl(produit.imageUrl)} style={{ marginTop: 8, maxWidth: 120, borderRadius: 10, border: `1px solid ${BORDER}` }} />
        ) : null}
        <label style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 16, fontWeight: 700, fontSize: 14 }}>
          <input type="checkbox" checked={disponible} onChange={(e) => setDisponible(e.target.checked)} />
          Disponible
        </label>
        {err ? <div style={{ color: "#EF4444", marginTop: 12, fontSize: 13 }}>{err}</div> : null}
        <button
          type="submit"
          disabled={saving}
          style={{
            marginTop: 20,
            width: "100%",
            padding: 14,
            borderRadius: 50,
            border: "none",
            background: ORANGE,
            color: "#fff",
            fontWeight: 800,
            fontSize: 15,
            cursor: saving ? "wait" : "pointer",
            fontFamily: "inherit",
          }}
        >
          {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
      </form>
    </div>
  );
}
