import { useEffect, useState, useCallback } from "react";
import { api, mediaUrl } from "../../api/client.js";
import ProduitModal from "../../components/entreprise/ProduitModal.jsx";

const BG = "#f5f4f0";
const TEXT = "#1a1a1a";
const MUTED = "#888";
const BORDER = "#eeeeee";
const ORANGE = "#FF6B00";

export default function Catalogue() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [edit, setEdit] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/produits");
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const supprimer = async (p) => {
    if (!confirm(`Supprimer « ${p.nom} » ?`)) return;
    try {
      await api.delete(`/api/produits/${p.id}`);
      load();
    } catch (e) {
      alert(e.response?.data?.error || e.message);
    }
  };

  const toggleDispo = async (p) => {
    try {
      const fd = new FormData();
      fd.append("nom", p.nom);
      fd.append("description", p.description || "");
      fd.append("prix", String(p.prix));
      fd.append("categorie", p.categorie || "Autre");
      fd.append("disponible", p.disponible ? "false" : "true");
      await api.put(`/api/produits/${p.id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      load();
    } catch (e) {
      alert(e.response?.data?.error || e.message);
    }
  };

  return (
    <div style={{ padding: "24px 28px 40px", background: BG, minHeight: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: TEXT }}>Catalogue</h1>
        <button
          type="button"
          onClick={() => {
            setEdit(null);
            setModalOpen(true);
          }}
          style={{
            padding: "12px 22px",
            borderRadius: 50,
            border: "none",
            background: ORANGE,
            color: "#fff",
            fontWeight: 800,
            fontSize: 14,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          ➕ Ajouter un produit
        </button>
      </div>

      {loading ? (
        <div style={{ marginTop: 32, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ height: 280, background: "#e8e8e8", borderRadius: 16, animation: "skeleton-pulse 1.2s infinite" }} />
          ))}
        </div>
      ) : (
        <div
          style={{
            marginTop: 24,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 20,
          }}
        >
          {items.map((p) => (
            <div
              key={p.id}
              style={{
                background: "#fff",
                borderRadius: 16,
                border: `1px solid ${BORDER}`,
                overflow: "hidden",
                boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
              }}
            >
              <div
                style={{
                  height: 140,
                  background: "#f0f0f0",
                  display: "grid",
                  placeItems: "center",
                  overflow: "hidden",
                }}
              >
                {p.imageUrl ? (
                  <img alt="" src={mediaUrl(p.imageUrl)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <span style={{ fontSize: 40 }}>🍽️</span>
                )}
              </div>
              <div style={{ padding: 16 }}>
                <div style={{ fontWeight: 900, fontSize: 16, color: TEXT }}>{p.nom}</div>
                <div style={{ color: MUTED, fontSize: 13, marginTop: 4 }}>{p.categorie}</div>
                <div style={{ fontWeight: 800, color: ORANGE, marginTop: 8 }}>{p.prix} MAD</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700 }}>
                    <input type="checkbox" checked={p.disponible} onChange={() => toggleDispo(p)} />
                    Actif
                  </label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => {
                        setEdit(p);
                        setModalOpen(true);
                      }}
                      style={{
                        border: `1px solid ${BORDER}`,
                        background: "#fff",
                        borderRadius: 10,
                        padding: "8px 12px",
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      ✏️
                    </button>
                    <button
                      type="button"
                      onClick={() => supprimer(p)}
                      style={{
                        border: "none",
                        background: "rgba(239,68,68,0.12)",
                        color: "#EF4444",
                        borderRadius: 10,
                        padding: "8px 12px",
                        cursor: "pointer",
                        fontFamily: "inherit",
                        fontWeight: 800,
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ProduitModal
        open={modalOpen}
        produit={edit}
        onClose={() => {
          setModalOpen(false);
          setEdit(null);
        }}
        onSaved={load}
      />
    </div>
  );
}
