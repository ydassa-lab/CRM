import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Download,
  FileText,
  DollarSign,
  Calendar,
  User,
  Mail,
  Phone,
  Building,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  CreditCard,
  Printer,
  Send,
  Edit3,
  RefreshCw,
  Shield,
  TrendingUp,
  FileSpreadsheet,
  FileBarChart
} from "lucide-react";
import api from "../../services/api";
import toast from "../../utils/toast.js";

export default function InvoiceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  // Modal paiement
  const [showPayModal, setShowPayModal] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("cash");
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);

  // Modal confirmation
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [actionType, setActionType] = useState("");

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/invoices/${id}`);
      setInvoice(res.data);
      setNewStatus(res.data.status);
    } catch (err) {
      console.error("Erreur fetch invoice:", err);
      toast.error("Impossible de charger la facture.");
    } finally {
      setLoading(false);
    }
  };

  const changeStatus = async () => {
    setUpdating(true);
    try {
      await api.put(`/invoices/${id}/status`, { status: newStatus });
      toast.success("Statut mis à jour avec succès");
      fetchInvoice();
    } catch (err) {
      console.error("Erreur changement statut:", err);
      toast.error("Erreur lors du changement de statut.");
    } finally {
      setUpdating(false);
    }
  };

  const addPayment = async () => {
    if (!payAmount || payAmount <= 0) {
      toast.error("Veuillez saisir un montant valide");
      return;
    }

    if (Number(payAmount) > (invoice.totalAmount - totalPaid)) {
      toast.error("Le montant ne peut pas dépasser le solde restant");
      return;
    }

    try {
      await api.post(`/invoices/${id}/payment`, {
        amount: Number(payAmount),
        method: payMethod,
        date: payDate
      });

      toast.success("Paiement enregistré avec succès");
      setShowPayModal(false);
      setPayAmount("");
      fetchInvoice();
    } catch (err) {
      console.error("Erreur paiement :", err);
      toast.error("Impossible d'ajouter le paiement.");
    }
  };

  const handleExport = (format) => {
    const urls = {
      pdf: `http://localhost:5000/api/invoices/${id}/pdf?token=${token}`,
      excel: `http://localhost:5000/api/invoices/${id}/excel?token=${token}`,
      csv: `http://localhost:5000/api/invoices/${id}/csv?token=${token}`
    };
    
    window.open(urls[format], '_blank');
    toast.info(`Export ${format.toUpperCase()} en cours...`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' Ar';
  };

  const getStatusInfo = (status) => {
    const statuses = {
      pending: { 
        label: "En attente", 
        color: "amber", 
        icon: Clock,
        bg: "bg-amber-50",
        text: "text-amber-700",
        border: "border-amber-200"
      },
      paid: { 
        label: "Payée", 
        color: "emerald", 
        icon: CheckCircle,
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200"
      },
      cancelled: { 
        label: "Annulée", 
        color: "red", 
        icon: XCircle,
        bg: "bg-red-50",
        text: "text-red-700",
        border: "border-red-200"
      }
    };
    return statuses[status] || statuses.pending;
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

  if (!invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50/30">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Facture introuvable</h2>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg"
          >
            Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  const totalPaid = invoice.paymentHistory?.reduce((sum, p) => sum + p.amount, 0) || 0;
  const balance = invoice.totalAmount - totalPaid;
  const statusInfo = getStatusInfo(invoice.status);
  const StatusIcon = statusInfo.icon;

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
            <div className="flex items-center gap-3 mb-2">
              <motion.button
                whileHover={{ scale: 1.1, x: -5 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => navigate(-1)}
                className="p-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </motion.button>
              <h1 className="text-3xl font-bold text-gray-900">
                Facture #{invoice.invoiceNumber || invoice._id.slice(-8).toUpperCase()}
              </h1>
              <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border} border`}>
                <StatusIcon className="w-4 h-4" />
                {statusInfo.label}
              </span>
            </div>
            <p className="text-gray-600 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Créée le {formatDate(invoice.createdAt)}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            {/* Export buttons */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleExport('pdf')}
              className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
            >
              <Printer className="w-5 h-5" />
              PDF
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleExport('excel')}
              className="px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
            >
              <FileSpreadsheet className="w-5 h-5" />
              Excel
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleExport('csv')}
              className="px-4 py-2.5 bg-gradient-to-r from-yellow-600 to-amber-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
            >
              <FileBarChart className="w-5 h-5" />
              CSV
            </motion.button>

            {balance > 0 && invoice.status !== 'cancelled' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowPayModal(true)}
                className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-green-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
              >
                <CreditCard className="w-5 h-5" />
                Ajouter Paiement
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          {/* Total Amount */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Montant Total</p>
                <p className="text-2xl font-bold mt-2">{formatCurrency(invoice.totalAmount)}</p>
                {invoice.taxAmount > 0 && (
                  <p className="text-sm opacity-90 mt-1">
                    Dont TVA: {formatCurrency(invoice.taxAmount)}
                  </p>
                )}
              </div>
              <DollarSign className="w-8 h-8 opacity-80" />
            </div>
          </div>

          {/* Paid Amount */}
          <div className="bg-gradient-to-r from-emerald-600 to-green-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Déjà Payé</p>
                <p className="text-2xl font-bold mt-2">{formatCurrency(totalPaid)}</p>
                {totalPaid > 0 && (
                  <p className="text-sm opacity-90 mt-1">
                    {Math.round((totalPaid / invoice.totalAmount) * 100)}% du total
                  </p>
                )}
              </div>
              <CheckCircle className="w-8 h-8 opacity-80" />
            </div>
          </div>

          {/* Balance */}
          <div className={`rounded-2xl p-6 text-white shadow-lg ${
            balance > 0 ? 'bg-gradient-to-r from-amber-600 to-orange-600' : 'bg-gradient-to-r from-green-600 to-emerald-600'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">
                  {balance > 0 ? 'Solde Restant' : 'Facture Soldée'}
                </p>
                <p className="text-2xl font-bold mt-2">{formatCurrency(balance)}</p>
                {invoice.dueDate && balance > 0 && (
                  <p className="text-sm opacity-90 mt-1 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Échéance: {formatDate(invoice.dueDate)}
                  </p>
                )}
              </div>
              {balance > 0 ? <AlertCircle className="w-8 h-8 opacity-80" /> : <CheckCircle className="w-8 h-8 opacity-80" />}
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Client Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="text-blue-600" />
                Informations Client
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Nom complet</p>
                  <p className="font-medium text-gray-900">
                    {invoice.client?.prenom} {invoice.client?.nom}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <a 
                    href={`mailto:${invoice.client?.email}`}
                    className="font-medium text-gray-900 hover:text-blue-600 transition-colors flex items-center gap-1"
                  >
                    <Mail className="w-4 h-4" />
                    {invoice.client?.email || "Non renseigné"}
                  </a>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Téléphone</p>
                  <p className="font-medium text-gray-900 flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    {invoice.client?.telephone || "Non renseigné"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Entreprise</p>
                  <p className="font-medium text-gray-900 flex items-center gap-1">
                    <Building className="w-4 h-4" />
                    {invoice.client?.entreprise || "Non renseignée"}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Items Table */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="text-blue-600" />
                  Articles Facturés
                </h3>
                <span className="text-sm text-gray-500">
                  {invoice.items?.length || 0} article{invoice.items?.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Description</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Quantité</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Prix unitaire</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {invoice.items?.map((item, index) => (
                      <motion.tr
                        key={index}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 * index }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">{item.description}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                            {item.quantity}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-gray-700">{formatCurrency(item.price)}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-gray-900">
                            {formatCurrency(item.total || item.quantity * item.price)}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 border-t border-gray-200">
                    <tr>
                      <td colSpan="3" className="px-4 py-3 text-right font-semibold text-gray-700">
                        Total HT
                      </td>
                      <td className="px-4 py-3 font-bold text-gray-900">
                        {formatCurrency(invoice.subTotal || invoice.totalAmount)}
                      </td>
                    </tr>
                    {invoice.taxAmount > 0 && (
                      <tr>
                        <td colSpan="3" className="px-4 py-3 text-right font-semibold text-gray-700">
                          TVA ({invoice.taxRate || 20}%)
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-900">
                          {formatCurrency(invoice.taxAmount)}
                        </td>
                      </tr>
                    )}
                    <tr>
                      <td colSpan="3" className="px-4 py-3 text-right font-bold text-gray-900">
                        Total TTC
                      </td>
                      <td className="px-4 py-3 font-bold text-2xl text-blue-700">
                        {formatCurrency(invoice.totalAmount)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Status Management */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <RefreshCw className="text-blue-600" />
                Gestion du Statut
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Changer le statut
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="pending">En attente</option>
                    <option value="paid">Payée</option>
                    <option value="cancelled">Annulée</option>
                  </select>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={changeStatus}
                  disabled={updating || newStatus === invoice.status}
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {updating ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                      Mise à jour...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Mettre à jour le statut
                    </>
                  )}
                </motion.button>

                {invoice.opportunity && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500 mb-1">Opportunité liée</p>
                    <p className="font-medium text-gray-900">{invoice.opportunity}</p>
                  </div>
                )}

                {invoice.ticket && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500 mb-1">Ticket lié</p>
                    <p className="font-medium text-gray-900">{invoice.ticket}</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Payment History */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="text-blue-600" />
                Historique des Paiements
              </h3>

              {invoice.paymentHistory?.length > 0 ? (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                  {invoice.paymentHistory.map((payment, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-gray-900">
                          {formatCurrency(payment.amount)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDate(payment.date)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Méthode: <span className="font-medium capitalize">{payment.method}</span>
                      </div>
                      {payment.reference && (
                        <div className="text-sm text-gray-600 mt-1">
                          Référence: {payment.reference}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CreditCard className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Aucun paiement enregistré</p>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Solde restant:</span>
                  <span className={`font-bold ${balance > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {formatCurrency(balance)}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Payment Modal */}
        <AnimatePresence>
          {showPayModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowPayModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                transition={{ type: "spring" }}
                className="bg-gradient-to-br from-white to-gray-50 w-full max-w-md rounded-2xl shadow-2xl p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-xl font-bold text-gray-900 mb-2">Ajouter un Paiement</h3>
                <p className="text-gray-600 mb-6">Solde restant: {formatCurrency(balance)}</p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Montant (max: {formatCurrency(balance)})
                    </label>
                    <input
                      type="number"
                      value={payAmount}
                      onChange={(e) => setPayAmount(e.target.value)}
                      max={balance}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Entrez le montant"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Méthode de paiement
                    </label>
                    <select
                      value={payMethod}
                      onChange={(e) => setPayMethod(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="cash">Espèces</option>
                      <option value="bank">Virement bancaire</option>
                      <option value="check">Chèque</option>
                      <option value="mobile">Mobile Money</option>
                      <option value="simulated">Simulation</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date du paiement
                    </label>
                    <input
                      type="date"
                      value={payDate}
                      onChange={(e) => setPayDate(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowPayModal(false)}
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={addPayment}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-green-700 text-white rounded-lg hover:shadow-lg transition-all"
                  >
                    Valider le paiement
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}