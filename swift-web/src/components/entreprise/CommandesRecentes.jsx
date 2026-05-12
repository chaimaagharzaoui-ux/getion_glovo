function badgeStyle(statut) {
  switch (statut) {
    case "livree":
    case "livre":
      return { bg: "#e8f5e9", color: "#2e7d32", label: "Livré" };
    case "enLivraison":
    case "en_livraison":
      return { bg: "#e3f2fd", color: "#1565c0", label: "En livraison" };
    case "enPreparation":
    case "en_preparation":
    case "pret":
      return { bg: "#fff3e0", color: "#e65100", label: "En préparation" };
    case "annulee":
    case "annule":
      return { bg: "#fce4ec", color: "#880e4f", label: "Annulé" };
    case "enAttente":
    case "en_attente":
    default:
      return { bg: "#f3e5f5", color: "#6a1b9a", label: "En attente" };
  }
}

export default function CommandesRecentes({ loading, commandes }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 18,
        border: "1px solid #eee",
        padding: 24,
        boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
      }}
    >
      <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#1a1a1a" }}>Commandes récentes</h3>
      <div style={{ marginTop: 12, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: "left", color: "#888" }}>
              <th style={{ padding: "10px 8px", borderBottom: "1px solid #eee" }}>Numéro</th>
              <th style={{ padding: "10px 8px", borderBottom: "1px solid #eee" }}>Nom client</th>
              <th style={{ padding: "10px 8px", borderBottom: "1px solid #eee" }}>Montant</th>
              <th style={{ padding: "10px 8px", borderBottom: "1px solid #eee" }}>Statut</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? [1, 2, 3, 4].map((i) => (
                  <tr key={i}>
                    <td style={{ padding: "12px 8px", borderBottom: "1px solid #f3f3f3" }}>
                      <div style={{ height: 12, width: 80, borderRadius: 8, background: "#f0f0f0", animation: "pulse 1.1s infinite" }} />
                    </td>
                    <td style={{ padding: "12px 8px", borderBottom: "1px solid #f3f3f3" }}>
                      <div style={{ height: 12, width: 120, borderRadius: 8, background: "#f0f0f0", animation: "pulse 1.1s infinite" }} />
                    </td>
                    <td style={{ padding: "12px 8px", borderBottom: "1px solid #f3f3f3" }}>
                      <div style={{ height: 12, width: 70, borderRadius: 8, background: "#f0f0f0", animation: "pulse 1.1s infinite" }} />
                    </td>
                    <td style={{ padding: "12px 8px", borderBottom: "1px solid #f3f3f3" }}>
                      <div style={{ height: 20, width: 86, borderRadius: 10, background: "#f0f0f0", animation: "pulse 1.1s infinite" }} />
                    </td>
                  </tr>
                ))
              : (commandes || []).map((c) => {
                  const b = badgeStyle(c.statut);
                  return (
                    <tr key={c.id || c._id}>
                      <td style={{ padding: "12px 8px", borderBottom: "1px solid #f3f3f3", color: "#FF6B00", fontWeight: 800 }}>
                        {c.numeroSW || c.numero || "SW-—"}
                      </td>
                      <td style={{ padding: "12px 8px", borderBottom: "1px solid #f3f3f3", color: "#1a1a1a" }}>
                        {c.client?.nom
                          ? `${c.client.prenom ? `${c.client.prenom} ` : ""}${c.client.nom}`
                          : c.clientNom || "—"}
                      </td>
                      <td style={{ padding: "12px 8px", borderBottom: "1px solid #f3f3f3" }}>
                        {Number(c.montantTotal ?? c.montant ?? 0).toLocaleString("fr-FR")} MAD
                      </td>
                      <td style={{ padding: "12px 8px", borderBottom: "1px solid #f3f3f3" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "4px 8px",
                            borderRadius: 8,
                            fontSize: 11,
                            fontWeight: 700,
                            background: b.bg,
                            color: b.color,
                          }}
                        >
                          {b.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
