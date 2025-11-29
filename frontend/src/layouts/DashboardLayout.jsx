import { motion } from "framer-motion";
import Sidebar from "../components/Sidebar.jsx";

export default function DashboardLayout({ children, role }) {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-hidden">
      {/* Sidebar */}
      <Sidebar role={role} />
      
      {/* Main Content with 3D Animations */}
      <motion.main 
        className="flex-1 p-6 overflow-auto"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ 
          type: "spring",
          stiffness: 100,
          damping: 20,
          duration: 0.5
        }}
        style={{ 
          transformStyle: "preserve-3d",
          perspective: "1000px"
        }}
      >
        <motion.div
          className="h-full"
          whileHover={{ 
            rotateY: 1,
            transition: { type: "spring", stiffness: 200 }
          }}
        >
          {children}
        </motion.div>
      </motion.main>
    </div>
  );
}