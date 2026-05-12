import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home.jsx";
import LoginLivreur from "./pages/livreur/LoginLivreur.jsx";
import DashboardLivreur from "./pages/livreur/DashboardLivreur.jsx";
import TrackingLivreur from "./pages/livreur/TrackingLivreur.jsx";
import LoginEntreprise from "./pages/entreprise/LoginEntreprise.jsx";
import EntrepriseInterface from "./pages/EntrepriseInterface.jsx";
import EntrepriseLayout from "./layouts/EntrepriseLayout.jsx";
import DashboardEntreprise from "./pages/entreprise/DashboardEntreprise.jsx";
import EntrepriseCommandes from "./pages/entreprise/Commandes.jsx";
import EntrepriseCatalogue from "./pages/entreprise/Catalogue.jsx";
import EntrepriseStatistiques from "./pages/entreprise/Statistiques.jsx";
import EntrepriseFinances from "./pages/entreprise/Finances.jsx";
import EntrepriseParametres from "./pages/entreprise/Parametres.jsx";
import EntrepriseSupport from "./pages/entreprise/Support.jsx";

const LIVREUR_TOKEN_KEY = "livreur_token";
const ENTREPRISE_TOKEN_KEY = "entreprise_token";

function LivreurProtected({ children }) {
  const token = typeof window !== "undefined" ? localStorage.getItem(LIVREUR_TOKEN_KEY) : null;
  if (!token) return <Navigate to="/livreur/login" replace />;
  return children;
}

function EntrepriseProtected({ children }) {
  const token = typeof window !== "undefined" ? localStorage.getItem(ENTREPRISE_TOKEN_KEY) : null;
  if (!token) return <Navigate to="/entreprise/login" replace />;
  return children;
}

export default function App() {
  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif", minHeight: "100vh" }}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/livreur/login" element={<LoginLivreur />} />
        <Route
          path="/livreur/dashboard"
          element={
            <LivreurProtected>
              <DashboardLivreur />
            </LivreurProtected>
          }
        />
        <Route
          path="/livreur/tracking/:id"
          element={
            <LivreurProtected>
              <TrackingLivreur />
            </LivreurProtected>
          }
        />
        <Route path="/entreprise/login" element={<LoginEntreprise />} />
        <Route path="/entreprise" element={<EntrepriseInterface />} />
        <Route
          path="/entreprise-portal/dashboard"
          element={
            <EntrepriseProtected>
              <DashboardEntreprise />
            </EntrepriseProtected>
          }
        />
        <Route
          path="/entreprise-portal"
          element={
            <EntrepriseProtected>
              <EntrepriseLayout />
            </EntrepriseProtected>
          }
        >
          <Route index element={<Navigate to="/entreprise-portal/dashboard" replace />} />
          <Route path="commandes" element={<EntrepriseCommandes />} />
          <Route path="catalogue" element={<EntrepriseCatalogue />} />
          <Route path="statistiques" element={<EntrepriseStatistiques />} />
          <Route path="finances" element={<EntrepriseFinances />} />
          <Route path="parametres" element={<EntrepriseParametres />} />
          <Route path="support" element={<EntrepriseSupport />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
