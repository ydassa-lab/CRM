import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "../../services/api";
import { MessageSquare, Plus, FileDown, Search, Filter, RefreshCw, X, Paperclip, Calendar, AlertCircle, CheckCircle, Clock, Download, FileText, FileSpreadsheet } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ClientTickets() {
  const [tickets, setTickets] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();

  const downloadFile = async (id, type) => {
    try {
      const res = await axios.get(`/tickets/${id}/export/${type}`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = `ticket_${id}.${type === "excel" ? "xlsx" : type}`;
      link.click();
    } catch (err) {
      console.error("Erreur export:", err);
    }
  };

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/tickets");
      setTickets(res.data);
    } catch (err) {
      console.error("Erreur fetch tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const filteredTickets = tickets.filter(ticket => {
    if (statusFilter !== "all" && ticket.status !== statusFilter) return false;
    if (search && !ticket.title.toLowerCase().includes(search.toLowerCase()) && 
        !ticket.message.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  const getStatusIcon = (status) => {
    switch(status) {
      case "Ouvert": return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case "En cours": return <Clock className="w-4 h-4 text-blue-500" />;
      case "Résolu": return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case "Ouvert": return "bg-orange-50 text-orange-700 border-orange-200";
      case "En cours": return "bg-blue-50 text-blue-700 border-blue-200";
      case "Résolu": return "bg-green-50 text-green-700 border-green-200";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      
      {/* Header */}
      <motion.div 
        className="mb-8"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Mes Tickets
              </h1>
              <p className="text-gray-600 mt-1">Gérez toutes vos demandes de support</p>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAdd(true)}
            className="group relative overflow-hidden px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="absolute inset-0 bg-white/20 translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
            <div className="relative flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Nouveau ticket
            </div>
          </motion.button>
        </div>

        {/* Filtres et Recherche */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher par titre ou description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/80 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
          </div>
          
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/80 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 appearance-none cursor-pointer"
              >
                <option value="all">Tous les statuts</option>
                <option value="Ouvert">Ouverts</option>
                <option value="En cours">En cours</option>
                <option value="Résolu">Résolus</option>
              </select>
            </div>
            <motion.button
              whileHover={{ scale: 1.05, rotate: 180 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchTickets}
              className="p-3 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all"
              title="Rafraîchir"
            >
              <RefreshCw className="w-5 h-5 text-gray-600" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Liste tickets */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-64 bg-gradient-to-r from-gray-200/50 to-gray-300/50 rounded-2xl animate-pulse" />
            ))}
          </motion.div>
        ) : filteredTickets.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full mx-auto mb-6 flex items-center justify-center">
              <MessageSquare className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">
              {search || statusFilter !== 'all' ? "Aucun ticket trouvé" : "Aucun ticket"}
            </h3>
            <p className="text-gray-500">
              {search || statusFilter !== 'all' 
                ? "Essayez de modifier vos critères de recherche" 
                : "Créez votre premier ticket pour commencer"}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {filteredTickets.map((t, index) => (
              <motion.div
                key={t._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ 
                  y: -4,
                  scale: 1.02,
                  boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)"
                }}
                className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{t.title}</h3>
                      <div className="flex items-center gap-3 mt-2">
                        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusColor(t.status)}`}>
                          {getStatusIcon(t.status)}
                          {t.status}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      #{t._id?.substring(-6)}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 mb-6 line-clamp-2">
                    {t.message}
                  </p>

                  {/* Infos */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>Créé le {new Date(t.createdAt).toLocaleDateString()}</span>
                    </div>
                    
                    {t.attachment && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Paperclip className="w-4 h-4" />
                        <a
                          href={`${axios.defaults.baseURL}/uploads/${t.attachment}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 hover:underline"
                        >
                          Pièce jointe disponible
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
                    {/* Export Buttons */}
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => downloadFile(t._id, "pdf")}
                        className="p-2 bg-gradient-to-r from-red-100 to-red-50 hover:from-red-200 hover:to-red-100 text-red-600 rounded-lg transition-all"
                        title="Export PDF"
                      >
                        <FileText className="w-4 h-4" />
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => downloadFile(t._id, "csv")}
                        className="p-2 bg-gradient-to-r from-green-100 to-green-50 hover:from-green-200 hover:to-green-100 text-green-600 rounded-lg transition-all"
                        title="Export CSV"
                      >
                        <Download className="w-4 h-4" />
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => downloadFile(t._id, "excel")}
                        className="p-2 bg-gradient-to-r from-blue-100 to-blue-50 hover:from-blue-200 hover:to-blue-100 text-blue-600 rounded-lg transition-all"
                        title="Export Excel"
                      >
                        <FileSpreadsheet className="w-4 h-4" />
                      </motion.button>
                    </div>

                    <div className="flex-1"></div>

                    {/* Voir les réponses */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate(`/client/tickets/${t._id}`)}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Voir les réponses
                    </motion.button>
                  </div>
                </div>

                {/* Hover Effect Line */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal d'ajout */}
      {showAdd && (
        <AddTicketModal
          onClose={() => setShowAdd(false)}
          onSuccess={fetchTickets}
        />
      )}
    </div>
  );
}

/* ============================================
   MODAL AJOUT TICKET - TAILLE REDUITE
============================================= */
function AddTicketModal({ onClose, onSuccess }) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState("Normal");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const removeFile = () => {
    setFile(null);
    setFileName("");
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("message", message);
    formData.append("priority", priority);

    if (file) formData.append("attachment", file);

    try {
      await axios.post("/tickets", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      onSuccess();
      onClose();
    } catch (err) {
      console.error("Erreur création ticket:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Nouveau Ticket</h2>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded"
                disabled={loading}
              >
                <X className="w-5 h-5 text-gray-500" />
              </motion.button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={submit} className="p-5">
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titre *
                </label>
                <input
                  type="text"
                  placeholder="Titre du ticket"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={loading}
                  className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  placeholder="Décrivez votre problème..."
                  required
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={loading}
                  className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priorité
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["Faible", "Normal", "Urgent"].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      disabled={loading}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        priority === p
                          ? p === "Urgent" 
                            ? 'bg-red-500 text-white' 
                            : p === "Normal"
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pièce jointe
                </label>
                <div className="relative">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    disabled={loading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className={`flex flex-col items-center justify-center w-full px-3 py-4 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
                      loading 
                        ? 'border-gray-300 bg-gray-50' 
                        : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50/30'
                    }`}
                  >
                    {fileName ? (
                      <div className="flex items-center gap-2">
                        <Paperclip className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-gray-700 truncate max-w-xs">{fileName}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile();
                          }}
                          className="p-0.5 hover:bg-gray-100 rounded"
                        >
                          <X className="w-3 h-3 text-gray-500" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Paperclip className="w-5 h-5 text-gray-400 mb-1" />
                        <p className="text-xs text-gray-600">Ajouter un fichier</p>
                      </>
                    )}
                  </label>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Annuler
              </motion.button>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={loading || !title.trim() || !message.trim()}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-sm font-medium hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Création...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Créer
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}