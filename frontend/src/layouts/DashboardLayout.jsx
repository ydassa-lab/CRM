import { motion } from "framer-motion";
import Sidebar from "../components/Sidebar.jsx";
import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function DashboardLayout({ children, role }) {
  const [notifs, setNotifs] = useState([]);
  const navigate = useNavigate();

  // Charger les notifications
  const fetchNotifs = async () => {
    try {
      const res = await api.get("/notifications");
      setNotifs(res.data);
    } catch (err) {
      console.error("Erreur notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  // Nombre de notifications non lues
  const unread = notifs.filter(n => !n.read).length;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 overflow-hidden">
      
      {/* Sidebar */}
      <Sidebar role={role} />

      {/* Main Content */}
      <motion.main
        className="flex-1 p-6 overflow-auto relative"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
      >

        {/* Header avec barre de recherche */}
        <motion.div 
          className="sticky top-0 z-30 mb-8"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 p-4">
            
            {/* Barre de recherche */}
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="w-full pl-10 pr-4 py-3 bg-white/80 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 outline-none"
                />
              </div>
            </div>

            {/* Section droite avec notifications */}
            <div className="flex items-center gap-4 ml-4">
              
              {/* Bouton Notifications */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/notifications")}
                className="relative p-3 bg-gradient-to-br from-gray-100 to-gray-50 hover:from-gray-200 hover:to-gray-100 rounded-xl transition-all shadow-sm"
              >
                <Bell className="w-6 h-6 text-gray-600" />

                {/* 🔴 Badge des non-lus - DESIGN AMELIORE */}
                {unread > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 flex items-center justify-center min-w-[22px] h-5 px-1.5 bg-gradient-to-r from-red-500 to-rose-600 text-white text-xs font-bold rounded-full shadow-lg"
                  >
                    {unread > 9 ? "9+" : unread}
                  </motion.span>
                )}
              </motion.button>

              {/* Avatar utilisateur */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-3 p-2 bg-gradient-to-br from-gray-100 to-gray-50 hover:from-gray-200 hover:to-gray-100 rounded-xl transition-all cursor-pointer shadow-sm"
                onClick={() => navigate("/profile")}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-lg shadow">
                  {role?.[0]?.toUpperCase() || "U"}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold text-gray-900">Mon Compte</p>
                  <p className="text-xs text-gray-500 capitalize">{role}</p>
                </div>
              </motion.div>

            </div>
          </div>
        </motion.div>

        {/* Contenu */}
        <motion.div
          className="h-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {children}
        </motion.div>
      </motion.main>
    </div>
  );
}