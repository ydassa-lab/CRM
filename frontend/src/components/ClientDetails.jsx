// src/components/ClientDetails.jsx
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Mail, 
  Phone, 
  Building, 
  User, 
  Shield, 
  Calendar,
  Edit2,
  Download,
  Printer,
  MessageSquare,
  CreditCard,
  FileText,
  CheckCircle,
  XCircle,
  MapPin,
  Briefcase,
  Activity,
  Clock,
  Bell,
  Lock,
  Unlock,
  ChevronRight,
  TrendingUp,
  FileSignature,
  DollarSign,
  Tag
} from "lucide-react";
import api from "../services/api";
import toast from "../utils/toast.js";

export default function ClientDetails({ client, onClose }) {
  const [data, setData] = useState(client);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const loadClientDetails = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/user/${client._id}`);
        setData(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Impossible de charger les détails du client");
      } finally {
        setLoading(false);
      }
    };
    loadClientDetails();
  }, [client._id]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const tabs = [
    { id: "profile", label: "Profil", icon: User },
    { id: "activity", label: "Activité", icon: Activity },
    { id: "documents", label: "Documents", icon: FileText },
    { id: "billing", label: "Facturation", icon: CreditCard }
  ];

  if (!data) return null;

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
          className="bg-gradient-to-br from-gray-50 to-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header avec animation */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 p-8"
          >
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
            >
              <X size={20} />
            </motion.button>
            
            <div className="flex items-center gap-6">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="relative"
              >
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-sm flex items-center justify-center border-2 border-white/30">
                  <span className="text-3xl font-bold text-white">
                    {data.prenom?.[0]}{data.nom?.[0]}
                  </span>
                </div>
                <motion.div 
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    repeatDelay: 5,
                    duration: 2 
                  }}
                  className={`absolute -bottom-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center border-4 border-white ${
                    data.isActive ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                >
                  {data.isActive ? (
                    <CheckCircle className="w-5 h-5 text-white" />
                  ) : (
                    <XCircle className="w-5 h-5 text-white" />
                  )}
                </motion.div>
              </motion.div>
              
              <div className="flex-1">
                <motion.h2
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl font-bold text-white mb-2"
                >
                  {data.prenom} {data.nom}
                </motion.h2>
                <motion.div 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-wrap gap-4 items-center text-white/90"
                >
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full"
                  >
                    <Building size={16} />
                    <span>{data.entreprise || "Particulier"}</span>
                  </motion.div>
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full"
                  >
                    <Shield size={16} />
                    <span className="capitalize">{data.role}</span>
                  </motion.div>
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full"
                  >
                    <Calendar size={16} />
                    <span>Inscrit le {formatDate(data.createdAt)}</span>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Tabs avec animation d'indicateur */}
          <div className="border-b border-gray-200 bg-white">
            <div className="flex relative">
              {tabs.map((tab, index) => {
                const Icon = tab.icon;
                return (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 text-sm font-medium transition-colors relative z-10 ${
                      activeTab === tab.id
                        ? 'text-blue-600'
                        : 'text-gray-600 hover:text-blue-500'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon size={18} />
                    {tab.label}
                  </motion.button>
                );
              })}
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 h-0.5 bg-blue-600"
                style={{
                  width: `${100 / tabs.length}%`,
                  x: `${tabs.findIndex(tab => tab.id === activeTab) * (100 / tabs.length)}%`
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            </div>
          </div>

          {/* Contenu avec transition */}
          <div className="p-8 max-h-[60vh] overflow-y-auto">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex flex-col items-center justify-center py-16"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"
                  />
                  <p className="text-gray-600">Chargement des détails...</p>
                </motion.div>
              ) : (
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {activeTab === "profile" && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <motion.div 
                          whileHover={{ y: -5 }}
                          className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
                        >
                          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <User className="text-blue-600" />
                            Informations personnelles
                          </h3>
                          <div className="space-y-4">
                            {[
                              { icon: Mail, label: "Email", value: data.email, href: `mailto:${data.email}` },
                              { icon: Phone, label: "Téléphone", value: data.telephone },
                              { icon: MapPin, label: "Adresse", value: data.address }
                            ].map((item, idx) => (
                              <motion.div
                                key={item.label}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="flex items-start gap-3"
                              >
                                <item.icon className="w-5 h-5 text-gray-400 mt-1" />
                                <div>
                                  <p className="text-sm text-gray-500">{item.label}</p>
                                  {item.href ? (
                                    <a 
                                      href={item.href}
                                      className="text-gray-900 font-medium hover:text-blue-600 transition-colors"
                                    >
                                      {item.value || "-"}
                                    </a>
                                  ) : (
                                    <p className="text-gray-900 font-medium">{item.value || "-"}</p>
                                  )}
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>

                        <motion.div 
                          whileHover={{ y: -5 }}
                          className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                              <FileText className="text-blue-600" />
                              Notes
                            </h3>
                            <motion.button 
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setIsEditing(!isEditing)}
                              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                            >
                              <Edit2 size={16} />
                            </motion.button>
                          </div>
                          <motion.div
                            animate={{ scale: isEditing ? 1.02 : 1 }}
                            transition={{ type: "spring" }}
                          >
                            {isEditing ? (
                              <textarea 
                                className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                defaultValue={data.notes || ""}
                                placeholder="Ajoutez des notes sur ce client..."
                              />
                            ) : (
                              <div className="prose prose-sm max-w-none">
                                <p className="text-gray-700 whitespace-pre-line">
                                  {data.notes || "Aucune note pour le moment."}
                                </p>
                              </div>
                            )}
                          </motion.div>
                        </motion.div>
                      </div>

                      <div className="space-y-6">
                        <motion.div 
                          whileHover={{ y: -5 }}
                          className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
                        >
                          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Activity className="text-blue-600" />
                            Statut du compte
                          </h3>
                          <div className="space-y-4">
                            <motion.div 
                              whileHover={{ scale: 1.05 }}
                              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                                data.isActive 
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {data.isActive ? (
                                <>
                                  <CheckCircle size={16} />
                                  Compte actif
                                </>
                              ) : (
                                <>
                                  <XCircle size={16} />
                                  Compte inactif
                                </>
                              )}
                            </motion.div>

                            {[
                              { icon: Clock, label: "Dernière connexion", value: data.lastLogin ? formatDate(data.lastLogin) : "Jamais connecté" },
                              { icon: Bell, label: "Notifications", value: data.notificationsEnabled ? "Activées" : "Désactivées" }
                            ].map((item, idx) => (
                              <motion.div
                                key={item.label}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="flex items-start gap-3"
                              >
                                <item.icon className="w-5 h-5 text-gray-400 mt-1" />
                                <div>
                                  <p className="text-sm text-gray-500">{item.label}</p>
                                  <p className="text-gray-900 font-medium">{item.value}</p>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>

                        {data.entreprise && (
                          <motion.div 
                            whileHover={{ y: -5 }}
                            className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
                          >
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                              <Briefcase className="text-blue-600" />
                              Informations professionnelles
                            </h3>
                            <div className="space-y-3">
                              <div>
                                <p className="text-sm text-gray-500">Entreprise</p>
                                <p className="text-gray-900 font-medium">{data.entreprise}</p>
                              </div>
                            </div>
                          </motion.div>
                        )}

                        <motion.div 
                          whileHover={{ y: -5 }}
                          className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-6"
                        >
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
                          <div className="grid grid-cols-2 gap-3">
                            {[
                              { icon: MessageSquare, label: "Contacter", color: "blue" },
                              { icon: CreditCard, label: "Factures", color: "green" },
                              { icon: Download, label: "Exporter", color: "purple" },
                              { icon: Printer, label: "Imprimer", color: "orange" }
                            ].map((action, idx) => (
                              <motion.button
                                key={action.label}
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                className="flex flex-col items-center justify-center p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all duration-300"
                              >
                                <action.icon className={`w-6 h-6 text-${action.color}-600 mb-2`} />
                                <span className="text-sm font-medium">{action.label}</span>
                              </motion.button>
                            ))}
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  )}

                  {activeTab === "activity" && (
                    <motion.div 
                      whileHover={{ y: -5 }}
                      className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 mb-6">Historique d'activité</h3>
                      <div className="space-y-4">
                        {[
                          { 
                            icon: CheckCircle, 
                            title: "Compte validé", 
                            description: "Administrateur", 
                            date: formatDate(data.createdAt),
                            color: "emerald" 
                          },
                          { 
                            icon: FileSignature, 
                            title: "Document signé", 
                            description: "Contrat de service", 
                            date: "15 Nov 2024",
                            color: "blue" 
                          },
                          { 
                            icon: TrendingUp, 
                            title: "Activité intense", 
                            description: "5 connexions cette semaine", 
                            date: "14 Nov 2024",
                            color: "amber" 
                          }
                        ].map((activity, idx) => (
                          <motion.div
                            key={activity.title}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            whileHover={{ x: 5 }}
                            className="flex items-center gap-4 p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                          >
                            <div className={`w-10 h-10 rounded-full bg-${activity.color}-100 flex items-center justify-center`}>
                              <activity.icon className={`w-5 h-5 text-${activity.color}-600`} />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{activity.title}</p>
                              <p className="text-sm text-gray-500">{activity.description} • {activity.date}</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {activeTab === "billing" && (
                    <motion.div 
                      whileHover={{ y: -5 }}
                      className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                        <DollarSign className="text-blue-600" />
                        Informations de facturation
                      </h3>
                      <div className="space-y-6">
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600">Solde actuel</p>
                              <p className="text-3xl font-bold text-gray-900">1 250 000 Ar</p>
                            </div>
                            <Tag className="w-12 h-12 text-blue-600" />
                          </div>
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer avec animations */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="border-t border-gray-200 bg-gray-50 px-8 py-6"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toast.success("Accès modifié")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                    data.isActive
                      ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 border border-amber-200'
                      : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border border-emerald-200'
                  }`}
                >
                  {data.isActive ? (
                    <>
                      <Lock size={16} />
                      Suspendre l'accès
                    </>
                  ) : (
                    <>
                      <Unlock size={16} />
                      Activer le compte
                    </>
                  )}
                </motion.button>
              </div>
              
              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="px-5 py-2.5 text-gray-700 hover:text-gray-900 font-medium transition-colors"
                >
                  Annuler
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setIsEditing(false);
                    toast.success("Modifications enregistrées");
                  }}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl"
                >
                  Enregistrer les modifications
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}