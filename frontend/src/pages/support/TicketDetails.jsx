import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "react-router-dom";
import axios from "../../services/api";
import { ArrowLeft, Send, File, User, Calendar, MessageSquare, Paperclip, Clock, CheckCircle, AlertCircle, XCircle, Loader2, Download, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function TicketDetails({ role }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [fileName, setFileName] = useState("");

  const fetchTicket = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/tickets/${id}`);
      setTicket(res.data);
    } catch (err) {
      console.error("Erreur fetch ticket:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, []);

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

  const sendReply = async () => {
    if (!message.trim()) return;

    setSending(true);
    const formData = new FormData();
    formData.append("message", message.trim());
    if (file) formData.append("attachment", file);

    try {
      await axios.post(`/tickets/${id}/reply`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setMessage("");
      setFile(null);
      setFileName("");
      fetchTicket();
    } catch (err) {
      console.error("Erreur réponse:", err);
    } finally {
      setSending(false);
    }
  };

  const changeStatus = async (newStatus) => {
    try {
      await axios.put(`/tickets/${id}/status`, { status: newStatus });
      fetchTicket();
    } catch (err) {
      console.error("Erreur changement statut:", err);
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
      case "Ouvert": return "bg-orange-50 text-orange-700 border-orange-200";
      case "En cours": return "bg-blue-50 text-blue-700 border-blue-200";
      case "Résolu": return "bg-green-50 text-green-700 border-green-200";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 bg-gradient-to-br from-gray-50 via-white to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement du ticket...</p>
        </div>
      </div>
    );
  }

  if (!ticket) return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      <div className="text-center py-16">
        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">Ticket introuvable</h2>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all"
        >
          <ArrowLeft className="w-4 h-4 inline mr-2" />
          Retour aux tickets
        </button>
      </div>
    </div>
  );

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
            <motion.button
              whileHover={{ scale: 1.05, x: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <ArrowLeft className="w-5 h-5" />
              Retour
            </motion.button>
            
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Détails du Ticket
                </h1>
                <p className="text-gray-600 mt-1">Ticket #{id.substring(-8)}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(ticket.status)}`}>
              {getStatusIcon(ticket.status)}
              {ticket.status}
            </span>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Ticket Info */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Ticket Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">{ticket.title}</h2>
                  
                  <div className="flex flex-wrap items-center gap-4 text-gray-600">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span className="font-medium">{ticket.createdBy?.prenom} {ticket.createdBy?.nom}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(ticket.createdAt).toLocaleString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-200/50">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{ticket.message}</p>
                </div>
              </div>

              {ticket.attachment && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Pièce jointe</h3>
                  <a
                    href={`${axios.defaults.baseURL}/uploads/${ticket.attachment}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-blue-700 rounded-xl transition-all group"
                  >
                    <File className="w-5 h-5" />
                    <div>
                      <p className="font-medium">Fichier joint</p>
                      <p className="text-sm text-blue-600 opacity-75">Cliquez pour télécharger</p>
                    </div>
                    <Download className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              )}

              {/* Admin / Support status change */}
              {["admin", "support"].includes(role) && (
                <div className="pt-6 border-t border-gray-200/50">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Changer le statut</h3>
                  <div className="flex flex-wrap gap-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => changeStatus("En cours")}
                      className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-amber-600 text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center gap-2"
                    >
                      <Clock className="w-4 h-4" />
                      En cours
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => changeStatus("Résolu")}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Résolu
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => changeStatus("Fermé")}
                      className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Fermé
                    </motion.button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Timeline replies */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Historique des réponses</h3>
                <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                  {ticket.responses?.length || 0} réponse{ticket.responses?.length !== 1 ? 's' : ''}
                </div>
              </div>

              {ticket.responses.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Aucune réponse pour le moment.</p>
                  <p className="text-sm text-gray-400 mt-1">Soyez le premier à répondre</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {ticket.responses.map((r, index) => (
                    <motion.div
                      key={r._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-l-2 border-blue-500 pl-4 py-4 relative"
                    >
                      <div className="absolute -left-2 top-6 w-3 h-3 bg-blue-500 rounded-full"></div>
                      
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center text-white text-sm font-bold">
                            {r.postedBy?.prenom?.[0]}{r.postedBy?.nom?.[0]}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {r.postedBy?.prenom} {r.postedBy?.nom}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(r.createdAt).toLocaleString('fr-FR', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="pl-11">
                        <p className="text-gray-700 whitespace-pre-wrap mb-3">{r.message}</p>
                        
                        {r.attachment && (
                          <a
                            href={`${axios.defaults.baseURL}/uploads/${r.attachment}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg transition-all text-sm"
                          >
                            <Paperclip className="w-4 h-4" />
                            Fichier joint
                            <Download className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Right Column - Reply Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Reply box */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden sticky top-6">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Répondre</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Votre message
                  </label>
                  <textarea
                    placeholder="Écrivez votre réponse ici..."
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all resize-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.ctrlKey) {
                        sendReply();
                      }
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pièce jointe (optionnelle)
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      disabled={sending}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                      id="reply-file-upload"
                    />
                    <label
                      htmlFor="reply-file-upload"
                      className={`flex flex-col items-center justify-center w-full px-4 py-6 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                        sending 
                          ? 'border-gray-300 bg-gray-50' 
                          : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50/30'
                      }`}
                    >
                      {fileName ? (
                        <div className="flex items-center gap-3">
                          <Paperclip className="w-5 h-5 text-blue-500" />
                          <span className="text-gray-700 truncate max-w-xs">{fileName}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFile();
                            }}
                            className="p-1 hover:bg-gray-100 rounded-lg"
                          >
                            <XCircle className="w-4 h-4 text-gray-500" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <Paperclip className="w-8 h-8 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600">Cliquez pour ajouter un fichier</p>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200/50">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={sendReply}
                    disabled={sending || !message.trim()}
                    className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {sending ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Envoyer la réponse
                      </>
                    )}
                  </motion.button>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Appuyez sur Ctrl+Enter pour envoyer rapidement
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Ticket Info */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Créateur</p>
                  <p className="font-medium text-gray-900">{ticket.createdBy?.prenom} {ticket.createdBy?.nom}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 mb-1">Date de création</p>
                  <p className="font-medium text-gray-900">
                    {new Date(ticket.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 mb-1">Heure de création</p>
                  <p className="font-medium text-gray-900">
                    {new Date(ticket.createdAt).toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 mb-1">ID du ticket</p>
                  <p className="font-medium text-gray-900 font-mono text-sm">{id}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}