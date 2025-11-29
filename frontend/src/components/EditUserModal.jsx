import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, User, Mail, Phone, MapPin, Building, Shield, UserCheck } from "lucide-react";

const ROLES = ["admin", "commercial", "marketing", "support", "manager", "client"];

export default function EditUserModal({ user, onClose, onSave }) {
  const [form, setForm] = useState({
    prenom: user.prenom || "",
    nom: user.nom || "",
    email: user.email || "",
    telephone: user.telephone || "",
    adresse: user.adresse || "",
    ville: user.ville || "",
    pays: user.pays || "",
    typeClient: user.typeClient || "particulier",
    entreprise: user.entreprise || "",
    role: user.role || "client",
    isActive: !!user.isActive
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const submit = (e) => {
    e.preventDefault();
    const payload = { ...form };
    onSave(user._id, payload);
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.3 }
    }
  };

  const modalVariants = {
    hidden: { 
      opacity: 0,
      scale: 0.8,
      rotateY: -10,
      y: 50
    },
    visible: { 
      opacity: 1,
      scale: 1,
      rotateY: 0,
      y: 0,
      transition: { 
        type: "spring",
        stiffness: 300,
        damping: 25,
        duration: 0.5
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      rotateY: 10,
      y: -50,
      transition: { duration: 0.3 }
    }
  };

  const inputVariants = {
    focus: {
      scale: 1.02,
      y: -2,
      boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.2)",
      transition: { type: "spring", stiffness: 400 }
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4"
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
      >
        <motion.form
          onSubmit={submit}
          className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 relative">
            <div className="absolute top-4 right-4">
              <motion.button
                type="button"
                onClick={onClose}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-2xl">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Modifier l'utilisateur</h2>
                <p className="text-white/80 text-sm">Mettez à jour les informations de {user.prenom} {user.nom}</p>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6 space-y-6">
            {/* Informations personnelles */}
            <motion.div 
              className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-xl p-6 border border-gray-200/50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Informations personnelles
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div variants={inputVariants} whileFocus="focus">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                  <input 
                    name="prenom" 
                    value={form.prenom} 
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all"
                    placeholder="Prénom"
                  />
                </motion.div>

                <motion.div variants={inputVariants} whileFocus="focus">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                  <input 
                    name="nom" 
                    value={form.nom} 
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all"
                    placeholder="Nom"
                  />
                </motion.div>
              </div>
            </motion.div>

            {/* Contact */}
            <motion.div 
              className="bg-gradient-to-br from-gray-50 to-green-50/30 rounded-xl p-6 border border-gray-200/50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-green-600" />
                Informations de contact
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div variants={inputVariants} whileFocus="focus">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </label>
                  <input 
                    name="email" 
                    value={form.email} 
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all"
                    placeholder="email@exemple.com"
                  />
                </motion.div>

                <motion.div variants={inputVariants} whileFocus="focus">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Téléphone
                  </label>
                  <input 
                    name="telephone" 
                    value={form.telephone} 
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all"
                    placeholder="+33 1 23 45 67 89"
                  />
                </motion.div>
              </div>
            </motion.div>

            {/* Rôle et Statut */}
            <motion.div 
              className="bg-gradient-to-br from-gray-50 to-purple-50/30 rounded-xl p-6 border border-gray-200/50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-600" />
                Rôle et permissions
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div variants={inputVariants} whileFocus="focus">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rôle</label>
                  <select 
                    name="role" 
                    value={form.role} 
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm appearance-none cursor-pointer"
                  >
                    {ROLES.map(r => (
                      <option key={r} value={r} className="capitalize">{r}</option>
                    ))}
                  </select>
                </motion.div>

                <motion.div 
                  className="flex items-center justify-between p-4 bg-white/50 rounded-xl border border-gray-200"
                  whileHover={{ scale: 1.02 }}
                >
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        name="isActive" 
                        checked={form.isActive} 
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className={`w-12 h-6 rounded-full transition-colors ${
                        form.isActive ? 'bg-green-500' : 'bg-gray-300'
                      }`}>
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          form.isActive ? 'transform translate-x-7' : 'transform translate-x-1'
                        }`} />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-gray-600" />
                      <span className="font-medium text-gray-700">Compte actif</span>
                    </div>
                  </label>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    form.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {form.isActive ? 'Actif' : 'Inactif'}
                  </span>
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Actions */}
          <motion.div 
            className="flex gap-3 p-6 border-t border-gray-200/50 bg-gray-50/50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <motion.button
              type="button"
              onClick={onClose}
              whileHover={{ scale: 1.05, x: -2 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 font-medium transition-colors"
            >
              <X className="w-4 h-4" />
              Annuler
            </motion.button>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.05, x: 2 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 font-medium shadow-lg shadow-blue-500/25 transition-all ml-auto"
            >
              <Save className="w-4 h-4" />
              Enregistrer les modifications
            </motion.button>
          </motion.div>

          {/* Effet de brillance */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none rounded-2xl"></div>
        </motion.form>
      </motion.div>
    </AnimatePresence>
  );
}