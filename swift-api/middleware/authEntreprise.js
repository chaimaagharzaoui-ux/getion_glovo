import jwt from "jsonwebtoken";

export function authEntreprise(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token manquant" });
  }
  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "dev-secret");
    const id = payload.id || payload.sub;
    if (payload.role !== "entreprise" || !id) {
      return res.status(403).json({ message: "Accès entreprise requis" });
    }
    req.entreprise = { id: String(id), role: payload.role };
    req.entrepriseId = String(id);
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token invalide", details: err.message });
  }
}
