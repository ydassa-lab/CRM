import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import { 
  Eye, 
  Plus, 
  CheckCircle, 
  XCircle, 
  FileDown, 
  Filter, 
  Search, 
  DollarSign, 
  Users,
  TrendingUp,
  Calendar,
  Download,
  MoreVertical,
  Clock,
  AlertCircle,
  FileText,
  RefreshCw
} from "lucide-react";

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("createdAt:desc");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const navigate = useNavigate();

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await api.get("/invoices");
      setInvoices(res.data);
    } catch (err) {
      console.error("Erreur fetch invoices:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  // Statistiques
  const stats = {
    total: invoices.length,
    pending: invoices.filter(i => i.status === "pending").length,
    paid: invoices.filter(i => i.status === "paid").length,
    totalAmount: invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0)
  };

  // Filtrage et recherche
  const filteredInvoices = invoices.filter((invoice) => {
    // Filtre par statut
    if (filter !== "all" && invoice.status !== filter) return false;
    
    // Recherche
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const clientName = `${invoice.client?.prenom || ''} ${invoice.client?.nom || ''}`.toLowerCase();
      const invoiceNumber = invoice.invoiceNumber?.toLowerCase() || '';
      
      return (
        clientName.includes(searchLower) ||
        invoiceNumber.includes(searchLower) ||
        invoice.client?.email?.toLowerCase().includes(searchLower) ||
        String(invoice.totalAmount).includes(searchTerm)
      );
    }
    
    return true;
  });

  // Tri
  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    const [field, direction] = sortBy.split(':');
    const multiplier = direction === 'desc' ? -1 : 1;
    
    if (field === 'totalAmount') {
      return (a.totalAmount - b.totalAmount) * multiplier;
    }
    
    if (field === 'createdAt') {
      return (new Date(a.createdAt) - new Date(b.createdAt)) * multiplier;
    }
    
    return 0;
  });

  const handleExport = () => {
    toast.info("Export des factures en cours...");
    // Logique d'export à implémenter
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' Ar';
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
      paid: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
      cancelled: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' }
    };
    return colors[status] || colors.pending;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-6"
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
              <FileText className="w-8 h-8 text-blue-600" />
              Gestion des Factures
            </h1>
            <p className="text-gray-600">
              Gérez, suivez et éditez toutes les factures de votre entreprise
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleExport}
              className="px-4 py-2.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Exporter
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/admin/billing/new")}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Nouvelle Facture
            </motion.button>
          </div>
        </motion.div>

        {/* Statistiques */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {[
            { 
              label: "Chiffre d'affaires", 
              value: formatAmount(stats.totalAmount), 
              icon: DollarSign, 
              color: "emerald",
              bg: "from-emerald-500 to-green-600",
              trend: "+12%"
            },
            { 
              label: "Total Factures", 
              value: stats.total, 
              icon: FileText, 
              color: "blue",
              bg: "from-blue-500 to-blue-600"
            },
            { 
              label: "Payées", 
              value: stats.paid, 
              icon: CheckCircle, 
              color: "green",
              bg: "from-green-500 to-emerald-600",
              percentage: stats.total > 0 ? `${Math.round((stats.paid / stats.total) * 100)}%` : "0%"
            },
            { 
              label: "En attente", 
              value: stats.pending, 
              icon: AlertCircle, 
              color: "amber",
              bg: "from-amber-500 to-orange-600",
              alert: stats.pending > 0
            }
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 + idx * 0.1 }}
              whileHover={{ y: -5 }}
              className={`bg-gradient-to-r ${stat.bg} rounded-2xl p-6 text-white shadow-lg`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">{stat.label}</p>
                  <p className="text-2xl font-bold mt-2">{stat.value}</p>
                  {stat.percentage && (
                    <p className="text-sm opacity-90 mt-1">{stat.percentage} payées</p>
                  )}
                  {stat.trend && (
                    <p className="text-sm opacity-90 mt-1 flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      {stat.trend} ce mois
                    </p>
                  )}
                </div>
                <div className="p-3 rounded-xl bg-white/20">
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Filtres et Recherche */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-gray-200"
        >
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
            <div className="flex-1 w-full">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher une facture par client, numéro ou montant..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-48"
                >
                  <option value="createdAt:desc">Plus récentes</option>
                  <option value="createdAt:asc">Plus anciennes</option>
                  <option value="totalAmount:desc">Montant décroissant</option>
                  <option value="totalAmount:asc">Montant croissant</option>
                </select>
              </div>

              <div className="flex gap-2">
                {[
                  { value: "all", label: "Toutes", color: "gray" },
                  { value: "pending", label: "En attente", color: "amber" },
                  { value: "paid", label: "Payées", color: "emerald" },
                  { value: "cancelled", label: "Annulées", color: "red" }
                ].map((status) => (
                  <motion.button
                    key={status.value}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setFilter(status.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      filter === status.value
                        ? `bg-${status.color}-600 text-white shadow-md`
                        : `bg-${status.color}-100 text-${status.color}-700 hover:bg-${status.color}-200`
                    }`}
                  >
                    {status.label}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* Indicateurs de filtres actifs */}
          {(searchTerm || filter !== "all") && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-4 pt-4 border-t border-gray-100"
            >
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="font-medium">Filtres actifs :</span>
                {searchTerm && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                    Recherche: "{searchTerm}"
                  </span>
                )}
                {filter !== "all" && (
                  <span className={`inline-flex items-center gap-1 px-2 py-1 bg-${getStatusColor(filter).bg.split('-')[1]}-100 text-${getStatusColor(filter).text.split('-')[1]}-700 rounded-full`}>
                    {filter === "pending" ? "En attente" : filter === "paid" ? "Payées" : "Annulées"}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                  {sortedInvoices.length} facture{sortedInvoices.length !== 1 ? 's' : ''}
                </span>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Tableau des Factures */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200"
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"
              />
              <p className="text-gray-600">Chargement des factures...</p>
            </div>
          ) : sortedInvoices.length === 0 ? (
            <div className="text-center py-20">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {searchTerm || filter !== "all" 
                  ? "Aucune facture correspondante" 
                  : "Aucune facture enregistrée"}
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {searchTerm || filter !== "all"
                  ? "Aucune facture ne correspond à vos critères de recherche."
                  : "Commencez par créer votre première facture."}
              </p>
              {(searchTerm || filter !== "all") ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSearchTerm("");
                    setFilter("all");
                  }}
                  className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 inline-flex items-center gap-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  Réinitialiser les filtres
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/admin/billing/new")}
                  className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 inline-flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Créer une facture
                </motion.button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-blue-50/50 border-b border-gray-200">
                  <tr>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Facture
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Montant
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <AnimatePresence>
                    {sortedInvoices.map((invoice, index) => {
                      const statusColor = getStatusColor(invoice.status);
                      return (
                        <motion.tr
                          key={invoice._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ backgroundColor: "rgba(59, 130, 246, 0.05)" }}
                          className="group"
                        >
                          <td className="px-8 py-5">
                            <div>
                              <div className="font-semibold text-gray-900">
                                {invoice.invoiceNumber || `FACT-${invoice._id.slice(-6)}`}
                              </div>
                              <div className="text-sm text-gray-500">
                                Réf: {invoice._id.slice(-8)}
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-600 flex items-center justify-center">
                                <span className="text-white font-medium text-sm">
                                  {invoice.client?.prenom?.[0]}{invoice.client?.nom?.[0]}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">
                                  {invoice.client?.prenom} {invoice.client?.nom}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {invoice.client?.email || "Non renseigné"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <div className="text-lg font-bold text-gray-900">
                              {formatAmount(invoice.totalAmount)}
                            </div>
                            {invoice.taxAmount > 0 && (
                              <div className="text-sm text-gray-500">
                                Dont TVA: {formatAmount(invoice.taxAmount)}
                              </div>
                            )}
                          </td>
                          <td className="px-8 py-5">
                            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${statusColor.bg} ${statusColor.text} ${statusColor.border} border`}>
                              {getStatusIcon(invoice.status)}
                              {invoice.status === "pending" ? "En attente" : 
                               invoice.status === "paid" ? "Payée" : "Annulée"}
                            </span>
                            {invoice.dueDate && invoice.status === "pending" && (
                              <div className="text-xs text-gray-500 mt-1">
                                Échéance: {formatDate(invoice.dueDate)}
                              </div>
                            )}
                          </td>
                          <td className="px-8 py-5">
                            <div className="text-sm text-gray-700">
                              {formatDate(invoice.createdAt)}
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-2">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => navigate(`/admin/billing/${invoice._id}`)}
                                className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                                title="Voir les détails"
                              >
                                <Eye className="w-4 h-4" />
                              </motion.button>
                              
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => {
                                  // Logique de téléchargement PDF
                                  window.open(`/api/invoices/${invoice._id}/pdf`, '_blank');
                                }}
                                className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                                title="Télécharger PDF"
                              >
                                <FileDown className="w-4 h-4" />
                              </motion.button>

                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setSelectedInvoice(invoice)}
                                className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
                                title="Plus d'options"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </motion.button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Menu contextuel pour les factures */}
        <AnimatePresence>
          {selectedInvoice && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40"
              onClick={() => setSelectedInvoice(null)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white rounded-xl p-4 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="space-y-2 min-w-[200px]">
                  <button className="w-full text-left px-4 py-2 rounded hover:bg-gray-100">
                    Marquer comme payée
                  </button>
                  <button className="w-full text-left px-4 py-2 rounded hover:bg-gray-100">
                    Envoyer par email
                  </button>
                  <button className="w-full text-left px-4 py-2 rounded hover:bg-gray-100">
                    Dupliquer
                  </button>
                  <button className="w-full text-left px-4 py-2 text-red-600 rounded hover:bg-red-50">
                    Annuler la facture
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pied de page */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-center text-sm text-gray-500"
        >
          <p>© {new Date().getFullYear()} Votre Entreprise • Gestion de facturation professionnelle</p>
          <p className="mt-1">Chiffre d'affaires total: {formatAmount(stats.totalAmount)}</p>
        </motion.div>
      </div>
    </motion.div>
  );
}