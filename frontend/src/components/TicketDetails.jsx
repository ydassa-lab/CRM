// src/components/TicketDetails.jsx
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Send, User, Clock, MessageSquare, CheckCircle, 
  AlertCircle, Wrench, Archive, UserCheck, Tag, 
  Calendar, Loader2, ChevronRight, Shield
} from "lucide-react";
import api from "../services/api";
import toast from "../utils/toast.js";

export default function TicketDetails({ ticket, onClose, onUpdated }) {
  const [data, setData] = useState(ticket);
  const [loading, setLoading] = useState(false);
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/tickets/${ticket._id}`);
      setData(res.data);
    } catch (err) {
      toast.error("Impossible de charger le ticket");
    } finally { setLoading(false); }
  };

  useEffect(()=>{ load(); }, [ticket._id]);

  const addComment = async () => {
    if (!comment.trim()) return;
    setSending(true);
    try {
      const res = await api.post(`/tickets/${ticket._id}/comments`, { message: comment });
      setData(res.data);
      setComment("");
      toast.success("Commentaire ajouté avec succès");
      onUpdated?.();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Erreur lors de l'ajout du commentaire");
    } finally {
      setSending(false);
    }
  };

  const changeStatus = async (status) => {
    try {
      await api.put(`/tickets/${ticket._id}`, { status });
      toast.success("Statut mis à jour");
      load();
      onUpdated?.();
    } catch (err) {
      toast.error("Erreur lors de la mise à jour du statut");
    }
  };

  const assignToMe = async () => {
    try {
      const meId = JSON.parse(localStorage.getItem("user") || "{}").id;
      await api.put(`/tickets/${ticket._id}`, { assignedTo: meId });
      toast.success("Ticket assigné à vous");
      load();
      onUpdated?.();
    } catch (err) { 
      toast.error("Erreur lors de l'assignation"); 
    }
  };

  if (!data) return null;

  const getStatusColor = (status) => {
    switch(status) {
      case "in_progress": return "bg-blue-100 text-blue-800 border-blue-200";
      case "resolved": return "bg-green-100 text-green-800 border-green-200";
      case "closed": return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-orange-100 text-orange-800 border-orange-200";
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case "in_progress": return <Wrench className="w-4 h-4" />;
      case "resolved": return <CheckCircle className="w-4 h-4" />;
      case "closed": return <Archive className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case "in_progress": return "En cours";
      case "resolved": return "Résolu";
      case "closed": return "Fermé";
      default: return "Ouvert";
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
          className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200/50 bg-gradient-to-r from-gray-50 to-blue-50/30">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border ${getStatusColor(data.status)}`}>
                    {getStatusIcon(data.status)}
                    {getStatusLabel(data.status)}
                  </span>
                  <span className="text-sm text-gray-500">
                    Ticket #{data._id?.substring(-8)}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{data.title}</h2>
                <div className="flex flex-wrap items-center gap-4 mt-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="w-4 h-4" />
                    <span>{data.createdBy?.prenom} {data.createdBy?.nom}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(data.createdAt).toLocaleDateString('fr-FR', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</span>
                  </div>
                  {data.assignedTo && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <UserCheck className="w-4 h-4" />
                      <span>Assigné à {data.assignedTo?.prenom} {data.assignedTo?.nom}</span>
                    </div>
                  )}
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
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              </div>
            ) : (
              <>
                {/* Description */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Description
                  </h3>
                  <div className="bg-gray-50/50 rounded-xl p-5 border border-gray-200/50">
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {data.description || "Aucune description fournie"}
                    </p>
                  </div>
                </div>

                {/* Commentaires */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Commentaires ({data.comments?.length || 0})
                    </h3>
                    <div className="text-sm text-gray-500">
                      {data.comments?.length || 0} message{data.comments?.length !== 1 ? 's' : ''}
                    </div>
                  </div>

                  {data.comments?.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50/50 rounded-xl border border-gray-200/50">
                      <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-gray-500">Aucun commentaire pour le moment</p>
                      <p className="text-sm text-gray-400 mt-1">Soyez le premier à commenter</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {data.comments?.map((c, index) => (
                        <motion.div
                          key={c._id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="bg-white rounded-xl border border-gray-200/50 p-4 shadow-sm"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center text-white text-sm font-bold">
                                {c.author?.prenom?.[0]}{c.author?.nom?.[0]}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {c.author?.prenom} {c.author?.nom}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {new Date(c.createdAt).toLocaleString('fr-FR', {
                                    day: 'numeric',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="pl-12">
                            <p className="text-gray-700 whitespace-pre-wrap">{c.message}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Ajouter un commentaire */}
                  <div className="mt-6">
                    <div className="relative">
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Écrivez votre commentaire ici..."
                        rows={3}
                        className="w-full border border-gray-300/50 rounded-xl p-4 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all resize-none pr-12"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && e.ctrlKey) {
                            addComment();
                          }
                        }}
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={addComment}
                        disabled={!comment.trim() || sending}
                        className="absolute bottom-3 right-3 p-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {sending ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Send className="w-5 h-5" />
                        )}
                      </motion.button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 ml-1">
                      Appuyez sur Ctrl+Enter pour envoyer rapidement
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Actions Footer */}
          <div className="p-6 border-t border-gray-200/50 bg-gradient-to-r from-gray-50 to-blue-50/30">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => changeStatus("in_progress")}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <Wrench className="w-4 h-4" />
                  Prendre en charge
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => changeStatus("resolved")}
                  className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Marquer comme résolu
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => changeStatus("closed")}
                  className="px-5 py-2.5 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <Archive className="w-4 h-4" />
                  Fermer le ticket
                </motion.button>
              </div>

              <div className="flex flex-wrap gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={assignToMe}
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <UserCheck className="w-4 h-4" />
                  M'assigner
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Fermer
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}