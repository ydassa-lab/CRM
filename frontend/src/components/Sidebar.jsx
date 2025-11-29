import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Home, 
  Users, 
  TrendingUp, 
  BarChart3, 
  Target, 
  Ticket, 
  User,
  LogOut,
  ChevronRight,
  Building
} from "lucide-react";
import { useState } from "react";

export default function Sidebar({ role }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [hoveredItem, setHoveredItem] = useState(null);

  const COMMON = [{ 
    name: "Accueil", 
    path: "/", 
    icon: Home 
  }];

const ROLE_LINKS = {
  admin: [
    { name: "Gestion utilisateurs", path: "/admin/users", icon: Users },
    { name: "Gestion clients", path: "/admin/clients", icon: Users },
    { name: "Tickets", path: "/admin/tickets", icon: Ticket }
  ],

  commercial: [
    { name: "Prospects", path: "/commercial/prospects", icon: Target },
    { name: "Opportunités", path: "/commercial/opportunities", icon: TrendingUp },
    { name: "Tickets", path: "/commercial/tickets", icon: Ticket } // <-- nouveau
  ],

  marketing: [
    { name: "Campagnes", path: "/marketing/campaigns", icon: BarChart3 },
    { name: "Automations", path: "/marketing/automations", icon: Building }
  ],

  support: [
    { name: "Tickets", path: "/support/tickets", icon: Ticket } // déjà OK
  ],

  manager: [
    { name: "Analyses", path: "/manager/stats", icon: BarChart3 },
    { name: "Tickets", path: "/manager/tickets", icon: Ticket } // <-- nouveau
  ],

  client: [
    { name: "Mon profil", path: "/client/profile", icon: User },
    { name: "Mes tickets", path: "/client/tickets", icon: Ticket }
  ]
};


  const handleLogout = () => {
    // Logique de déconnexion
    localStorage.removeItem("token");
    navigate("/login");
  };

  const links = [...COMMON, ...(ROLE_LINKS[role] || [])];

  const containerVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        staggerChildren: 0.1,
        duration: 0.5
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      x: -20,
      rotateY: -90 
    },
    visible: { 
      opacity: 1, 
      x: 0,
      rotateY: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    },
    hover: {
      x: 8,
      scale: 1.02,
      rotateY: 5,
      backgroundColor: "rgba(99, 102, 241, 0.1)",
      borderLeftColor: "rgb(99, 102, 241)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25
      }
    }
  };

  const iconVariants = {
    hover: {
      scale: 1.2,
      rotate: 5,
      transition: { type: "spring", stiffness: 400 }
    }
  };

  return (
    <motion.aside 
      className="w-80 bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900 text-white p-6 relative overflow-hidden"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      style={{ 
        transformStyle: "preserve-3d",
        perspective: "1000px"
      }}
    >
      {/* Effet de profondeur 3D */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 transform skew-x-12 -translate-x-20"></div>
      
      {/* Header avec effet 3D */}
      <motion.div 
        className="relative z-10 mb-8"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <motion.h2 
          className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
          whileHover={{ 
            scale: 1.05,
            transition: { type: "spring", stiffness: 300 }
          }}
        >
          CRM Pro
        </motion.h2>
        <motion.div 
          className="flex items-center gap-2 mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-300 capitalize">{role}</span>
        </motion.div>
      </motion.div>

      {/* Navigation */}
      <nav className="space-y-3 relative z-10">
        {links.map((link, index) => {
          const isActive = location.pathname === link.path;
          const isHovered = hoveredItem === link.path;
          
          return (
            <motion.div
              key={link.path}
              variants={itemVariants}
              whileHover="hover"
              onHoverStart={() => setHoveredItem(link.path)}
              onHoverEnd={() => setHoveredItem(null)}
              className="relative"
            >
              <Link to={link.path}>
                <motion.div
                  className={`flex items-center gap-4 p-4 rounded-xl border-l-4 transition-all duration-300 ${
                    isActive 
                      ? "bg-blue-500/20 border-blue-400 shadow-lg shadow-blue-500/25" 
                      : "border-transparent hover:border-blue-400/50"
                  }`}
                  style={{
                    transformStyle: "preserve-3d",
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    variants={iconVariants}
                    className={`p-2 rounded-lg ${
                      isActive 
                        ? "bg-blue-500 text-white" 
                        : "bg-gray-800 text-gray-300"
                    }`}
                  >
                    <link.icon className="w-5 h-5" />
                  </motion.div>
                  
                  <span className="font-medium flex-1">{link.name}</span>
                  
                  <AnimatePresence>
                    {isHovered && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0, x: -10 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0, x: -10 }}
                        transition={{ type: "spring", stiffness: 500 }}
                      >
                        <ChevronRight className="w-4 h-4 text-blue-400" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </Link>

              {/* Effet de surbrillance 3D */}
              {isHovered && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl -z-10"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: "spring", stiffness: 300 }}
                />
              )}
            </motion.div>
          );
        })}
      </nav>

      {/* Déconnexion en bas */}
      <motion.div 
        className="absolute bottom-6 left-6 right-6 z-10"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <motion.button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-200 hover:text-white border border-red-500/30 hover:border-red-400/50 transition-all duration-300 group"
          whileHover={{
            x: 4,
            scale: 1.02,
            backgroundColor: "rgba(239, 68, 68, 0.2)",
            transition: { type: "spring", stiffness: 400 }
          }}
          whileTap={{ scale: 0.95 }}
          style={{ transformStyle: "preserve-3d" }}
        >
          <motion.div
            whileHover={{ 
              rotate: 180,
              transition: { type: "spring", stiffness: 300 }
            }}
            className="p-2 rounded-lg bg-red-500/20 group-hover:bg-red-500/30"
          >
            <LogOut className="w-5 h-5" />
          </motion.div>
          <span className="font-medium flex-1">Déconnexion</span>
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            whileHover={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 500 }}
          >
            <ChevronRight className="w-4 h-4 text-red-400" />
          </motion.div>
        </motion.button>
      </motion.div>

      {/* Effets visuels 3D */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-purple-500/10 to-transparent pointer-events-none"></div>
    </motion.aside>
  );
}