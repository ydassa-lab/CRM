import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Target, DollarSign, Percent, Calendar, FileText, User, TrendingUp } from "lucide-react";

const STAGES = ["Découverte", "Proposition", "Négociation", "Gagné", "Perdu"];

export default function AddOpportunityModal({ onClose, onSave, prospects }) {
  const [form, setForm] = useState({
    title: "", 
    prospect: "", 
    amount: 0, 
    currency: "USD", 
    probability: 0, 
    stage: "Découverte", 
    expectedCloseDate: "", 
    notes: ""
  });

  const change = e => setForm({...form, [e.target.name]: e.target.value});
  const submit = e => { 
    e.preventDefault(); 
    const payload = {
      ...form,
      prospect: form.prospect || undefined
    };
    onSave(payload); 
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
      boxShadow: "0 10px 25px -5px rgba(34, 197, 94, 0.2)",
      transition: { type: "spring", stiffness: 400 }
    }
  };

  const stageColors = {
    "Découverte": "from-blue-500 to-cyan-500",
    "Proposition": "from-purple-500 to-pink-500",
    "Négociation": "from-orange-500 to-red-500",
    "Gagné": "from-green-500 to-emerald-500",
    "Perdu": "from-gray-500 to-slate-500"
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
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 relative">
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
                <Target className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Nouvelle Opportunité</h2>
                <p className="text-white/80 text-sm">Créez une nouvelle opportunité commerciale</p>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6 space-y-6">
            {/* Informations de base */}
            <motion.div 
              className="bg-gradient-to-br from-gray-50 to-green-50/30 rounded-xl p-6 border border-gray-200/50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-green-600" />
                Informations de l'opportunité
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div variants={inputVariants} whileFocus="focus">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Titre de l'opportunité *</label>
                  <input 
                    name="title" 
                    value={form.title} 
                    onChange={change}
                    placeholder="Ex: Contrat entreprise XYZ"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all"
                    required
                  />
                </motion.div>

                <motion.div variants={inputVariants} whileFocus="focus">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Prospect associé
                  </label>
                  <select 
                    name="prospect" 
                    value={form.prospect} 
                    onChange={change}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/70 backdrop-blur-sm appearance-none cursor-pointer"
                  >
                    <option value="">Aucun prospect</option>
                    {prospects.map(prospect => (
                      <option key={prospect._id} value={prospect._id}>
                        {prospect.prenom} {prospect.nom} {prospect.email ? `(${prospect.email})` : ''}
                      </option>
                    ))}
                  </select>
                </motion.div>
              </div>
            </motion.div>

            {/* Montant et probabilité */}
            <motion.div 
              className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-xl p-6 border border-gray-200/50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-blue-600" />
                Valeur et probabilité
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div variants={inputVariants} whileFocus="focus">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Montant</label>
                  <input 
                    name="amount" 
                    value={form.amount} 
                    onChange={change}
                    type="number"
                    placeholder="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all"
                  />
                </motion.div>

                <motion.div variants={inputVariants} whileFocus="focus">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Devise</label>
                  <input 
                    name="currency" 
                    value={form.currency} 
                    onChange={change}
                    placeholder="USD"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all"
                  />
                </motion.div>

                <motion.div variants={inputVariants} whileFocus="focus">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Percent className="w-4 h-4" />
                    Probabilité (%)
                  </label>
                  <input 
                    name="probability" 
                    value={form.probability} 
                    onChange={change}
                    type="number"
                    min="0"
                    max="100"
                    placeholder="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all"
                  />
                </motion.div>
              </div>
            </motion.div>

            {/* Étape et date */}
            <motion.div 
              className="bg-gradient-to-br from-gray-50 to-purple-50/30 rounded-xl p-6 border border-gray-200/50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                Suivi et planning
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div variants={inputVariants} whileFocus="focus">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Étape du pipeline</label>
                  <select 
                    name="stage" 
                    value={form.stage} 
                    onChange={change}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/70 backdrop-blur-sm appearance-none cursor-pointer"
                  >
                    {STAGES.map(stage => (
                      <option key={stage} value={stage} className="capitalize">{stage}</option>
                    ))}
                  </select>
                </motion.div>

                <motion.div variants={inputVariants} whileFocus="focus">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Date de clôture prévue
                  </label>
                  <input 
                    name="expectedCloseDate" 
                    value={form.expectedCloseDate} 
                    onChange={change}
                    type="date"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all"
                  />
                </motion.div>
              </div>

              {/* Indicateur visuel des étapes */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">Progression actuelle</label>
                <div className="flex items-center justify-between">
                  {STAGES.map((stage, index) => (
                    <motion.div
                      key={stage}
                      className={`flex flex-col items-center ${form.stage === stage ? 'scale-110' : 'scale-100'}`}
                      whileHover={{ scale: 1.1 }}
                    >
                      <div className={`w-3 h-3 rounded-full mb-1 ${
                        STAGES.indexOf(form.stage) >= index 
                          ? `bg-gradient-to-r ${stageColors[stage]}`
                          : 'bg-gray-300'
                      }`} />
                      <span className={`text-xs ${form.stage === stage ? 'font-bold text-gray-900' : 'text-gray-500'}`}>
                        {stage}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Notes */}
            <motion.div 
              className="bg-gradient-to-br from-gray-50 to-orange-50/30 rounded-xl p-6 border border-gray-200/50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-orange-600" />
                Notes supplémentaires
              </h3>
              
              <motion.div variants={inputVariants} whileFocus="focus">
                <textarea 
                  name="notes" 
                  value={form.notes} 
                  onChange={change}
                  placeholder="Notes, commentaires, informations complémentaires..."
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all resize-none"
                />
              </motion.div>
            </motion.div>
          </div>

          {/* Actions */}
          <motion.div 
            className="flex gap-3 p-6 border-t border-gray-200/50 bg-gray-50/50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
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
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 font-medium shadow-lg shadow-green-500/25 transition-all ml-auto"
            >
              <Save className="w-4 h-4" />
              Créer l'opportunité
            </motion.button>
          </motion.div>

          {/* Effet de brillance */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none rounded-2xl"></div>
        </motion.form>
      </motion.div>
    </AnimatePresence>
  );
}