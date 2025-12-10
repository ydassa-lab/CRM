const jwt = require("jsonwebtoken");
const User = require("../models/User");

// exports.authMiddleware = (roles = []) => (req, res, next) => {
//   try {
//     const header = req.headers.authorization;
//     if (!header) return res.status(401).json({ message: "Token manquant." });

//     const token = header.split(" ")[1];
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded;

//     if (roles.length && !roles.includes(decoded.role)) {
//       return res.status(403).json({ message: "Accès refusé." });
//     }

//     next();
//   } catch (err) {
//     return res.status(401).json({ message: "Token invalide ou expiré." });
//   }
// };


// exports.authMiddleware = (roles = []) => {
//   return async (req, res, next) => {
//     try {
//       const token = req.headers.authorization?.split(" ")[1];
//       if (!token) return res.status(401).json({ message: "Token manquant" });

//       // --- Décoder le token ---
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);

//       // --- Charger l'utilisateur depuis MongoDB ---
//       const user = await User.findById(decoded.id);
//       if (!user) return res.status(401).json({ message: "Utilisateur non trouvé" });

//       // Important : ici req.user = l'utilisateur complet
//       req.user = user;

//       // Vérification des rôles
//       if (roles.length && !roles.includes(user.role)) {
//         return res.status(403).json({ message: "Accès refusé" });
//       }

//       next();
//     } catch (err) {
//       res.status(401).json({ message: "Token invalide" });
//     }
//   };
// };



// Middleware d'authentification + contrôle role
// exports.authMiddleware = (roles = []) => {
//   return async (req, res, next) => {
//     try {
//       const token = req.headers.authorization?.split(" ")[1];
//       if (!token) return res.status(401).json({ message: "Token manquant" });

//       // Décoder token
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);

//       // Charger l'utilisateur depuis la BD
//       const user = await User.findById(decoded.id);
//       if (!user) return res.status(401).json({ message: "Utilisateur non trouvé" });

//       req.user = user; // utilisateur complet

//       // Vérification des rôles
//       if (roles.length > 0 && !roles.includes(user.role)) {
//         return res.status(403).json({ message: "Accès refusé" });
//       }

//       next();
//     } catch (err) {
//       res.status(401).json({ message: "Token invalide ou expiré" });
//     }
//   };
// };

exports.authMiddleware = (roles = []) => {
  return async (req, res, next) => {
    try {
      // 👉 Token accepté depuis :
      // - Header Authorization: Bearer xxx
      // - OU Query: ?token=xxx
      let token =
        req.headers.authorization?.split(" ")[1] ||
        req.query.token;

      if (!token) {
        return res.status(401).json({ message: "Token manquant" });
      }

      // Décoder token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Charger l'utilisateur depuis la BD
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ message: "Utilisateur non trouvé" });
      }

      req.user = user;

      // Vérification des rôles
      if (roles.length > 0 && !roles.includes(user.role)) {
        return res.status(403).json({ message: "Accès refusé" });
      }

      next();
    } catch (err) {
      console.error("AUTH ERROR:", err);
      res.status(401).json({ message: "Token invalide ou expiré" });
    }
  };
};

