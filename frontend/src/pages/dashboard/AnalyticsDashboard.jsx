import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  TrendingUp, Users, UserCheck, UserPlus, Ticket, 
  DollarSign, BarChart3, PieChart as PieChartIcon, Calendar,
  ChevronRight, ArrowUpRight, ArrowDownRight, RefreshCw
} from "lucide-react";
import api from "../../services/api";
import {
  LineChart, Line, AreaChart, Area, CartesianGrid, XAxis, YAxis, 
  Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
  BarChart, Bar,
  RadialBarChart, RadialBar
} from "recharts";

const CHART_COLORS = {
  primary: "#3B82F6",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  info: "#8B5CF6",
  gray: "#9CA3AF"
};

const GRADIENTS = {
  blue: "from-blue-500 to-indigo-600",
  green: "from-emerald-500 to-teal-600",
  orange: "from-orange-500 to-amber-600",
  purple: "from-purple-500 to-pink-600",
  red: "from-rose-500 to-pink-600"
};

export default function AnalyticsDashboard() {
  const [overview, setOverview] = useState(null);
  const [ticketsOverTime, setTicketsOverTime] = useState([]);
  const [ticketStatus, setTicketStatus] = useState({});
  const [oppsByStage, setOppsByStage] = useState([]);
  const [revenue, setRevenue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30d");

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [ov, ttime, tstatus, oppstage, rev] = await Promise.all([
        api.get("/analytics/overview"),
        api.get(`/analytics/tickets-over-time?days=${timeRange === '30d' ? 30 : timeRange === '7d' ? 7 : 90}`),
        api.get("/analytics/ticket-status"),
        api.get("/analytics/opportunities-by-stage"),
        api.get("/analytics/revenue-by-month?months=6")
      ]);
      setOverview(ov.data);
      setTicketsOverTime(ttime.data);
      setTicketStatus(tstatus.data);
      setOppsByStage(oppstage.data);
      setRevenue(rev.data);
    } catch (err) {
      console.error("Erreur fetch analytics", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [timeRange]);

  const pieData = Object.keys(ticketStatus).map(k => ({ 
    name: k, 
    value: ticketStatus[k],
    fill: CHART_COLORS[k === 'Ouvert' ? 'warning' : k === 'Résolu' ? 'success' : k === 'En cours' ? 'primary' : 'gray']
  }));

  const oppsData = oppsByStage.map(stage => ({
    ...stage,
    fill: CHART_COLORS[
      stage._id === 'Gagné' ? 'success' : 
      stage._id === 'Perdu' ? 'danger' : 
      stage._id === 'Négociation' ? 'warning' : 'primary'
    ]
  }));

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  const cardHoverVariants = {
    hover: {
      y: -4,
      scale: 1.02,
      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
      transition: { type: "spring", stiffness: 400, damping: 25 }
    }
  };

  const KpiCard = ({ title, value, change, icon: Icon, color = "blue", loading }) => (
    <motion.div
      variants={itemVariants}
      whileHover="hover"
      className="relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50"
    >
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
        <div className={`absolute inset-0 bg-gradient-to-br ${GRADIENTS[color]} rounded-full blur-xl`}></div>
      </div>
      
      <div className="p-6 relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            {loading ? (
              <div className="h-8 w-24 bg-gray-200 animate-pulse rounded"></div>
            ) : (
              <p className="text-3xl font-bold text-gray-900">{value}</p>
            )}
          </div>
          <div className={`p-3 rounded-xl bg-gradient-to-br ${GRADIENTS[color]} bg-opacity-10`}>
            <Icon className="w-6 h-6" style={{ color: CHART_COLORS[color] }} />
          </div>
        </div>
        
        {change !== undefined && (
          <div className="flex items-center gap-2">
            <div className={`flex items-center px-2 py-1 rounded-lg ${
              change >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
            }`}>
              {change >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              <span className="text-sm font-medium">{Math.abs(change)}%</span>
            </div>
            <span className="text-sm text-gray-500">vs période précédente</span>
          </div>
        )}
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="p-6 min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-gray-200 rounded-lg w-64"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>)}
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[1,2,3].map(i => <div key={i} className="h-64 bg-gray-200 rounded-2xl"></div>)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen p-6 bg-gradient-to-br from-gray-50 via-white to-blue-50/30"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Tableau de bord Analytics
            </h1>
            <p className="text-gray-600 mt-2">Analyses en temps réel et insights sur votre activité</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-xl p-1 border border-gray-200/50">
              {['7d', '30d', '90d'].map(range => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    timeRange === range
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05, rotate: 180 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchAll}
              className="p-3 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all"
              title="Rafraîchir les données"
            >
              <RefreshCw className="w-5 h-5 text-gray-600" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div 
        variants={containerVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        <KpiCard
          title="Utilisateurs actifs"
          value={overview?.totalUsers || "0"}
          change={12}
          icon={Users}
          color="blue"
          loading={loading}
        />
        
        <KpiCard
          title="Clients satisfaits"
          value={overview?.totalClients || "0"}
          change={8}
          icon={UserCheck}
          color="green"
          loading={loading}
        />
        
        <KpiCard
          title="Nouveaux prospects"
          value={overview?.totalProspects || "0"}
          change={-3}
          icon={UserPlus}
          color="purple"
          loading={loading}
        />
        
        <KpiCard
          title="Tickets ouverts"
          value={overview?.openTickets || "0"}
          change={24}
          icon={Ticket}
          color="orange"
          loading={loading}
        />
      </motion.div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Tickets Over Time */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-2 relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Évolution des tickets
              </h3>
              <p className="text-sm text-gray-600">Derniers {timeRange === '7d' ? '7 jours' : timeRange === '30d' ? '30 jours' : '3 mois'}</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span>Tickets</span>
              </div>
            </div>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ticketsOverTime}>
                <defs>
                  <linearGradient id="colorTickets" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value) => [`${value} tickets`, 'Nombre']}
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke={CHART_COLORS.primary} 
                  strokeWidth={3}
                  fill="url(#colorTickets)"
                  dot={{ stroke: CHART_COLORS.primary, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Ticket Status Pie */}
        <motion.div
          variants={itemVariants}
          className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <PieChartIcon className="w-5 h-5" />
                Répartition des tickets
              </h3>
              <p className="text-sm text-gray-600">Par statut</p>
            </div>
            <div className="text-sm text-gray-600">
              Total: {Object.values(ticketStatus).reduce((a, b) => a + b, 0)}
            </div>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value} tickets`, '']}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value, entry) => (
                    <span className="text-sm text-gray-600">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Opportunities by Stage */}
        <motion.div
          variants={itemVariants}
          className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Pipeline commercial
              </h3>
              <p className="text-sm text-gray-600">Opportunités par stage</p>
            </div>
            <div className="text-sm text-gray-600">
              Total: {oppsByStage.reduce((sum, stage) => sum + stage.count, 0)}
            </div>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={oppsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="_id" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value) => [`${value} opportunités`, 'Nombre']}
                  labelFormatter={(label) => `Stage: ${label}`}
                />
                <Bar 
                  dataKey="count" 
                  radius={[8, 8, 0, 0]}
                  background={{ fill: '#f3f4f6', radius: [8, 8, 0, 0] }}
                >
                  {oppsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-3">
            {oppsData.map((stage) => (
              <div key={stage._id} className="text-center">
                <div className="text-2xl font-bold text-gray-900">{stage.count}</div>
                <div className="text-xs text-gray-600 truncate">{stage._id}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Revenue Chart */}
        <motion.div
          variants={itemVariants}
          className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Revenu mensuel
              </h3>
              <p className="text-sm text-gray-600">Derniers 6 mois</p>
            </div>
            <div className="text-sm font-semibold text-green-600">
              +15.2% vs période précédente
            </div>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenue}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.success} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={CHART_COLORS.success} stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  tickFormatter={(value) => `$${value/1000}k`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value) => [
                    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value),
                    'Revenu'
                  ]}
                  labelFormatter={(label) => `Mois: ${label}`}
                />
                <Bar 
                  dataKey="total" 
                  fill="url(#colorRevenue)"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-6 flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl">
            <div>
              <div className="text-sm text-gray-600">Revenu total</div>
              <div className="text-2xl font-bold text-gray-900">
                {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(
                  revenue.reduce((sum, month) => sum + month.total, 0)
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 text-emerald-600">
              <ArrowUpRight className="w-5 h-5" />
              <span className="font-semibold">+15.2%</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Stats */}
      <motion.div 
        variants={itemVariants}
        className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          { label: "Taux de conversion", value: "24.8%", trend: "+2.4%" },
          { label: "Temps de réponse moyen", value: "2h 24m", trend: "-15m" },
          { label: "Satisfaction client", value: "4.7/5", trend: "+0.3" },
          { label: "Croissance MRR", value: "12.5%", trend: "+1.8%" }
        ].map((stat, index) => (
          <div key={index} className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50">
            <div className="text-sm text-gray-600 mb-1">{stat.label}</div>
            <div className="flex items-end justify-between">
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className={`text-sm font-medium ${stat.trend.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'}`}>
                {stat.trend}
              </div>
            </div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}