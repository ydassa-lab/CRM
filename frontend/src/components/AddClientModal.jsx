// src/components/AddClientModal.jsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  Building, 
  MapPin, 
  FileText, 
  Check, 
  UserPlus,
  Lock,
  Globe,
  Briefcase
} from "lucide-react";

export default function AddClientModal({ onClose, onSaveClient }) {
  const [form, setForm] = useState({
    prenom: "",
    nom: "",
    email: "",
    telephone: "",
    entreprise: "",
    adresse: "",
    typeClient: "particulier",
    notes: "",
    isActive: true
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const change = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ 
      ...prev, 
      [name]: type === "checkbox" ? checked : value 
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.prenom.trim()) {
      newErrors.prenom = "Le prénom est requis";
    }
    
    if (!form.nom.trim()) {
      newErrors.nom = "Le nom est requis";
    }
    
    if (!form.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Format d'email invalide";
    }
    
    if (form.telephone && !/^[0-9+\s-()]{8,}$/.test(form.telephone)) {
      newErrors.telephone = "Format de téléphone invalide";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onSaveClient(form);
      // La fermeture se fera automatiquement après le succès
    } catch (error) {
      console.error("Erreur lors de l'ajout:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-gradient-to-br from-white to-gray-50 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 p-6">
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
            >
              <X size={20} />
            </motion.button>
            
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-white/20">
                <UserPlus className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Nouveau Client</h3>
                <p className="text-sm text-blue-100">Remplissez les informations du client</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={submit} className="p-6 max-h-[70vh] overflow-y-auto">
            <div className="space-y-4">
              {/* Nom et Prénom */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <User className="inline w-4 h-4 mr-1 text-blue-600" />
                    Prénom *
                  </label>
                  <input
                    name="prenom"
                    value={form.prenom}
                    onChange={change}
                    placeholder="Jean"
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.prenom ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.prenom && (
                    <p className="mt-1 text-sm text-red-600">{errors.prenom}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <User className="inline w-4 h-4 mr-1 text-blue-600" />
                    Nom *
                  </label>
                  <input
                    name="nom"
                    value={form.nom}
                    onChange={change}
                    placeholder="Dupont"
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.nom ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.nom && (
                    <p className="mt-1 text-sm text-red-600">{errors.nom}</p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Mail className="inline w-4 h-4 mr-1 text-blue-600" />
                  Email *
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={change}
                  placeholder="client@entreprise.mg"
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Téléphone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Phone className="inline w-4 h-4 mr-1 text-blue-600" />
                  Téléphone
                </label>
                <input
                  name="telephone"
                  value={form.telephone}
                  onChange={change}
                  placeholder="+261 34 12 345 67"
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.telephone ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.telephone && (
                  <p className="mt-1 text-sm text-red-600">{errors.telephone}</p>
                )}
              </div>

              {/* Type de client */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Globe className="inline w-4 h-4 mr-1 text-blue-600" />
                  Type de client
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setForm(prev => ({ ...prev, typeClient: "particulier" }))}
                    className={`px-4 py-3 rounded-lg border transition-all duration-200 ${
                      form.typeClient === "particulier"
                        ? "bg-blue-50 text-blue-700 border-blue-300 shadow-sm"
                        : "bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    <User className="w-4 h-4 inline mr-2" />
                    Particulier
                  </motion.button>
                  
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setForm(prev => ({ ...prev, typeClient: "entreprise" }))}
                    className={`px-4 py-3 rounded-lg border transition-all duration-200 ${
                      form.typeClient === "entreprise"
                        ? "bg-purple-50 text-purple-700 border-purple-300 shadow-sm"
                        : "bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    <Building className="w-4 h-4 inline mr-2" />
                    Entreprise
                  </motion.button>
                </div>
              </div>

              {/* Entreprise (si type entreprise) */}
              {form.typeClient === "entreprise" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Briefcase className="inline w-4 h-4 mr-1 text-blue-600" />
                    Entreprise
                  </label>
                  <input
                    name="entreprise"
                    value={form.entreprise}
                    onChange={change}
                    placeholder="Nom de l'entreprise"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </motion.div>
              )}

              {/* Adresse */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <MapPin className="inline w-4 h-4 mr-1 text-blue-600" />
                  Adresse
                </label>
                <input
                  name="adresse"
                  value={form.adresse}
                  onChange={change}
                  placeholder="Adresse complète"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FileText className="inline w-4 h-4 mr-1 text-blue-600" />
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={change}
                  placeholder="Informations supplémentaires..."
                  rows="3"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                />
              </div>

              {/* Statut du compte */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${form.isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-600'}`}>
                      {form.isActive ? <Check size={16} /> : <Lock size={16} />}
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Compte actif</span>
                      <p className="text-sm text-gray-500">
                        {form.isActive 
                          ? "Le client pourra se connecter immédiatement" 
                          : "Le compte sera désactivé, nécessitera une validation manuelle"}
                      </p>
                    </div>
                  </div>
                  <div className="relative">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={form.isActive}
                      onChange={change}
                      className="sr-only"
                      id="isActiveToggle"
                    />
                    <label 
                      htmlFor="isActiveToggle"
                      className={`block w-14 h-7 rounded-full cursor-pointer transition-all duration-300 ${
                        form.isActive ? 'bg-emerald-500' : 'bg-gray-300'
                      }`}
                    >
                      <span className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-all duration-300 ${
                        form.isActive ? 'transform translate-x-7' : ''
                      }`} />
                    </label>
                  </div>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end gap-3">
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="px-5 py-2.5 text-gray-700 hover:text-gray-900 font-medium transition-colors rounded-lg"
                disabled={isSubmitting}
              >
                Annuler
              </motion.button>
              
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                    Création...
                  </>
                ) : (
                  <>
                    <UserPlus size={18} />
                    Créer le client
                  </>
                )}
              </motion.button>
            </div>
          </form>

          {/* Footer info */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              * Champs obligatoires • Les informations seront cryptées pour la sécurité
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}