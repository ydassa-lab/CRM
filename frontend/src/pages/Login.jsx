import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, LogIn, User, Shield, BarChart3, Users } from "lucide-react";
import api from "../services/api";
import { Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      window.location.href = "/";
    } catch (error) {
      setErr(error?.response?.data?.message || "Erreur de connexion");
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row" style={{ maxHeight: '600px' }}>
        
        {/* Partie Gauche - Illustration/Bienvenue */}
        <motion.div 
          className="lg:w-2/5 bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-8"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="space-y-6 h-full flex flex-col justify-between">
            <div className="space-y-6">
              <div>
                <motion.h1 
                  className="text-2xl font-bold mb-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  Bienvenue !
                </motion.h1>
                <motion.p 
                  className="text-blue-100 text-base leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Connectez-vous pour accéder à votre espace CRM et gérez vos relations clients efficacement.
                </motion.p>
              </div>

              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Sécurité maximale</h3>
                    <p className="text-blue-100 text-sm">Vos données sont protégées</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Analyses avancées</h3>
                    <p className="text-blue-100 text-sm">Tableaux de bord complets</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Collaboration</h3>
                    <p className="text-blue-100 text-sm">Travail d'équipe simplifié</p>
                  </div>
                </div>
              </motion.div>
            </div>

            <motion.div 
              className="flex justify-center pt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center">
                <User className="w-10 h-10 text-white/80" />
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Partie Droite - Formulaire de connexion */}
        <motion.div 
          className="lg:w-3/5 p-8 flex items-center justify-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="w-full max-w-sm">
            {/* Header du formulaire */}
            <motion.div variants={itemVariants} className="text-center mb-8">
              <div className="lg:hidden mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
                  <LogIn className="w-8 h-8 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                Connexion
              </h2>
              <p className="text-gray-600 text-base mt-2">Accédez à votre espace personnel</p>
            </motion.div>

            {/* Message d'erreur */}
            <AnimatePresence>
              {err && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 rounded-xl mb-6 bg-red-50 border border-red-200 text-red-700 text-base"
                >
                  {err}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.form onSubmit={submit} variants={itemVariants} className="space-y-6">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Adresse email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input 
                    type="email" 
                    placeholder="votre@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>

              {/* Mot de passe */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input 
                    type="password" 
                    placeholder="Votre mot de passe"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>

              {/* Bouton de connexion */}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 font-semibold shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-base"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Se connecter
                    <LogIn className="w-5 h-5" />
                  </>
                )}
              </motion.button>

              {/* Lien d'inscription */}
              <motion.p variants={itemVariants} className="text-center text-gray-600 text-base mt-6">
                Pas encore inscrit ?{" "}
                <Link 
                  to="/signup" 
                  className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                >
                  Créer un compte
                </Link>
              </motion.p>
            </motion.form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}