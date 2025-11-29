import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, SortAsc, UserX, UserCheck, Edit3, Trash2, Users } from "lucide-react";
import api from "../../services/api";
import EditUserModal from "../../components/EditUserModal.jsx";
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal.jsx";
import Pagination from "../../components/Pagination.jsx";
import toast from "../../utils/toast.js";

const ROLES = ["all", "admin", "commercial", "marketing", "support", "manager", "client"];

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sort, setSort] = useState("createdAt:desc");

  const [editUser, setEditUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page, limit: meta.limit, sort,
      };
      if (q) params.search = q;
      if (roleFilter !== "all") params.role = roleFilter;
      const res = await api.get("/user", { params });
      setUsers(res.data.data);
      setMeta(res.data.meta || { page: 1, limit: 10, total: 0, pages: 1 });
    } catch (err) {
      toast.error("Impossible de charger les utilisateurs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(1); }, [q, roleFilter, sort]);

  const toggleActive = async (id, isActive) => {
    try {
      await api.patch(`/user/${id}/activate`, { isActive });
      toast.success("Statut mis à jour");
      fetchUsers(meta.page);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Erreur activation");
    }
  };

  const onDelete = async (id) => {
    try {
      await api.delete(`/user/${id}`);
      toast.success("Utilisateur supprimé");
      fetchUsers(meta.page);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Erreur suppression");
    } finally {
      setDeleteUser(null);
    }
  };

  const onSaveEdit = async (id, payload) => {
    try {
      await api.put(`/user/${id}`, payload);
      toast.success("Utilisateur mis à jour");
      fetchUsers(meta.page);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Erreur mise à jour");
    } finally { setEditUser(null); }
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
      rotateY: 2,
      rotateX: 1,
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
      transition: { type: "spring", stiffness: 300 }
    },
    tap: { scale: 0.98 }
  };

  return (
    <motion.div 
      className="p-6 space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* HEADER */}
      <motion.div variants={itemVariants} className="flex items-center gap-4">
        <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg">
          <Users className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Gestion des utilisateurs
          </h1>
          <p className="text-gray-600 mt-1">Gérez les comptes et les permissions des utilisateurs</p>
        </div>
      </motion.div>

      {/* FILTER BAR */}
      <motion.div 
        variants={itemVariants}
        className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6"
        style={{ transformStyle: "preserve-3d" }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          {/* Search */}
          <div className="lg:col-span-5 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              placeholder="Rechercher un utilisateur..."
              value={q}
              onChange={e => setQ(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
            />
          </div>

          {/* Role Filter */}
          <div className="lg:col-span-3 relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm appearance-none cursor-pointer"
            >
              {ROLES.map(r => <option key={r} value={r}>{r === "all" ? "Tous les rôles" : r}</option>)}
            </select>
          </div>

          {/* Sort */}
          <div className="lg:col-span-3 relative">
            <SortAsc className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm appearance-none cursor-pointer"
            >
              <option value="createdAt:desc">Plus récents</option>
              <option value="createdAt:asc">Plus anciens</option>
              <option value="prenom:asc">Prénom A→Z</option>
              <option value="prenom:desc">Prénom Z→A</option>
            </select>
          </div>

          {/* Counter */}
          <div className="lg:col-span-1 text-center">
            <motion.div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-2 rounded-xl font-semibold"
              whileHover={{ scale: 1.05 }}
            >
              {meta.total}
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* TABLE */}
      <motion.div 
        variants={itemVariants}
        className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 overflow-hidden"
        style={{ transformStyle: "preserve-3d" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100/80 border-b border-gray-200">
              <tr>
                <th className="p-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Utilisateur</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Contact</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Rôle</th>
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
                    <p className="text-gray-500 mt-2">Chargement des utilisateurs...</p>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center">
                    <div className="text-gray-400 mb-2">👥</div>
                    <p className="text-gray-500 text-lg">Aucun utilisateur trouvé</p>
                    <p className="text-gray-400 text-sm mt-1">Essayez de modifier vos critères de recherche</p>
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {users.map((u, index) => (
                    <motion.tr 
                      key={u._id}
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
                            {u.prenom?.[0]}{u.nom?.[0]}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{u.prenom} {u.nom}</div>
                            <div className="text-sm text-gray-500">{u.entreprise || "Particulier"}</div>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="text-gray-900">{u.email}</div>
                          <div className="text-sm text-gray-500">{u.telephone}</div>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                          u.role === "admin" ? "bg-red-100 text-red-800" :
                          u.role === "commercial" ? "bg-blue-100 text-blue-800" :
                          u.role === "marketing" ? "bg-green-100 text-green-800" :
                          u.role === "support" ? "bg-yellow-100 text-yellow-800" :
                          u.role === "manager" ? "bg-purple-100 text-purple-800" :
                          "bg-gray-100 text-gray-800"
                        }`}>
                          {u.role}
                        </span>
                      </td>

                      <td className="p-4">
                        <motion.span 
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            u.isActive 
                              ? "bg-green-100 text-green-800" 
                              : "bg-red-100 text-red-800"
                          }`}
                          whileHover={{ scale: 1.05 }}
                        >
                          {u.isActive ? (
                            <>
                              <UserCheck className="w-3 h-3 mr-1" />
                              Actif
                            </>
                          ) : (
                            <>
                              <UserX className="w-3 h-3 mr-1" />
                              Inactif
                            </>
                          )}
                        </motion.span>
                      </td>

                      <td className="p-4">
                        <div className="flex gap-2 flex-wrap">
                          <motion.button
                            variants={cardHoverVariants}
                            whileHover="hover"
                            whileTap="tap"
                            onClick={() => setEditUser(u)}
                            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                            Modifier
                          </motion.button>

                          <motion.button
                            variants={cardHoverVariants}
                            whileHover="hover"
                            whileTap="tap"
                            onClick={() => setDeleteUser(u)}
                            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Supprimer
                          </motion.button>

                          <motion.button
                            variants={cardHoverVariants}
                            whileHover="hover"
                            whileTap="tap"
                            onClick={() => toggleActive(u._id, !u.isActive)}
                            className={`inline-flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                              u.isActive
                                ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                                : "bg-green-500 hover:bg-green-600 text-white"
                            }`}
                          >
                            {u.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                            {u.isActive ? "Désactiver" : "Activer"}
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

      {/* PAGINATION */}
      {users.length > 0 && (
        <motion.div variants={itemVariants} className="mt-6">
          <Pagination meta={meta} onChange={(p) => fetchUsers(p)} />
        </motion.div>
      )}

      {/* MODALS */}
      <AnimatePresence>
        {editUser && (
          <EditUserModal
            user={editUser}
            onClose={() => setEditUser(null)}
            onSave={onSaveEdit}
          />
        )}

        {deleteUser && (
          <ConfirmDeleteModal
            title={`Supprimer ${deleteUser.prenom} ${deleteUser.nom} ?`}
            onCancel={() => setDeleteUser(null)}
            onConfirm={() => onDelete(deleteUser._id)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}