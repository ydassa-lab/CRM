import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Target, DollarSign, Percent, Calendar, FileText, User } from "lucide-react";
import api from "../services/api";

const STAGES = ["Découverte", "Proposition", "Négociation", "Gagné", "Perdu"];

export default function EditOpportunityModal({ opportunity, onClose, onSave }) {
  const [form, setForm] = useState({ ...opportunity });
  const [prospects, setProspects] = useState([]);

  useEffect(() => {
    const fetchProspects = async () => {
      try {
        const res = await api.get("/prospect", { params: { limit: 1000 } });
        setProspects(res.data.data || []);
      } catch (err) {
        console.error("Erreur chargement prospects:", err);
      }
    };
    fetchProspects();
  }, []);

  const change = e => setForm({...form, [e.target.name]: e.target.value});
  const submit = e => { 
    e.preventDefault(); 
    const payload = {
      ...form,
      prospect: form.prospect || undefined
    };
    onSave(opportunity._id, payload); 
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

  const stageColors = {
    "Découverte": "bg-blue-100 text-blue-800",
    "Proposition": "bg-purple-100 text-purple-800",
    "Négociation": "bg-orange-100 text-orange-800",
    "Gagné": "bg-green-100 text-green-800",
    "Perdu": "bg-red-100 text-red-800"
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
          className="bg-white/95 backdrop-blur-lg rounded-xl shadow-xl border border-white/20 w-full max-w-md max-h-[85vh] flex flex-col"
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
              <Target className="w-5 h-5 text-white" />
              <h2 className="text-lg font-bold text-white">Modifier Opportunité</h2>
            </div>
          </div>

          {/* Contenu scrollable */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* Titre et Prospect */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                <Target className="w-4 h-4 text-blue-600" />
                Informations
              </h3>
              <div className="space-y-2">
                <input 
                  name="title" 
                  value={form.title || ""} 
                  onChange={change}
                  placeholder="Titre de l'opportunité"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  required
                />
                <select 
                  name="prospect" 
                  value={form.prospect || ""} 
                  onChange={change}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm appearance-none"
                >
                  <option value="">Aucun prospect</option>
                  {prospects.map(prospect => (
                    <option key={prospect._id} value={prospect._id}>
                      {prospect.prenom} {prospect.nom} {prospect.email ? `(${prospect.email})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Montant et Devise */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                <DollarSign className="w-4 h-4 text-green-600" />
                Valeur
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <input 
                  name="amount" 
                  value={form.amount || 0} 
                  onChange={change}
                  placeholder="Montant"
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <input 
                  name="currency" 
                  value={form.currency || "USD"} 
                  onChange={change}
                  placeholder="Devise"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            {/* Probabilité et Étape */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                <Percent className="w-4 h-4 text-purple-600" />
                Progression
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <input 
                  name="probability" 
                  value={form.probability || 0} 
                  onChange={change}
                  placeholder="Probabilité %"
                  type="number"
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <select 
                  name="stage" 
                  value={form.stage || "Découverte"} 
                  onChange={change}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm appearance-none"
                >
                  {STAGES.map(stage => (
                    <option key={stage} value={stage}>{stage}</option>
                  ))}
                </select>
              </div>
              
              {/* Indicateur d'étape actuelle */}
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-gray-600">Étape :</span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${stageColors[form.stage] || "bg-gray-100 text-gray-800"}`}>
                  {form.stage}
                </span>
              </div>
            </div>

            {/* Date de clôture */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                <Calendar className="w-4 h-4 text-orange-600" />
                Date prévue
              </h3>
              <input 
                name="expectedCloseDate" 
                value={form.expectedCloseDate ? form.expectedCloseDate.split("T")[0] : ""} 
                onChange={change}
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                <FileText className="w-4 h-4 text-gray-600" />
                Notes
              </h3>
              <textarea 
                name="notes" 
                value={form.notes || ""} 
                onChange={change}
                placeholder="Notes supplémentaires..."
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
              Enregistrer
            </button>
          </div>
        </motion.form>
      </motion.div>
    </AnimatePresence>
  );
}