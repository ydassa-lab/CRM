import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, SortAsc, Plus, Edit3, Trash2, UserCheck, Users, Mail, Phone, Globe, TrendingUp } from "lucide-react";
import api from "../../services/api";
import AddProspectModal from "../../components/AddProspectModal.jsx";
import EditProspectModal from "../../components/EditProspectModal.jsx";
import Pagination from "../../components/Pagination.jsx";
import toast from "../../utils/toast";

const STATUTS = ["", "Nouveau", "Contacté", "Relance", "Converti"];

export default function CommercialProspects(){
  const [prospects, setProspects] = useState([]);
  const [meta, setMeta] = useState({page: 1, limit: 10, pages: 1, total: 0});
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [statut, setStatut] = useState("");
  const [sort, setSort] = useState("createdAt:desc");

  const [addOpen, setAddOpen] = useState(false);
  const [edit, setEdit] = useState(null);

  const fetchProspects = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: meta.limit, sort };
      if (q) params.search = q;
      if (statut) params.statut = statut;
      const res = await api.get("/prospect", { params });
      setProspects(res.data.data);
      setMeta(res.data.meta);
    } catch (err) {
      toast.error("Impossible de charger les prospects");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchProspects(1); }, [q, statut, sort]);

  const onAdd = async (payload) => {
    try {
      await api.post("/prospect", payload);
      toast.success("Prospect ajouté");
      setAddOpen(false);
      fetchProspects(meta.page);
    } catch (err) { toast.error(err?.response?.data?.message || "Erreur ajout"); }
  };

  const onEdit = async (id, payload) => {
    try {
      await api.put(`/prospect/${id}`, payload);
      toast.success("Prospect mis à jour");
      setEdit(null);
      fetchProspects(meta.page);
    } catch (err) { toast.error(err?.response?.data?.message || "Erreur update"); }
  };

  const onDelete = async (id) => {
    if (!confirm("Supprimer ce prospect ?")) return;
    try {
      await api.delete(`/prospect/${id}`);
      toast.success("Supprimé");
      fetchProspects(meta.page);
    } catch (err) { toast.error("Erreur suppression"); }
  };

  const onConvert = async (id) => {
    if (!confirm("Convertir ce prospect en client ? (un compte client sera créé, inactif)")) return;
    try {
      const res = await api.post(`/prospect/${id}/convert`);
      toast.success(res.data.message || "Converti");
      fetchProspects(meta.page);
    } catch (err) { toast.error(err?.response?.data?.message || "Erreur conversion"); }
  };

  const statutColors = {
    "Nouveau": "bg-blue-100 text-blue-800 border-blue-200",
    "Contacté": "bg-purple-100 text-purple-800 border-purple-200",
    "Relance": "bg-orange-100 text-orange-800 border-orange-200",
    "Converti": "bg-green-100 text-green-800 border-green-200"
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

  const cardHoverVariants = {
    hover: {
      scale: 1.02,
      y: -2,
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
      transition: { type: "spring", stiffness: 300 }
    }
  };

  return (
    <motion.div 
      className="p-6 space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
            <Users className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Gestion des Prospects
            </h1>
            <p className="text-gray-600 mt-1">Suivez et convertissez vos prospects en clients</p>
          </div>
        </div>
        
        <motion.button 
          onClick={() => setAddOpen(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 font-medium shadow-lg shadow-blue-500/25 transition-all"
        >
          <Plus className="w-5 h-5" />
          Ajouter Prospect
        </motion.button>
      </motion.div>

      {/* Filters */}
      <motion.div 
        variants={itemVariants}
        className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-200/50 p-6"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          {/* Search */}
          <div className="lg:col-span-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              value={q} 
              onChange={e => setQ(e.target.value)} 
              placeholder="Rechercher un prospect..." 
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
            />
          </div>

          {/* Statut Filter */}
          <div className="lg:col-span-3 relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select 
              value={statut} 
              onChange={e => setStatut(e.target.value)} 
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm appearance-none cursor-pointer"
            >
              {STATUTS.map(s => <option key={s} value={s}>{s || "Tous les statuts"}</option>)}
            </select>
          </div>

          {/* Sort */}
          <div className="lg:col-span-3 relative">
            <SortAsc className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select 
              value={sort} 
              onChange={e => setSort(e.target.value)} 
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm appearance-none cursor-pointer"
            >
              <option value="createdAt:desc">Plus récents</option>
              <option value="createdAt:asc">Plus anciens</option>
              <option value="prenom:asc">Prénom A-Z</option>
              <option value="prenom:desc">Prénom Z-A</option>
            </select>
          </div>

          {/* Counter */}
          <div className="lg:col-span-2 text-center">
            <motion.div 
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-3 py-2 rounded-xl font-semibold"
              whileHover={{ scale: 1.05 }}
            >
              {meta.total}
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div 
        variants={itemVariants}
        className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100/80 border-b border-gray-200">
              <tr>
                <th className="p-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Prospect</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Contact</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Source</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Statut</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200/50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center">
                    <motion.div 
                      className="flex justify-center items-center space-x-3"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    </motion.div>
                    <p className="text-gray-500 mt-2">Chargement des prospects...</p>
                  </td>
                </tr>
              ) : prospects.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center">
                    <div className="text-gray-400 mb-2">👥</div>
                    <p className="text-gray-500 text-lg">Aucun prospect trouvé</p>
                    <p className="text-gray-400 text-sm mt-1">Commencez par ajouter votre premier prospect</p>
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {prospects.map((prospect, index) => (
                    <motion.tr 
                      key={prospect._id}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50/50 transition-colors group"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {prospect.prenom?.[0]}{prospect.nom?.[0]}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {prospect.prenom} {prospect.nom}
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(prospect.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-gray-900">
                            <Mail className="w-4 h-4 text-gray-400" />
                            {prospect.email || "-"}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Phone className="w-4 h-4 text-gray-400" />
                            {prospect.telephone || "-"}
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700">{prospect.source || "Non spécifiée"}</span>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border ${statutColors[prospect.statut] || "bg-gray-100 text-gray-800 border-gray-200"}`}>
                          {prospect.statut}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="flex gap-2 flex-wrap">
                          <motion.button
                            variants={cardHoverVariants}
                            whileHover="hover"
                            whileTap="tap"
                            onClick={() => setEdit(prospect)}
                            className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                            Modifier
                          </motion.button>

                          <motion.button
                            variants={cardHoverVariants}
                            whileHover="hover"
                            whileTap="tap"
                            onClick={() => onDelete(prospect._id)}
                            className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Supprimer
                          </motion.button>

                          <motion.button
                            variants={cardHoverVariants}
                            whileHover="hover"
                            whileTap="tap"
                            onClick={() => onConvert(prospect._id)}
                            className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-colors"
                          >
                            <UserCheck className="w-4 h-4" />
                            Convertir
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Pagination */}
      {prospects.length > 0 && (
        <motion.div variants={itemVariants} className="mt-6">
          <Pagination meta={meta} onChange={(p) => fetchProspects(p)} />
        </motion.div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {addOpen && (
          <AddProspectModal 
            onClose={() => setAddOpen(false)} 
            onSave={onAdd} 
          />
        )}

        {edit && (
          <EditProspectModal 
            prospect={edit} 
            onClose={() => setEdit(null)} 
            onSave={onEdit} 
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}