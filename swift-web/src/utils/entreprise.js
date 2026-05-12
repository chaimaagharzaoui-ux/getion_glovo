const BLUE = "#3B82F6";
const ORANGE_DARK = "#c2410c";
const GRAY = "#9ca3af";

export function statutLabel(s) {
  const m = {
    en_attente: "En attente",
    en_preparation: "En préparation",
    pret: "Prêt",
    en_livraison: "En livraison",
    livre: "Livré",
    annule: "Annulé",
  };
  return m[s] || s;
}

export function statutBadgeStyle(s) {
  switch (s) {
    case "livre":
      return { bg: "rgba(59,130,246,0.15)", color: BLUE };
    case "en_livraison":
      return { bg: "rgba(30,64,175,0.2)", color: "#1e40af" };
    case "en_preparation":
    case "pret":
      return { bg: "rgba(255,107,0,0.15)", color: ORANGE_DARK };
    case "annule":
      return { bg: "rgba(156,163,175,0.2)", color: GRAY };
    default:
      return { bg: "rgba(255,107,0,0.12)", color: "#FF6B00" };
  }
}

export function formatMad(n) {
  if (n == null || Number.isNaN(n)) return "—";
  return `${Number(n).toLocaleString("fr-FR", { maximumFractionDigits: 0 })} MAD`;
}

export function formatEurDisplay(mad) {
  if (mad == null) return "—";
  const eur = Number(mad) / 10.5;
  return `${eur.toFixed(2)} €`;
}
