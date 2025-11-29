import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, SortAsc, Plus, Edit3, Trash2, Target, Users, TrendingUp, DollarSign, Percent } from "lucide-react";
import api from "../../services/api";
import AddOpportunityModal from "../../components/AddOpportunityModal.jsx";
import EditOpportunityModal from "../../components/EditOpportunityModal.jsx";
import Pagination from "../../components/Pagination.jsx";
import toast from "../../utils/toast";

const STAGES = ["", "Découverte", "Proposition", "Négociation", "Gagné", "Perdu"];

export default function CommercialOpportunities(){
  const [items, setItems] = useState([]);
  const [prospects, setProspects] = useState([]);
  const [meta, setMeta] = useState({page: 1, limit: 10, pages: 1, total: 0});
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [stage, setStage] = useState("");
  const [sort, setSort] = useState("createdAt:desc");

  const [addOpen, setAddOpen] = useState(false);
  const [edit, setEdit] = useState(null);

  const fetchProspects = async () => {
    try {
      const res = await api.get("/prospect", { params: { limit: 1000 } });
      setProspects(res.data.data || []);
    } catch (err) {
      console.error("Erreur chargement prospects:", err);
      toast.error("Impossible de charger la liste des prospects");
    }
  };

  const fetch = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: meta.limit, sort };
      if (q) params.search = q;
      if (stage) params.stage = stage;
      const res = await api.get("/opportunities", { params });
      setItems(res.data.data);
      setMeta(res.data.meta);
    } catch (err) {
      toast.error("Impossible de charger les opportunités");
    } finally { setLoading(false); }
  };

  useEffect(() => { 
    fetch(1); 
  }, [q, stage, sort]);

  useEffect(() => {
    if (addOpen) {
      fetchProspects();
    }
  }, [addOpen]);

  const onAdd = async (payload) => {
    try {
      await api.post("/opportunities", payload);
      toast.success("Opportunité ajoutée");
      setAddOpen(false);
      fetch(meta.page);
    } catch (err) { toast.error(err?.response?.data?.message || "Erreur ajout"); }
  };

  const onEdit = async (id, payload) => {
    try {
      await api.put(`/opportunities/${id}`, payload);
      toast.success("Opportunité mise à jour");
      setEdit(null);
      fetch(meta.page);
    } catch (err) { toast.error(err?.response?.data?.message || "Erreur update"); }
  };

  const onDelete = async (id) => {
    if (!confirm("Supprimer cette opportunité ?")) return;
    try {
      await api.delete(`/opportunities/${id}`);
      toast.success("Supprimée");
      fetch(meta.page);
    } catch (err) { toast.error("Erreur suppression"); }
  };

  const onChangeStage = async (id, stage) => {
    try {
      await api.patch(`/opportunities/${id}/stage`, { stage });
      toast.success("Stage mis à jour");
      fetch(meta.page);
    } catch (err) { toast.error(err?.response?.data?.message || "Erreur stage"); }
  };

  const stageColors = {
    "Découverte": "bg-blue-100 text-blue-800 border-blue-200",
    "Proposition": "bg-purple-100 text-purple-800 border-purple-200",
    "Négociation": "bg-orange-100 text-orange-800 border-orange-200",
    "Gagné": "bg-green-100 text-green-800 border-green-200",
    "Perdu": "bg-red-100 text-red-800 border-red-200"
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
          <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg">
            <Target className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Opportunités Commerciales
            </h1>
            <p className="text-gray-600 mt-1">Gérez votre pipeline de ventes et suivez vos prospects</p>
          </div>
        </div>
        
        <motion.button 
          onClick={() => setAddOpen(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 font-medium shadow-lg shadow-green-500/25 transition-all"
        >
          <Plus className="w-5 h-5" />
          Nouvelle opportunité
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
              placeholder="Rechercher une opportunité..." 
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
            />
          </div>

          {/* Stage Filter */}
          <div className="lg:col-span-3 relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select 
              value={stage} 
              onChange={e => setStage(e.target.value)} 
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/50 backdrop-blur-sm appearance-none cursor-pointer"
            >
              {STAGES.map(s => <option key={s} value={s}>{s || "Tous les stages"}</option>)}
            </select>
          </div>

          {/* Sort */}
          <div className="lg:col-span-3 relative">
            <SortAsc className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select 
              value={sort} 
              onChange={e => setSort(e.target.value)} 
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/50 backdrop-blur-sm appearance-none cursor-pointer"
            >
              <option value="createdAt:desc">Plus récents</option>
              <option value="createdAt:asc">Plus anciens</option>
              <option value="amount:desc">Montant décroissant</option>
              <option value="amount:asc">Montant croissant</option>
            </select>
          </div>

          {/* Counter */}
          <div className="lg:col-span-2 text-center">
            <motion.div 
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-2 rounded-xl font-semibold"
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
                <th className="p-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Opportunité</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Prospect</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Valeur</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Probabilité</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Stage</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200/50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center">
                    <motion.div 
                      className="flex justify-center items-center space-x-3"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </motion.div>
                    <p className="text-gray-500 mt-2">Chargement des opportunités...</p>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center">
                    <div className="text-gray-400 mb-2">🎯</div>
                    <p className="text-gray-500 text-lg">Aucune opportunité trouvée</p>
                    <p className="text-gray-400 text-sm mt-1">Commencez par créer votre première opportunité</p>
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {items.map((item, index) => (
                    <motion.tr 
                      key={item._id}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50/50 transition-colors group"
                    >
                      <td className="p-4">
                        <div className="font-medium text-gray-900">{item.title}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </div>
                      </td>

                      <td className="p-4">
                        {item.prospect ? (
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                              {item.prospect.prenom?.[0]}{item.prospect.nom?.[0]}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {item.prospect.prenom} {item.prospect.nom}
                              </div>
                              <div className="text-sm text-gray-500">{item.prospect.email}</div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span className="font-semibold text-gray-900">
                            {item.amount} {item.currency}
                          </span>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Percent className="w-4 h-4 text-blue-600" />
                          <span className="font-semibold text-gray-900">{item.probability}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-green-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${item.probability}%` }}
                          ></div>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border ${stageColors[item.stage] || "bg-gray-100 text-gray-800 border-gray-200"}`}>
                          {item.stage}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="flex gap-2 flex-wrap">
                          <motion.button
                            variants={cardHoverVariants}
                            whileHover="hover"
                            whileTap="tap"
                            onClick={() => setEdit(item)}
                            className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                            Modifier
                          </motion.button>

                          <motion.button
                            variants={cardHoverVariants}
                            whileHover="hover"
                            whileTap="tap"
                            onClick={() => onDelete(item._id)}
                            className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Supprimer
                          </motion.button>

                          <select 
                            onChange={(e) => onChangeStage(item._id, e.target.value)} 
                            defaultValue=""
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm cursor-pointer"
                          >
                            <option value="">Changer stage</option>
                            {STAGES.filter(s => s).map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
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
      {items.length > 0 && (
        <motion.div variants={itemVariants} className="mt-6">
          <Pagination meta={meta} onChange={(p) => fetch(p)} />
        </motion.div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {addOpen && (
          <AddOpportunityModal 
            onClose={() => setAddOpen(false)} 
            onSave={onAdd} 
            prospects={prospects}
          />
        )}

        {edit && (
          <EditOpportunityModal 
            opportunity={edit} 
            onClose={() => setEdit(null)} 
            onSave={onEdit} 
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}