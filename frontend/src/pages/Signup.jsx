import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Phone, Building, Lock, ArrowRight, Shield, Users, Target, MessageCircle, BarChart3 } from "lucide-react";
import api from "../services/api";
import { Link } from "react-router-dom";

export default function Signup() {
  const [form, setForm] = useState({
    prenom: "", nom: "", email: "", telephone: "",
    adresse: "", ville: "", pays: "",
    typeClient: "particulier", entreprise: "", password: "", role: "client"
  });
  const [msg, setMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await api.post("/auth/signup", form);
      setMsg(res.data.message);
      setForm(prev => ({ ...prev, password: "" }));
    } catch (err) {
      setMsg(err?.response?.data?.message || "Erreur serveur");
    } finally {
      setIsLoading(false);
    }
  };

  const roleIcons = {
    admin: <Shield className="w-4 h-4" />,
    commercial: <Target className="w-4 h-4" />,
    marketing: <BarChart3 className="w-4 h-4" />,
    support: <MessageCircle className="w-4 h-4" />,
    manager: <Users className="w-4 h-4" />,
    client: <User className="w-4 h-4" />
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col lg:flex-row" style={{ maxHeight: '90vh' }}>
        
        {/* Partie Gauche - Texte de bienvenue */}
        <motion.div 
          className="lg:w-2/5 bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-8"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="space-y-6">
            <div>
              <motion.h1 
                className="text-2xl font-bold mb-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                Créer Votre Compte
              </motion.h1>
              <motion.p 
                className="text-blue-100 text-sm leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Rejoignez notre plateforme CRM et gérez vos relations clients efficacement.
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
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Sécurisé</h3>
                  <p className="text-blue-100 text-xs">Données chiffrées et protégées</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Multi-Rôles</h3>
                  <p className="text-blue-100 text-xs">Adapté à tous les profils</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Analyses</h3>
                  <p className="text-blue-100 text-xs">Tableaux de bord complets</p>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div 
            className="border-t border-blue-500/30 pt-4 mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <p className="text-blue-200 text-xs">
              Rejoignez des milliers de professionnels
            </p>
          </motion.div>
        </motion.div>

        {/* Partie Droite - Formulaire d'inscription */}
        <motion.div 
          className="lg:w-3/5 p-8 overflow-y-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="max-w-md mx-auto">
            {/* Header du formulaire */}
            <motion.div variants={itemVariants} className="text-center mb-6">
              <div className="lg:hidden mb-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mx-auto">
                  <User className="w-6 h-6 text-white" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-gray-800">
                Inscription
              </h2>
              <p className="text-gray-600 text-sm mt-1">Remplissez vos informations</p>
            </motion.div>

            {/* Message de statut */}
            <AnimatePresence>
              {msg && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`p-3 rounded-lg mb-4 text-sm ${
                    msg.includes("Erreur") 
                      ? "bg-red-50 border border-red-200 text-red-700" 
                      : "bg-green-50 border border-green-200 text-green-700"
                  }`}
                >
                  {msg}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.form onSubmit={submit} variants={itemVariants} className="space-y-3">
              {/* Informations personnelles */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Prénom *</label>
                  <div className="relative">
                    <User className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input 
                      name="prenom" 
                      value={form.prenom} 
                      placeholder="Prénom"
                      onChange={handleChange}
                      className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Nom *</label>
                  <input 
                    name="nom" 
                    value={form.nom} 
                    placeholder="Nom"
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required 
                  />
                </div>
              </div>

              {/* Email et Téléphone */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Email *</label>
                <div className="relative">
                  <Mail className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input 
                    name="email" 
                    value={form.email} 
                    placeholder="email@exemple.com"
                    onChange={handleChange}
                    type="email"
                    className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Téléphone *</label>
                <div className="relative">
                  <Phone className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input 
                    name="telephone" 
                    value={form.telephone} 
                    placeholder="+33 1 23 45 67 89"
                    onChange={handleChange}
                    className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required 
                  />
                </div>
              </div>

              {/* Rôle */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Rôle *</label>
                <div className="relative">
                  <select 
                    name="role" 
                    value={form.role} 
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer"
                  >
                    <option value="admin">Administrateur</option>
                    <option value="commercial">Commercial</option>
                    <option value="marketing">Marketing</option>
                    <option value="support">Support</option>
                    <option value="manager">Manager</option>
                    <option value="client">Client</option>
                  </select>
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400">
                    {roleIcons[form.role]}
                  </div>
                </div>
              </div>

              {/* Type Client (si rôle = client) */}
              {form.role === "client" && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Type de client</label>
                    <select 
                      name="typeClient" 
                      value={form.typeClient} 
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer"
                    >
                      <option value="particulier">Particulier</option>
                      <option value="entreprise">Entreprise</option>
                    </select>
                  </div>

                  {form.typeClient === "entreprise" && (
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Entreprise</label>
                      <div className="relative">
                        <Building className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input 
                          name="entreprise" 
                          value={form.entreprise} 
                          placeholder="Nom de l'entreprise"
                          onChange={handleChange}
                          className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Mot de passe */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Mot de passe *</label>
                <div className="relative">
                  <Lock className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input 
                    type="password" 
                    name="password" 
                    value={form.password} 
                    placeholder="Mot de passe"
                    onChange={handleChange}
                    className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required 
                  />
                </div>
              </div>

              {/* Bouton d'inscription */}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 font-medium shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    S'inscrire
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>

              {/* Lien de connexion */}
              <motion.p variants={itemVariants} className="text-center text-gray-600 text-sm mt-4">
                Déjà un compte ?{" "}
                <Link 
                  to="/login" 
                  className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  Se connecter
                </Link>
              </motion.p>
            </motion.form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}