import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Bell, BellRing, CheckCircle, AlertTriangle, 
  Info, ExternalLink, Clock, Sparkles, 
  Filter, RefreshCw, Mail, MessageSquare,
  Calendar, User, Tag
} from "lucide-react";
import api from "../../services/api";

export default function Notifications() {
  const [notifs, setNotifs] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/notifications");
      setNotifs(res.data);
    } catch (err) {
      console.error("Erreur chargement notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      fetchData();
    } catch (err) {
      console.error("Erreur marquer comme lu:", err);
    }
  };

  const getNotificationIcon = (type) => {
    switch(type?.toLowerCase()) {
      case 'warning':
      case 'alert': 
        return <AlertTriangle className="w-6 h-6 text-amber-500" />;
      case 'success': 
        return <CheckCircle className="w-6 h-6 text-emerald-500" />;
      case 'info':
      default: 
        return <BellRing className="w-6 h-6 text-blue-500" />;
    }
  };

  const getNotificationBg = (type, read) => {
    if (!read) {
      return "bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500";
    }
    
    switch(type?.toLowerCase()) {
      case 'warning': 
        return "bg-gradient-to-r from-amber-50/30 to-orange-50/30 border-l-4 border-amber-400";
      case 'success': 
        return "bg-gradient-to-r from-emerald-50/30 to-green-50/30 border-l-4 border-emerald-400";
      default: 
        return "bg-gradient-to-r from-gray-50/30 to-slate-50/30 border-l-4 border-gray-300";
    }
  };

  const getNotificationBadge = (type) => {
    switch(type?.toLowerCase()) {
      case 'warning': return "bg-amber-100 text-amber-800";
      case 'success': return "bg-emerald-100 text-emerald-800";
      case 'alert': return "bg-rose-100 text-rose-800";
      default: return "bg-blue-100 text-blue-800";
    }
  };

  const openLink = (link) => {
    if (!link) return;

    try {
      if (link.startsWith("http://") || link.startsWith("https://")) {
        const url = new URL(link);
        return navigate(url.pathname);
      }

      const clean = link.startsWith("/") ? link : "/" + link;
      return navigate(clean);
    } catch (err) {
      console.error("Invalid link:", link, err);
    }
  };

  const filteredNotifs = notifs.filter(n => {
    if (filter === "all") return true;
    if (filter === "unread") return !n.read;
    if (filter === "read") return n.read;
    return true;
  });

  const unreadCount = notifs.filter(n => !n.read).length;

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-slate-50 via-white to-blue-50/20">
      
      {/* Glass Header */}
      <motion.div 
        className="mb-8"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl blur-xl opacity-30"></div>
                <div className="relative p-4 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-2xl">
                  <Bell className="w-10 h-10 text-white" />
                </div>
              </div>
              
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-slate-800 bg-clip-text text-transparent">
                  Notifications
                </h1>
                <p className="text-gray-600 mt-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Restez informé de toutes vos activités importantes
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="pl-12 pr-8 py-3.5 bg-white/90 border border-gray-300/50 rounded-2xl focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer shadow-sm"
                >
                  <option value="all">Toutes les notifications</option>
                  <option value="unread">
                    Non lues {unreadCount > 0 && `(${unreadCount})`}
                  </option>
                  <option value="read">Lues</option>
                </select>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05, rotate: 180 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchData}
                className="p-3.5 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl hover:from-gray-200 hover:to-gray-300 transition-all shadow-sm"
                title="Rafraîchir"
              >
                <RefreshCw className="w-5 h-5 text-gray-600" />
              </motion.button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <motion.div 
              whileHover={{ y: -4 }}
              className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-200/50 rounded-2xl p-6 backdrop-blur-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total</p>
                  <p className="text-3xl font-bold text-gray-900">{notifs.length}</p>
                </div>
                <div className="p-3 bg-blue-100/50 rounded-xl">
                  <Bell className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              whileHover={{ y: -4 }}
              className="bg-gradient-to-r from-orange-500/10 to-amber-600/10 border border-amber-200/50 rounded-2xl p-6 backdrop-blur-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Non lues</p>
                  <p className="text-3xl font-bold text-gray-900">{unreadCount}</p>
                </div>
                <div className="p-3 bg-amber-100/50 rounded-xl">
                  <div className="relative">
                    <Bell className="w-6 h-6 text-amber-600" />
                    {unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              whileHover={{ y: -4 }}
              className="bg-gradient-to-r from-emerald-500/10 to-green-600/10 border border-emerald-200/50 rounded-2xl p-6 backdrop-blur-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Lues</p>
                  <p className="text-3xl font-bold text-gray-900">{notifs.length - unreadCount}</p>
                </div>
                <div className="p-3 bg-emerald-100/50 rounded-xl">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Notifications Grid */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-48 bg-gradient-to-r from-gray-200/30 to-gray-300/30 rounded-2xl animate-pulse" />
            ))}
          </motion.div>
        ) : filteredNotifs.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-32 h-32 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full mx-auto mb-8 flex items-center justify-center relative">
              <Bell className="w-16 h-16 text-gray-400" />
              <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-amber-400" />
            </div>
            <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
              {filter === "unread" ? "Tout est à jour !" : 
               filter === "read" ? "Aucune notification lue" : 
               "Pas de notifications"}
            </h3>
            <p className="text-gray-500 text-lg max-w-md mx-auto">
              {filter !== "all" 
                ? "Aucune notification ne correspond à ce filtre" 
                : "Vous serez notifié ici dès qu'il y aura du nouveau"}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {filteredNotifs.map((n, index) => (
              <motion.div
                key={n._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ 
                  y: -6,
                  scale: 1.02,
                  boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)"
                }}
                className={`rounded-2xl shadow-xl overflow-hidden ${getNotificationBg(n.type, n.read)} relative`}
              >
                {/* Floating Action Button */}
                {!n.read && (
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => markRead(n._id)}
                    className="absolute top-4 right-4 p-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all z-10"
                    title="Marquer comme lu"
                  >
                    <CheckCircle className="w-5 h-5" />
                  </motion.button>
                )}

                <div className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    {/* Icon with Glow Effect */}
                    <div className="relative">
                      <div className={`absolute inset-0 ${!n.read ? 'bg-blue-500/20' : 'bg-gray-400/20'} rounded-xl blur-md`}></div>
                      <div className="relative p-3 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm">
                        {getNotificationIcon(n.type)}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className={`text-xl font-bold ${!n.read ? 'text-gray-900' : 'text-gray-700'} mb-1`}>
                            {n.title}
                          </h3>
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getNotificationBadge(n.type)}`}>
                              {n.type || 'Notification'}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              {new Date(n.createdAt).toLocaleString('fr-FR', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-600 mb-6 leading-relaxed">
                        {n.message}
                      </p>

                      {/* Interactive Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200/50">
                        <div className="flex items-center gap-4">
                          {n.link && (
                            <motion.button
                              whileHover={{ scale: 1.05, x: 2 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => openLink(n.link)}
                              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all group"
                            >
                              <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                              <span className="font-medium">Ouvrir</span>
                            </motion.button>
                          )}
                          
                          {!n.read && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => markRead(n._id)}
                              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:bg-gray-200 transition-all"
                            >
                              <CheckCircle className="w-4 h-4" />
                              <span className="font-medium">Marquer comme lu</span>
                            </motion.button>
                          )}
                        </div>
                        
                        {/* Status Indicator */}
                        {!n.read ? (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                            <span className="text-xs font-medium text-blue-600">Nouveau</span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">
                            Lu • {new Date(n.createdAt).toLocaleDateString('fr-FR')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Decorative Elements */}
                {!n.read && (
                  <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden">
                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-r from-blue-500/10 to-indigo-600/10 rounded-full"></div>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State Illustration */}
      {!loading && filteredNotifs.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-4 px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full">
            <MessageSquare className="w-5 h-5 text-gray-500" />
            <span className="text-gray-600">
              Vous serez notifié ici dès qu'il y aura du nouveau
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
}