// src/pages/Clients.jsx
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Filter, 
  UserPlus, 
  Download, 
  Eye, 
  Edit2, 
  Trash2, 
  CheckCircle, 
  XCircle,
  Users,
  Building,
  Mail,
  Phone,
  Calendar,
  TrendingUp,
  Shield,
  MoreVertical,
  ChevronDown,
  FileText,
  RefreshCw
} from "lucide-react";
import api from "../services/api";
import Pagination from "../components/Pagination.jsx";
import AddClientModal from "../components/AddClientModal.jsx";
import ClientDetails from "../components/ClientDetails.jsx";
import toast from "../utils/toast.js";

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("createdAt:desc");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  const [showAdd, setShowAdd] = useState(false);
  const [viewClient, setViewClient] = useState(null);
  const [actionMenuOpen, setActionMenuOpen] = useState(null);

  // Version SIMPLE qui fonctionne avec votre API existante
  const fetchClients = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: meta.limit,
        sort,
        role: "client"
      };
      
      // Recherche globale
      if (q) {
        params.search = q;
      }
      
      console.log("Paramètres envoyés:", params);
      
      const res = await api.get("/user", { params });
      console.log("Réponse API:", res.data);
      
      // Récupérer TOUS les clients d'abord
      let allClients = res.data.data || [];
      
      // Appliquer les filtres côté client
      let filteredClients = allClients;
      
      if (statusFilter !== "all") {
        filteredClients = filteredClients.filter(client => 
          statusFilter === "active" ? client.isActive : !client.isActive
        );
      }
      
      if (typeFilter !== "all") {
        filteredClients = filteredClients.filter(client => 
          client.typeClient === typeFilter
        );
      }
      
      // Si nous avons une recherche, appliquer aussi ce filtre
      if (q) {
        const searchTerm = q.toLowerCase();
        filteredClients = filteredClients.filter(client => 
          (client.prenom?.toLowerCase().includes(searchTerm)) ||
          (client.nom?.toLowerCase().includes(searchTerm)) ||
          (client.email?.toLowerCase().includes(searchTerm)) ||
          (client.telephone?.includes(q)) ||
          (client.entreprise?.toLowerCase().includes(searchTerm))
        );
      }
      
      // Pour la pagination côté client, nous devons recalculer
      const total = filteredClients.length;
      const pages = Math.ceil(total / meta.limit);
      
      // Paginer les résultats filtrés
      const startIndex = (page - 1) * meta.limit;
      const paginatedClients = filteredClients.slice(startIndex, startIndex + meta.limit);
      
      setClients(paginatedClients);
      setMeta({
        page,
        limit: meta.limit,
        total,
        pages
      });
      
    } catch (err) {
      console.error("Erreur détaillée:", err);
      toast.error("Impossible de charger la liste des clients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients(1);
  }, [q, sort, statusFilter, typeFilter]);

  const handleAddClient = async (payload) => {
    try {
      const body = { ...payload, role: "client", isActive: payload.isActive ?? true };
      await api.post("/auth/signup", body);
      toast.success("✅ Client ajouté avec succès");
      setShowAdd(false);
      fetchClients(1);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Erreur lors de la création du client");
    }
  };

  const toggleActive = async (id, isActive) => {
    const action = isActive ? "activation" : "suspension";
    if (!confirm(`Confirmer la ${action} de ce compte client ?`)) return;
    
    try {
      await api.patch(`/user/${id}/activate`, { isActive });
      toast.success(`✅ Compte ${isActive ? 'activé' : 'suspendu'} avec succès`);
      fetchClients(meta.page);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Erreur lors de la modification du statut");
    }
  };

  const onDelete = async (id) => {
    if (!confirm("Cette action est irréversible. Confirmer la suppression définitive ?")) return;
    
    try {
      await api.delete(`/user/${id}`);
      toast.success("🗑️ Client supprimé avec succès");
      fetchClients(meta.page);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Erreur lors de la suppression");
    }
  };

  const handleExport = () => {
    toast.info(`Export de ${clients.length} clients en cours...`);
    // Logique d'export à implémenter
  };

  const handleRefresh = () => {
    fetchClients(meta.page);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const toggleActionMenu = (clientId) => {
    setActionMenuOpen(actionMenuOpen === clientId ? null : clientId);
  };

  // Reset des filtres
  const resetFilters = () => {
    setQ("");
    setStatusFilter("all");
    setTypeFilter("all");
    setSort("createdAt:desc");
  };

  // Fonction pour extraire tous les clients sans pagination pour les statistiques
  const getAllClientsForStats = async () => {
    try {
      const res = await api.get("/user", { 
        params: { 
          role: "client",
          limit: 1000 // Récupérer beaucoup pour les stats
        } 
      });
      return res.data.data || [];
    } catch (err) {
      console.error("Erreur récupération stats:", err);
      return [];
    }
  };

  // Statistiques basées sur les clients affichés
  const stats = {
    total: clients.length,
    active: clients.filter(c => c.isActive).length,
    inactive: clients.filter(c => !c.isActive).length,
    enterprise: clients.filter(c => c.typeClient === "entreprise").length
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-6"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              Portefeuille Clients
            </h1>
            <p className="text-gray-600">
              Gérez et suivez l'ensemble de vos clients dans un espace sécurisé
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {(q || statusFilter !== "all" || typeFilter !== "all") && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={resetFilters}
                className="px-4 py-2.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Réinitialiser
              </motion.button>
            )}
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              className="p-2.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
              title="Actualiser"
            >
              <RefreshCw className="w-5 h-5 text-gray-600" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleExport}
              className="px-4 py-2.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Exporter
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAdd(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              Nouveau Client
            </motion.button>
          </div>
        </motion.div>

        {/* Statistiques */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {[
            { 
              label: "Clients affichés", 
              value: stats.total, 
              icon: Users, 
              color: "blue",
              bg: "from-blue-500 to-blue-600"
            },
            { 
              label: "Actifs", 
              value: stats.active, 
              icon: CheckCircle, 
              color: "emerald",
              bg: "from-emerald-500 to-green-600"
            },
            { 
              label: "Inactifs", 
              value: stats.inactive, 
              icon: XCircle, 
              color: "amber",
              bg: "from-amber-500 to-orange-600"
            },
            { 
              label: "Entreprises", 
              value: stats.enterprise, 
              icon: Building, 
              color: "purple",
              bg: "from-purple-500 to-indigo-600"
            }
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 + idx * 0.1 }}
              whileHover={{ y: -5 }}
              className={`bg-gradient-to-r ${stat.bg} rounded-2xl p-6 text-white shadow-lg`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">{stat.label}</p>
                  <p className="text-3xl font-bold mt-2">{stat.value}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/20">
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Filtres et Recherche */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-gray-200"
        >
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
            <div className="flex-1 w-full">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher un client par nom, email, téléphone ou entreprise..."
                  value={q}
                  onChange={e => setQ(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-500" />
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-48"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="active">Actifs</option>
                  <option value="inactive">Inactifs</option>
                </select>
              </div>

              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-48"
              >
                <option value="all">Tous les types</option>
                <option value="particulier">Particuliers</option>
                <option value="entreprise">Entreprises</option>
              </select>

              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-48"
              >
                <option value="createdAt:desc">Plus récents</option>
                <option value="createdAt:asc">Plus anciens</option>
                <option value="prenom:asc">A → Z</option>
                <option value="prenom:desc">Z → A</option>
                <option value="entreprise:asc">Entreprise A → Z</option>
              </select>
            </div>
          </div>

          {/* Indicateurs de filtres actifs */}
          {(q || statusFilter !== "all" || typeFilter !== "all") && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-4 pt-4 border-t border-gray-100"
            >
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="font-medium">Filtres actifs :</span>
                {q && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                    Recherche: "{q}"
                  </span>
                )}
                {statusFilter !== "all" && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full">
                    Statut: {statusFilter === "active" ? "Actifs" : "Inactifs"}
                  </span>
                )}
                {typeFilter !== "all" && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                    Type: {typeFilter === "entreprise" ? "Entreprises" : "Particuliers"}
                  </span>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Tableau des Clients */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200"
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"
              />
              <p className="text-gray-600">Chargement du portefeuille client...</p>
            </div>
          ) : clients.length === 0 ? (
            <div className="text-center py-20">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {q || statusFilter !== "all" || typeFilter !== "all" 
                  ? "Aucun client correspondant" 
                  : "Aucun client enregistré"}
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {q || statusFilter !== "all" || typeFilter !== "all"
                  ? "Aucun résultat ne correspond à vos critères de recherche. Essayez d'ajuster les filtres."
                  : "Commencez par ajouter votre premier client pour constituer votre portefeuille."}
              </p>
              {(q || statusFilter !== "all" || typeFilter !== "all") && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resetFilters}
                  className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 inline-flex items-center gap-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  Réinitialiser les filtres
                </motion.button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-blue-50/50 border-b border-gray-200">
                  <tr>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Identité
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Inscription
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <AnimatePresence>
                    {clients.map((client, index) => (
                      <motion.tr
                        key={client._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ backgroundColor: "rgba(59, 130, 246, 0.05)" }}
                        className="group"
                      >
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                              client.typeClient === "entreprise"
                                ? "bg-gradient-to-r from-purple-500 to-indigo-600"
                                : "bg-gradient-to-r from-blue-500 to-cyan-600"
                            }`}>
                              <span className="text-white font-semibold">
                                {client.prenom?.[0]}{client.nom?.[0]}
                              </span>
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">
                                {client.prenom} {client.nom}
                              </div>
                              <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                {client.typeClient === "entreprise" && <Building className="w-3 h-3" />}
                                {client.entreprise || "Particulier"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="w-4 h-4 text-gray-400" />
                              <a 
                                href={`mailto:${client.email}`}
                                className="text-gray-700 hover:text-blue-600 transition-colors"
                              >
                                {client.email}
                              </a>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone className="w-4 h-4 text-gray-400" />
                              {client.telephone || "Non renseigné"}
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex flex-col gap-1">
                            <span className={`inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-semibold ${
                              client.isActive
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}>
                              {client.isActive ? (
                                <>
                                  <CheckCircle className="w-3 h-3 mr-1.5" />
                                  Actif
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-3 h-3 mr-1.5" />
                                  Inactif
                                </>
                              )}
                            </span>
                            {client.lastLogin && (
                              <span className="text-xs text-gray-500">
                                Connecté le {formatDate(client.lastLogin)}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="text-sm text-gray-700">
                            {formatDate(client.createdAt)}
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setViewClient(client)}
                              className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                              title="Voir les détails"
                            >
                              <Eye className="w-4 h-4" />
                            </motion.button>
                            
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => toggleActive(client._id, !client.isActive)}
                              className={`p-2 rounded-lg transition-colors ${
                                client.isActive
                                  ? "bg-amber-50 text-amber-600 hover:bg-amber-100"
                                  : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                              }`}
                              title={client.isActive ? "Suspendre le compte" : "Activer le compte"}
                            >
                              {client.isActive ? (
                                <XCircle className="w-4 h-4" />
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                            </motion.button>

                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => {
                                if (confirm("Êtes-vous sûr de vouloir supprimer ce client ?")) {
                                  onDelete(client._id);
                                }
                              }}
                              className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Pagination */}
        {clients.length > 0 && meta.pages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8"
          >
            <Pagination meta={meta} onChange={(page) => fetchClients(page)} />
          </motion.div>
        )}

        {/* Modal d'ajout */}
        <AnimatePresence>
          {showAdd && (
            <AddClientModal onClose={() => setShowAdd(false)} onSaveClient={handleAddClient} />
          )}
        </AnimatePresence>

        {/* Modal de détails */}
        <AnimatePresence>
          {viewClient && (
            <ClientDetails client={viewClient} onClose={() => setViewClient(null)} />
          )}
        </AnimatePresence>

        {/* Indicateur de résultats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 flex items-center justify-between text-sm text-gray-600"
        >
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span>Interface sécurisée • Données chiffrées</span>
          </div>
          <div>
            Affichage de {clients.length} client{clients.length !== 1 ? 's' : ''} 
            {meta.total > 0 && ` sur ${meta.total}`}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}