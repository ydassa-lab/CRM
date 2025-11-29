import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, User, Mail, Phone, TrendingUp, FileText } from "lucide-react";

export default function EditProspectModal({ prospect, onClose, onSave }) {
  const [form, setForm] = useState({ ...prospect });

  const change = (e) => setForm({...form, [e.target.name]: e.target.value});
  const submit = (e) => { e.preventDefault(); onSave(prospect._id, form); };

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
      y: 50
    },
    visible: { 
      opacity: 1,
      scale: 1,
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
      y: -50,
      transition: { duration: 0.3 }
    }
  };

  const statutColors = {
    "Nouveau": "bg-blue-100 text-blue-800",
    "Contacté": "bg-purple-100 text-purple-800",
    "Relance": "bg-orange-100 text-orange-800",
    "Converti": "bg-green-100 text-green-800"
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
          className="bg-white/95 backdrop-blur-lg rounded-xl shadow-xl border border-white/20 w-full max-w-md max-h-[80vh] flex flex-col"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Header compact */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 relative flex-shrink-0">
            <div className="absolute top-2 right-2">
              <motion.button
                type="button"
                onClick={onClose}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-1 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>
            
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-white" />
              <h2 className="text-lg font-bold text-white">Modifier Prospect</h2>
            </div>
          </div>

          {/* Contenu scrollable */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Informations personnelles */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                Informations personnelles
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Prénom *</label>
                  <input 
                    name="prenom" 
                    value={form.prenom} 
                    onChange={change}
                    placeholder="Prénom"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Nom *</label>
                  <input 
                    name="nom" 
                    value={form.nom} 
                    onChange={change}
                    placeholder="Nom"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Mail className="w-4 h-4 text-green-600" />
                Informations de contact
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    Email
                  </label>
                  <input 
                    name="email" 
                    value={form.email} 
                    onChange={change}
                    placeholder="email@exemple.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    Téléphone
                  </label>
                  <input 
                    name="telephone" 
                    value={form.telephone} 
                    onChange={change}
                    placeholder="+33 1 23 45 67 89"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Statut */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                Statut du prospect
              </h3>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Statut actuel</label>
                <select 
                  name="statut" 
                  value={form.statut} 
                  onChange={change}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm appearance-none"
                >
                  <option value="Nouveau">Nouveau</option>
                  <option value="Contacté">Contacté</option>
                  <option value="Relance">Relance</option>
                  <option value="Converti">Converti</option>
                </select>
              </div>
              
              {/* Indicateur de statut visuel */}
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                <span className="text-xs text-gray-600">Statut :</span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statutColors[form.statut] || "bg-gray-100 text-gray-800"}`}>
                  {form.statut}
                </span>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-orange-600" />
                Notes supplémentaires
              </h3>
              <div>
                <textarea 
                  name="notes" 
                  value={form.notes || ""} 
                  onChange={change}
                  placeholder="Notes, commentaires, informations complémentaires..."
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                />
              </div>
            </div>
          </div>

          {/* Actions fixes en bas */}
          <div className="flex gap-2 p-3 border-t border-gray-200 bg-white flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors"
            >
              Enregistrer
            </button>
          </div>
        </motion.form>
      </motion.div>
    </AnimatePresence>
  );
}