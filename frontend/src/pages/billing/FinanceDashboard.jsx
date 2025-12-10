import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api";
import toast from "../../utils/toast.js";

// 📊 Recharts
import {
  LineChart, Line,
  BarChart, Bar,
  PieChart, Pie, Cell,
  AreaChart, Area,
  Tooltip, Legend,
  CartesianGrid, XAxis, YAxis,
  ResponsiveContainer
} from "recharts";

// Icônes
import {
  TrendingUp,
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
  Users,
  Calendar,
  Download,
  RefreshCw,
  FileText,
  BarChart3,
  TrendingDown,
  Activity,
  CreditCard,
  Filter,
  ChevronDown,
  Target,
  Percent
} from "lucide-react";

export default function FinanceDashboard() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("month");
  const [stats, setStats] = useState({
    totalRevenue: 0,
    avgInvoice: 0,
    paidInvoices: 0,
    pendingInvoices: 0,
    cancelledInvoices: 0,
    paidPercentage: 0
  });

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await api.get("/invoices");
      setInvoices(res.data);
      calculateStats(res.data);
    } catch (err) {
      console.error("Erreur chargement factures:", err);
      toast.error("Impossible de charger les données financières");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const totalRevenue = data.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
    const paidInvoices = data.filter(i => i.status === "paid").length;
    const pendingInvoices = data.filter(i => i.status === "pending").length;
    const cancelledInvoices = data.filter(i => i.status === "cancelled").length;
    const paidPercentage = data.length > 0 ? (paidInvoices / data.length) * 100 : 0;
    const avgInvoice = data.length > 0 ? totalRevenue / data.length : 0;

    setStats({
      totalRevenue,
      avgInvoice,
      paidInvoices,
      pendingInvoices,
      cancelledInvoices,
      paidPercentage: Math.round(paidPercentage)
    });
  };

  // 📌 Revenue par mois
  const getMonthlyData = () => {
    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: new Date(0, i).toLocaleString("fr", { month: "short" }),
      total: 0,
      paid: 0,
      pending: 0
    }));

    invoices.forEach(inv => {
      const m = new Date(inv.createdAt).getMonth();
      monthlyData[m].total += inv.totalAmount;
      if (inv.status === "paid") monthlyData[m].paid += inv.totalAmount;
      if (inv.status === "pending") monthlyData[m].pending += inv.totalAmount;
    });

    return monthlyData;
  };

  // 📌 Revenue par semaine (4 dernières semaines)
  const getWeeklyData = () => {
    const weeklyData = Array.from({ length: 4 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (7 * (3 - i)));
      return {
        week: `S${i + 1}`,
        total: 0,
        date: date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })
      };
    });

    invoices.forEach(inv => {
      const invDate = new Date(inv.createdAt);
      const now = new Date();
      const diffDays = Math.floor((now - invDate) / (1000 * 60 * 60 * 24));
      const weekIndex = Math.floor(diffDays / 7);
      
      if (weekIndex >= 0 && weekIndex < 4) {
        weeklyData[3 - weekIndex].total += inv.totalAmount;
      }
    });

    return weeklyData;
  };

  // 📌 Répartition des statuts
  const getStatusData = () => {
    const paidAmount = invoices
      .filter(i => i.status === "paid")
      .reduce((sum, inv) => sum + inv.totalAmount, 0);
    
    const pendingAmount = invoices
      .filter(i => i.status === "pending")
      .reduce((sum, inv) => sum + inv.totalAmount, 0);

    return [
      { name: "Payée", value: stats.paidInvoices, amount: paidAmount, color: "#10b981" },
      { name: "En attente", value: stats.pendingInvoices, amount: pendingAmount, color: "#3b82f6" },
      { name: "Annulée", value: stats.cancelledInvoices, amount: 0, color: "#ef4444" }
    ];
  };

  // 📌 Top clients
  const getTopClients = () => {
    const clientMap = {};
    invoices.forEach(inv => {
      const clientName = inv.client 
        ? `${inv.client.prenom} ${inv.client.nom}` 
        : "Client inconnu";
      clientMap[clientName] = (clientMap[clientName] || 0) + inv.totalAmount;
    });

    return Object.entries(clientMap)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);
  };

  // 📌 Revenue par status (graphique bar)
  const getRevenueByStatus = () => [
    { name: "Payées", value: stats.paidInvoices, amount: invoices
      .filter(i => i.status === "paid")
      .reduce((sum, inv) => sum + inv.totalAmount, 0) },
    { name: "En attente", value: stats.pendingInvoices, amount: invoices
      .filter(i => i.status === "pending")
      .reduce((sum, inv) => sum + inv.totalAmount, 0) }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR').format(Math.round(amount)) + ' Ar';
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.dataKey === 'total' ? 'Total' : entry.dataKey} : {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const monthlyData = getMonthlyData();
  const weeklyData = getWeeklyData();
  const statusData = getStatusData();
  const topClients = getTopClients();
  const revenueByStatus = getRevenueByStatus();
  const chartData = timeRange === "month" ? monthlyData : weeklyData;

  const statCards = [
    {
      title: "Chiffre d'affaires",
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      color: "emerald",
      trend: "+12.5%",
      description: "Total des ventes"
    },
    {
      title: "Factures payées",
      value: stats.paidInvoices,
      icon: CheckCircle,
      color: "green",
      percentage: `${stats.paidPercentage}%`,
      description: "Taux de paiement"
    },
    {
      title: "En attente",
      value: stats.pendingInvoices,
      icon: Clock,
      color: "blue",
      trend: `${stats.pendingInvoices > 0 ? '⚠️ ' : ''}${stats.pendingInvoices}`,
      description: "À traiter"
    },
    {
      title: "Moyenne par facture",
      value: formatCurrency(stats.avgInvoice),
      icon: Target,
      color: "purple",
      description: "Valeur moyenne"
    }
  ];

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
              Dashboard Financier
            </h1>
            <p className="text-gray-600">
              Analyse et suivi de vos performances financières en temps réel
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchInvoices}
              className="px-4 py-2.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Actualiser
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toast.info("Export en cours...")}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Exporter
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
          {statCards.map((stat, idx) => {
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
                  stat.color === 'green' ? 'from-green-500 to-emerald-600' :
                  stat.color === 'blue' ? 'from-blue-500 to-cyan-600' :
                  'from-purple-500 to-indigo-600'
                } rounded-2xl p-6 text-white shadow-lg`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">{stat.title}</p>
                    <p className="text-2xl font-bold mt-2">{stat.value}</p>
                    <div className="flex items-center gap-2 mt-2">
                      {stat.trend && (
                        <span className="text-sm opacity-90 bg-white/20 px-2 py-1 rounded-full">
                          {stat.trend}
                        </span>
                      )}
                      {stat.percentage && (
                        <span className="text-sm opacity-90">
                          {stat.percentage}
                        </span>
                      )}
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

        {/* Filtres et contrôles */}
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
                  <option value="week">4 dernières semaines</option>
                  <option value="month">12 derniers mois</option>
                </select>
              </div>

              <div className="flex gap-2">
                {[
                  { label: "Aujourd'hui", value: "day" },
                  { label: "Cette semaine", value: "week" },
                  { label: "Ce mois", value: "month" },
                  { label: "Cette année", value: "year" }
                ].map((period) => (
                  <motion.button
                    key={period.value}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setTimeRange(period.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      timeRange === period.value
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {period.label}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Graphiques principaux */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue over time */}
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
                {timeRange === "month" ? "Par mois" : "Par semaine"}
              </span>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey={timeRange === "month" ? "month" : "date"} 
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
                  dataKey="total"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.2}
                  strokeWidth={2}
                  name="Chiffre d'affaires"
                />
                {timeRange === "month" && (
                  <Area
                    type="monotone"
                    dataKey="paid"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.2}
                    strokeWidth={2}
                    name="Payé"
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Répartition des statuts */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Activity className="text-blue-600" />
                Répartition des factures
              </h3>
              <span className="text-sm text-gray-500">
                Total: {invoices.length} factures
              </span>
            </div>

            <div className="flex flex-col lg:flex-row items-center gap-6">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, value, percent }) => 
                      `${name}: ${value} (${(percent * 100).toFixed(1)}%)`
                    }
                    labelLine={false}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name, props) => [
                      `${value} factures • ${formatCurrency(props.payload.amount)}`,
                      name
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="space-y-3 min-w-[200px]">
                {statusData.map((status, index) => (
                  <div key={status.name} className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: status.color }}
                    />
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">{status.name}</span>
                        <span className="text-sm font-bold">{status.value}</span>
                      </div>
                      {status.amount > 0 && (
                        <div className="text-xs text-gray-500">
                          {formatCurrency(status.amount)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Top clients et autres métriques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top clients */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Users className="text-blue-600" />
                Top Clients
              </h3>
              <span className="text-sm text-gray-500">
                Par chiffre d'affaires
              </span>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topClients}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => formatCurrency(value).replace(' Ar', '')}
                />
                <Tooltip 
                  formatter={(value) => formatCurrency(value)}
                  labelFormatter={(label) => `Client: ${label}`}
                />
                <Bar 
                  dataKey="total" 
                  fill="#8b5cf6" 
                  radius={[4, 4, 0, 0]}
                  name="Chiffre d'affaires"
                />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Revenue par statut et détails */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="space-y-6"
          >
            {/* Revenue par statut */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="text-blue-600" />
                Revenu par statut
              </h3>

              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={revenueByStatus}>
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
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)}
                    labelFormatter={(label) => `Statut: ${label}`}
                  />
                  <Bar 
                    dataKey="amount" 
                    fill="#10b981" 
                    radius={[4, 4, 0, 0]}
                    name="Montant total"
                  />
                </BarChart>
              </ResponsiveContainer>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-2xl font-bold text-green-700">
                    {formatCurrency(revenueByStatus[0]?.amount || 0)}
                  </div>
                  <div className="text-sm text-green-600">Revenu réalisé</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-2xl font-bold text-blue-700">
                    {formatCurrency(revenueByStatus[1]?.amount || 0)}
                  </div>
                  <div className="text-sm text-blue-600">En attente</div>
                </div>
              </div>
            </div>

            {/* Détails rapides */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-semibold mb-2">Performance du mois</h4>
                  <p className="text-sm opacity-90">
                    {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <TrendingUp className="w-5 h-5" />
                    <span className="text-xl font-bold">
                      {formatCurrency(monthlyData[new Date().getMonth()].total)}
                    </span>
                  </div>
                </div>
                <Percent className="w-12 h-12 opacity-80" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-center text-sm text-gray-500"
        >
          <p>Données mises à jour en temps réel • Dernière actualisation : {new Date().toLocaleTimeString('fr-FR')}</p>
          <p className="mt-1">Total de {invoices.length} factures analysées</p>
        </motion.div>
      </div>
    </motion.div>
  );
}