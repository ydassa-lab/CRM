exports.errorHandler = (err, req, res, next) => {
  console.error("🔥 ERREUR SERVEUR :", err);
  const status = err.status || 500;
  res.status(status).json({ message: err.message || "Erreur serveur" });
};
