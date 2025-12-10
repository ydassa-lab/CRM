// src/pages/manager/ManagerStats.jsx
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api";
import toast from "../../utils/toast.js";
import {
  LineChart, Line, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, PieChart, Pie, Cell, RadialBarChart, RadialBar
} from "recharts";
import {
  TrendingUp,
  Users,
  DollarSign,
  Ticket,
  Target,
  Award,
  Calendar,
  Download,
  RefreshCw,
  BarChart3,
  TrendingDown,
  Activity,
  Shield,
  Filter,
  ChevronDown,
  FileText,
  Briefcase,
  CheckCircle,
  Clock,
  AlertCircle,
  Percent,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

const COLORS = ["#4f46e5", "#06b6d4", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6"];

export default function ManagerStats() {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [timeRange, setTimeRange] = useState("12m");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const res = await api.get("/reports/manager/overview");
      setOverview(res.data);
      toast.success("Données actualisées");
    } catch (err) {
      console.error("Erreur fetch overview", err);
      toast.error("Impossible de récupérer les données.");
    } finally {
      setLoading(false);
    }
  };

  const parseMonthSeries = (arr) => {
    return arr.map(it => ({
      name: `${it._id.year}-${String(it._id.month).padStart(2,"0")}`,
      value: it.count ?? it.revenue ?? it.revenue
    }));
  };

  const downloadFile = async (type) => {
    setExporting(true);
    try {
      const res = await api.get(`/reports/manager/export/${type}`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = `rapport_manager_${new Date().toISOString().split('T')[0]}.${type === "pdf" ? "pdf" : "xlsx"}`;
      link.click();
      
      toast.success(`Export ${type.toUpperCase()} téléchargé`);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Erreur export", err);
      toast.error("Erreur lors de l'export");
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50/30">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"
        />
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50/30">
        <div className="text-center">
          <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Données indisponibles</h2>
          <button
            onClick={fetchOverview}
            className="mt-4 px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // Transform data for charts
  const clientsSeries = parseMonthSeries(overview.clientsByMonth || []);
  const revenueSeries = (overview.revenueByMonth || []).map(it => ({
    name: `${it._id.year}-${String(it._id.month).padStart(2,"0")}`,
    revenue: it.revenue
  }));

  const ticketsStatus = (overview.ticketsByStatus || []).map(it => ({
    name: it._id || "unknown",
    value: it.count
  }));

  const oppsPie = (overview.opportunitiesByStage || []).map(it => ({
    name: it._id || "unknown",
    value: it.count
  }));

  const topPerformers = (overview.topPerformers || []).map((t, i) => ({
    name: t.name || `Utilisateur ${i+1}`,
    revenue: t.revenue || 0,
    won: t.wonCount || 0,
    avatar: t.avatar || `#${i+1}`
  }));

  // Performance indicators
  const stats = [
    {
      title: "Chiffre d'affaires",
      value: new Intl.NumberFormat('fr-FR').format(overview.totalRevenue || 0) + ' Ar',
      icon: DollarSign,
      color: "emerald",
      trend: "+12.5%",
      description: "Total annuel"
    },
    {
      title: "Nouveaux clients",
      value: overview.newClientsCount || 0,
      icon: Users,
      color: "blue",
      trend: "+8.2%",
      description: "Cette année"
    },
    {
      title: "Taux de conversion",
      value: `${Math.round(((overview.wonOpportunities || 0) / (overview.totalOpportunities || 1)) * 100)}%`,
      icon: Percent,
      color: "purple",
      trend: "+5.3%",
      description: "Opportunités"
    },
    {
      title: "Tickets résolus",
      value: overview.resolvedTickets || 0,
      icon: CheckCircle,
      color: "green",
      trend: "+15.7%",
      description: "Ce mois"
    }
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.dataKey === 'revenue' ? 'Chiffre d\'affaires' : entry.dataKey} : {entry.dataKey === 'revenue' ? new Intl.NumberFormat('fr-FR').format(entry.value) + ' Ar' : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' Ar';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-4 md:p-6"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-blue-600" />
              Tableau de bord Manager
            </h1>
            <p className="text-gray-600">
              Vue d'ensemble complète des performances de l'entreprise
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchOverview}
              className="px-4 py-2.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Actualiser
            </motion.button>
          </div>
        </motion.div>

        {/* Statistiques clés */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 + idx * 0.1 }}
                whileHover={{ y: -5 }}
                className={`bg-gradient-to-r ${
                  stat.color === 'emerald' ? 'from-emerald-500 to-green-600' :
                  stat.color === 'blue' ? 'from-blue-500 to-cyan-600' :
                  stat.color === 'purple' ? 'from-purple-500 to-indigo-600' :
                  'from-green-500 to-emerald-600'
                } rounded-2xl p-6 text-white shadow-lg`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">{stat.title}</p>
                    <p className="text-2xl font-bold mt-2">{stat.value}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-sm opacity-90 bg-white/20 px-2 py-1 rounded-full flex items-center gap-1">
                        {stat.trend.includes('+') ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {stat.trend}
                      </span>
                      <span className="text-sm opacity-90">
                        {stat.description}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/20">
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Filtres */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-gray-200"
        >
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Analyse temporelle</h3>
              <p className="text-sm text-gray-600">Sélectionnez la période d'analyse</p>
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-500" />
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="3m">3 derniers mois</option>
                  <option value="6m">6 derniers mois</option>
                  <option value="12m">12 derniers mois</option>
                  <option value="ytd">Année en cours</option>
                </select>
              </div>

              <div className="flex gap-2">
                {["Jour", "Semaine", "Mois", "Trimestre"].map((period) => (
                  <motion.button
                    key={period}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      period === "Mois"
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {period}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Graphiques principaux */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* CA sur 12 mois */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <TrendingUp className="text-blue-600" />
                Évolution du chiffre d'affaires
              </h3>
              <span className="text-sm text-gray-500">
                12 derniers mois
              </span>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => formatCurrency(value).replace(' Ar', '')}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#4f46e5"
                  fill="#4f46e5"
                  fillOpacity={0.2}
                  strokeWidth={2}
                  name="Chiffre d'affaires"
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Nouveaux clients */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Users className="text-blue-600" />
                Acquisition clients
              </h3>
              <span className="text-sm text-gray-500">
                Nouveaux clients par mois
              </span>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={clientsSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  formatter={(value) => [`${value} clients`, "Nombre"]}
                />
                <Bar 
                  dataKey="value" 
                  fill="#06b6d4" 
                  radius={[4, 4, 0, 0]}
                  name="Nouveaux clients"
                />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Deuxième ligne de graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Tickets par statut */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Ticket className="text-blue-600" />
                Répartition des tickets
              </h3>
              <span className="text-sm text-gray-500">
                Par statut
              </span>
            </div>

            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={ticketsStatus}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip />
                <Bar 
                  dataKey="value" 
                  fill="#f59e0b" 
                  radius={[4, 4, 0, 0]}
                  name="Nombre de tickets"
                />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Opportunités par stage */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Target className="text-blue-600" />
                Pipeline commercial
              </h3>
              <span className="text-sm text-gray-500">
                Opportunités par stage
              </span>
            </div>

            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={oppsPie}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => 
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {oppsPie.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name, props) => [
                      `${value} opportunités`,
                      name
                    ]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Top performers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Award className="text-blue-600" />
                Top Performers
              </h3>
              <span className="text-sm text-gray-500">
                Meilleurs commerciaux
              </span>
            </div>

            <div className="space-y-4">
              {topPerformers.slice(0, 5).map((performer, index) => (
                <motion.div
                  key={performer.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      index === 0 ? 'bg-yellow-100 text-yellow-700' :
                      index === 1 ? 'bg-gray-100 text-gray-700' :
                      index === 2 ? 'bg-amber-100 text-amber-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      <span className="font-bold text-sm">{performer.avatar}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{performer.name}</p>
                      <p className="text-sm text-gray-500">{performer.won} opportunités gagnées</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{formatCurrency(performer.revenue)}</p>
                    <p className="text-xs text-gray-500">CA généré</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Export buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Export des rapports</h3>
              <p className="text-gray-600">Téléchargez les rapports détaillés pour analyse approfondie</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => downloadFile("pdf")}
                disabled={exporting}
                className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
              >
                <FileText className="w-5 h-5" />
                {exporting ? "Export..." : "Exporter PDF"}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => downloadFile("excel")}
                disabled={exporting}
                className="px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
              >
                <Download className="w-5 h-5" />
                {exporting ? "Export..." : "Exporter Excel"}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 text-center text-sm text-gray-500"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="w-4 h-4" />
            <span>Données sécurisées et confidentielles</span>
          </div>
          <p>Tableau de bord généré le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR')}</p>
        </motion.div>
      </div>
    </motion.div>
  );
}