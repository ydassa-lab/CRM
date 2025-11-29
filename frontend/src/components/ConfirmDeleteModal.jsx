import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, Trash2, Shield } from "lucide-react";

export default function ConfirmDeleteModal({ title, onCancel, onConfirm }) {
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
      rotateX: -15,
      y: 50
    },
    visible: { 
      opacity: 1,
      scale: 1,
      rotateX: 0,
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
      rotateX: 15,
      y: -50,
      transition: { duration: 0.3 }
    }
  };

  const buttonHoverVariants = {
    hover: {
      scale: 1.05,
      rotateY: 5,
      transition: { type: "spring", stiffness: 400 }
    },
    tap: {
      scale: 0.95,
      rotateY: -2
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
        <motion.div
          className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 w-full max-w-md overflow-hidden"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Header avec effet d'alerte */}
          <div className="bg-gradient-to-r from-red-500 to-orange-500 p-6 relative">
            <div className="absolute top-4 right-4">
              <motion.button
                onClick={onCancel}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                className="p-1 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>
            
            <div className="flex items-center justify-center gap-3">
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, -5, 5, 0] 
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  repeatType: "reverse" 
                }}
                className="p-3 bg-white/20 rounded-full"
              >
                <AlertTriangle className="w-8 h-8 text-white" />
              </motion.div>
              <Shield className="w-6 h-6 text-white/80" />
            </div>
          </div>

          {/* Contenu */}
          <div className="p-6">
            <motion.h3 
              className="text-xl font-bold text-gray-900 text-center mb-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Confirmation requise
            </motion.h3>
            
            <motion.p 
              className="text-gray-600 text-center mb-6 leading-relaxed"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {title}
            </motion.p>

            <motion.div 
              className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-red-800 font-medium text-sm">Action irréversible</p>
                  <p className="text-red-600 text-xs mt-1">
                    Cette action ne peut pas être annulée. Les données seront définitivement supprimées.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div 
              className="flex gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <motion.button
                onClick={onCancel}
                variants={buttonHoverVariants}
                whileHover="hover"
                whileTap="tap"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
                style={{ transformStyle: "preserve-3d" }}
              >
                <X className="w-4 h-4" />
                Annuler
              </motion.button>

              <motion.button
                onClick={onConfirm}
                variants={buttonHoverVariants}
                whileHover="hover"
                whileTap="tap"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl hover:from-red-700 hover:to-orange-700 font-medium shadow-lg shadow-red-500/25 transition-all"
                style={{ transformStyle: "preserve-3d" }}
              >
                <Trash2 className="w-4 h-4" />
                Supprimer
              </motion.button>
            </motion.div>
          </div>

          {/* Effet de brillance */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none rounded-2xl"></div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}