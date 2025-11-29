import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, User, Mail, Phone, Globe, FileText, UserPlus } from "lucide-react";

export default function AddProspectModal({ onClose, onSave }) {
  const [form, setForm] = useState({ 
    prenom: "", 
    nom: "", 
    email: "", 
    telephone: "", 
    source: "inconnu", 
    statut: "Nouveau",
    notes: "" 
  });

  const change = (e) => setForm({...form, [e.target.name]: e.target.value});
  const submit = (e) => { e.preventDefault(); onSave(form); };

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
          className="bg-white/95 backdrop-blur-lg rounded-xl shadow-xl border border-white/20 w-full max-w-md max-h-[85vh] flex flex-col" // Hauteur limitée à 85% de l'écran
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
              <UserPlus className="w-5 h-5 text-white" />
              <h2 className="text-lg font-bold text-white">Nouveau Prospect</h2>
            </div>
          </div>

          {/* Contenu scrollable */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* Informations personnelles - Version compacte */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                <User className="w-4 h-4 text-blue-600" />
                Informations
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <input 
                  name="prenom" 
                  value={form.prenom} 
                  onChange={change}
                  placeholder="Prénom"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  required
                />
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

            {/* Contact - Version compacte */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                <Mail className="w-4 h-4 text-green-600" />
                Contact
              </h3>
              <div className="space-y-2">
                <input 
                  name="email" 
                  value={form.email} 
                  onChange={change}
                  placeholder="Email"
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <input 
                  name="telephone" 
                  value={form.telephone} 
                  onChange={change}
                  placeholder="Téléphone"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            {/* Source et Statut - Version compacte */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                <Globe className="w-4 h-4 text-purple-600" />
                Suivi
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <input 
                  name="source" 
                  value={form.source} 
                  onChange={change}
                  placeholder="Source"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <select 
                  name="statut" 
                  value={form.statut} 
                  onChange={change}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm appearance-none"
                >
                  <option value="Nouveau">Nouveau</option>
                  <option value="Contacté">Contacté</option>
                  <option value="Relance">Relance</option>
                </select>
              </div>
            </div>

            {/* Notes - Version compacte */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                <FileText className="w-4 h-4 text-orange-600" />
                Notes
              </h3>
              <textarea 
                name="notes" 
                value={form.notes} 
                onChange={change}
                placeholder="Notes..."
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
              />
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
              Ajouter
            </button>
          </div>
        </motion.form>
      </motion.div>
    </AnimatePresence>
  );
}