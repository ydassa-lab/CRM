import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "../../services/api";
import { MessageSquare, Filter, Search, RefreshCw, X, Paperclip, Calendar, User, AlertCircle, CheckCircle, Clock, XCircle, Eye, ChevronRight, Send, Loader2, ChevronLeft, ChevronRight as ChevronRightIcon } from "lucide-react";

export default function SupportTickets() {
  const [tickets, setTickets] = useState([]);
  const [allTickets, setAllTickets] = useState([]);
  const [filter, setFilter] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ticketsPerPage = 6;

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/tickets");
      setAllTickets(res.data);
      setTickets(res.data);
      setCurrentPage(1); // Reset à la première page après rafraîchissement
    } catch (err) {
      console.error("Erreur fetch tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // Filtrer les tickets localement
  useEffect(() => {
    if (!search.trim() && !filter) {
      setTickets(allTickets);
    } else {
      const filtered = allTickets.filter(ticket => {
        if (filter && ticket.status !== filter) return false;
        
        if (search.trim()) {
          const searchTerm = search.toLowerCase().trim();
          const matchesSearch = 
            ticket.title?.toLowerCase().includes(searchTerm) ||
            ticket.message?.toLowerCase().includes(searchTerm) ||
            ticket.createdBy?.prenom?.toLowerCase().includes(searchTerm) ||
            ticket.createdBy?.nom?.toLowerCase().includes(searchTerm) ||
            ticket.status?.toLowerCase().includes(searchTerm);
          
          if (!matchesSearch) return false;
        }
        
        return true;
      });
      
      setTickets(filtered);
      setCurrentPage(1); // Retour à la première page après filtrage
    }
  }, [search, filter, allTickets]);

  // Pagination logic
  const indexOfLastTicket = currentPage * ticketsPerPage;
  const indexOfFirstTicket = indexOfLastTicket - ticketsPerPage;
  const currentTickets = tickets.slice(indexOfFirstTicket, indexOfLastTicket);
  const totalPages = Math.ceil(tickets.length / ticketsPerPage);

  const getStatusIcon = (status) => {
    switch(status) {
      case "Ouvert": return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case "En cours": return <Clock className="w-4 h-4 text-blue-500" />;
      case "Résolu": return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <XCircle className="w-4 h-4 text-gray-500" />;
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

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
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
                Support Tickets
              </h1>
              <p className="text-gray-600 mt-1">Gérez et répondez aux demandes de support</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-xl font-medium">
              {tickets.length} ticket{tickets.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Filtres et Recherche */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher par titre, description, client..."
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
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/80 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 appearance-none cursor-pointer"
              >
                <option value="">Tous les statuts</option>
                <option value="Ouvert">Ouverts</option>
                <option value="En cours">En cours</option>
                <option value="Résolu">Résolus</option>
                <option value="Fermé">Fermés</option>
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

        {/* Indicateurs de filtres actifs */}
        {(search || filter || tickets.length > ticketsPerPage) && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap items-center gap-3 text-sm mb-4"
          >
            <div className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg">
              {tickets.length} ticket{tickets.length !== 1 ? 's' : ''} trouvé{tickets.length !== 1 ? 's' : ''}
              {tickets.length > ticketsPerPage && ` • Page ${currentPage}/${totalPages}`}
            </div>
            {search && (
              <div className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg flex items-center gap-2">
                <Search className="w-3 h-3" />
                "{search}"
                <button onClick={() => setSearch("")} className="ml-1 text-gray-500 hover:text-gray-700">
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            {filter && (
              <div className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg flex items-center gap-2">
                <Filter className="w-3 h-3" />
                {filter}
                <button onClick={() => setFilter("")} className="ml-1 text-gray-500 hover:text-gray-700">
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            {(search || filter) && (
              <button
                onClick={() => {
                  setSearch("");
                  setFilter("");
                }}
                className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
              >
                Effacer tous les filtres
              </button>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* LISTE DES TICKETS */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 bg-gradient-to-r from-gray-200/50 to-gray-300/50 rounded-2xl animate-pulse" />
            ))}
          </motion.div>
        ) : tickets.length === 0 ? (
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
              {search || filter ? "Aucun ticket trouvé" : "Aucun ticket"}
            </h3>
            <p className="text-gray-500">
              {search || filter 
                ? "Essayez de modifier vos critères de recherche" 
                : "Aucun ticket à afficher pour le moment"}
            </p>
            {(search || filter) && (
              <button
                onClick={() => {
                  setSearch("");
                  setFilter("");
                }}
                className="mt-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                Réinitialiser les filtres
              </button>
            )}
          </motion.div>
        ) : (
          <>
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
            >
              {currentTickets.map((t, index) => (
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
                  className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden cursor-pointer group"
                  onClick={() => setSelectedTicket(t)}
                >
                  {/* Status Indicator */}
                  <div className={`absolute top-0 right-0 w-16 h-16 overflow-hidden`}>
                    <div className={`absolute -top-8 -right-8 w-32 h-32 rounded-full ${getStatusColor(t.status).split(' ')[0]} opacity-10`}></div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          {getStatusIcon(t.status)}
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(t.status)}`}>
                            {t.status}
                          </span>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {t.title}
                        </h3>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-all" />
                    </div>

                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {t.message}
                    </p>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <User className="w-4 h-4" />
                        <span>
                          {t.createdBy?.prenom} {t.createdBy?.nom}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(t.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <MessageSquare className="w-4 h-4" />
                        <span>{t.responses?.length || 0} réponse{t.responses?.length !== 1 ? 's' : ''}</span>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        Ticket #{t._id?.substring(-6)}
                      </span>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTicket(t);
                        }}
                      >
                        <Eye className="w-4 h-4 inline mr-2" />
                        Gérer
                      </motion.button>
                    </div>
                  </div>

                  {/* Hover Effect Line */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                </motion.div>
              ))}
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center mt-8"
              >
                <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-3">
                  <motion.button
                    whileHover={{ scale: 1.05, x: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    className={`p-2.5 rounded-xl transition-all ${
                      currentPage === 1 
                        ? 'text-gray-400 cursor-not-allowed' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </motion.button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                      <motion.button
                        key={number}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => paginate(number)}
                        className={`w-10 h-10 rounded-xl font-medium transition-all ${
                          currentPage === number
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {number}
                      </motion.button>
                    ))}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05, x: 2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={nextPage}
                    disabled={currentPage === totalPages}
                    className={`p-2.5 rounded-xl transition-all ${
                      currentPage === totalPages 
                        ? 'text-gray-400 cursor-not-allowed' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <ChevronRightIcon className="w-5 h-5" />
                  </motion.button>

                  <div className="ml-4 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-lg text-sm">
                    {indexOfFirstTicket + 1}-{Math.min(indexOfLastTicket, tickets.length)} sur {tickets.length}
                  </div>
                </div>
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>

      {selectedTicket && (
        <TicketManageModal 
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          refresh={fetchTickets}
        />
      )}
    </div>
  );
}



/* --------------------------------------------------------
   MODAL POUR RÉPONDRE / CHANGER STATUT / ASSIGNER AGENT
---------------------------------------------------------*/
function TicketManageModal({ ticket, onClose, refresh }) {
  const [response, setResponse] = useState("");
  const [status, setStatus] = useState(ticket.status);
  const [sending, setSending] = useState(false);
  const [updating, setUpdating] = useState(false);

  const sendReply = async () => {
    if (!response.trim()) return;
    setSending(true);
    try {
      await axios.post(`/tickets/${ticket._id}/reply`, { message: response });
      setResponse("");
      refresh();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const updateStatus = async () => {
    setUpdating(true);
    try {
      await axios.put(`/tickets/${ticket._id}/status`, { status });
      refresh();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case "Ouvert": return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case "En cours": return <Clock className="w-4 h-4 text-blue-500" />;
      case "Résolu": return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <XCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case "Ouvert": return "bg-orange-50 text-orange-700";
      case "En cours": return "bg-blue-50 text-blue-700";
      case "Résolu": return "bg-green-50 text-green-700";
      default: return "bg-gray-50 text-gray-700";
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
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200/50 bg-gradient-to-r from-gray-50 to-blue-50/30">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${getStatusColor(ticket.status)}`}>
                    {getStatusIcon(ticket.status)}
                    {ticket.status}
                  </span>
                  <span className="text-sm text-gray-500">
                    Ticket #{ticket._id?.substring(-8)}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{ticket.title}</h2>
                <div className="flex items-center gap-3 mt-2">
                  <span className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="w-4 h-4" />
                    {ticket.createdBy?.prenom} {ticket.createdBy?.nom}
                  </span>
                  <span className="text-sm text-gray-600">
                    {new Date(ticket.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </motion.button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {/* Ticket Message */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
              <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-200/50">
                <p className="text-gray-700 whitespace-pre-wrap">{ticket.message}</p>
              </div>
            </div>

            {/* Réponses */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Réponses ({ticket.responses?.length || 0})
              </h3>
              {ticket.responses.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Aucune réponse pour le moment.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {ticket.responses.map((r, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-white rounded-xl border border-gray-200/50 p-4 shadow-sm"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center text-white text-sm font-bold">
                            {r.postedBy?.prenom?.[0] || "A"}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {r.postedBy?.prenom} {r.postedBy?.nom}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(r.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700 pl-11">{r.message}</p>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Reply Textarea */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Répondre</h3>
              <textarea
                rows={4}
                placeholder="Écrivez votre réponse ici..."
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                className="w-full border border-gray-300/50 rounded-xl p-4 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all resize-none"
              />
            </div>

            {/* Status Update */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Changer le statut</h3>
              <div className="flex flex-wrap gap-3">
                {["Ouvert", "En cours", "Résolu", "Fermé"].map((stat) => (
                  <button
                    key={stat}
                    onClick={() => setStatus(stat)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      status === stat
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {stat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200/50 bg-gray-50/30">
            <div className="flex items-center justify-between">
              <button
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-100 transition-colors font-medium"
                disabled={sending || updating}
              >
                Fermer
              </button>
              
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={updateStatus}
                  disabled={sending || updating}
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {updating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Mise à jour...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Mettre statut à jour
                    </>
                  )}
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={sendReply}
                  disabled={sending || updating || !response.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {sending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Envoi...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Répondre
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}