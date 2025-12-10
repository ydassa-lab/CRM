import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api";
import toast from "../../utils/toast.js";
import { 
  Plus, 
  Trash2, 
  User, 
  Briefcase, 
  Ticket, 
  FileText,
  DollarSign,
  Package,
  Hash,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  ChevronLeft,
  Save,
  RefreshCw,
  Percent,
  Tag
} from "lucide-react";

export default function InvoiceCreate() {
  const navigate = useNavigate();

  const [clients, setClients] = useState([]);
  const [opps, setOpps] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  const [form, setForm] = useState({
    client: "",
    opportunity: "",
    ticket: "",
    invoiceNumber: "",
    dueDate: "",
    taxRate: 20,
    discount: 0,
    notes: "",
    items: [{ description: "", quantity: 1, price: 0 }],
    status: "pending"
  });

  // Générer un numéro de facture automatique
  const generateInvoiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `FACT-${year}${month}${day}-${random}`;
  };

  useEffect(() => {
    fetchLookups();
    setForm(prev => ({
      ...prev,
      invoiceNumber: generateInvoiceNumber(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }));
  }, []);

  const fetchLookups = async () => {
    setLoading(true);
    try {
      const [cRes, oRes, tRes] = await Promise.all([
        api.get("/client-users"),
        api.get("/opportunities"),
        api.get("/tickets")
      ]);

      console.log("CLIENTS API RESULT:", cRes.data);
      console.log("TICKETS API RESULT:", tRes.data);

      setClients(Array.isArray(cRes.data.data) ? cRes.data.data : []);
      setOpps(Array.isArray(oRes.data.data) ? oRes.data.data : []);
      setTickets(Array.isArray(tRes.data) ? tRes.data : []);

    } catch (err) {
      console.error("Erreur fetch lookups:", err);
      toast.error("Impossible de charger les données nécessaires");
    } finally {
      setLoading(false);
    }
  };

  // Calcul des totaux
  const { subtotal, taxAmount, discountAmount, totalAmount } = useMemo(() => {
    const subtotal = form.items.reduce(
      (sum, it) => sum + (Number(it.quantity) * Number(it.price) || 0),
      0
    );

    const discountAmount = subtotal * (form.discount / 100);
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = taxableAmount * (form.taxRate / 100);
    const totalAmount = taxableAmount + taxAmount;

    return {
      subtotal,
      taxAmount,
      discountAmount,
      totalAmount
    };
  }, [form.items, form.taxRate, form.discount]);

  const changeField = (name, value) => {
    setForm({ ...form, [name]: value });
    
    // Lorsqu'un client est sélectionné, récupérer ses infos
    if (name === "client") {
      const client = clients.find(c => c._id === value);
      setSelectedClient(client);
    }
  };

  const changeItem = (index, key, value) => {
    const newItems = [...form.items];
    newItems[index][key] = key === "quantity" || key === "price"
      ? Number(value)
      : value;
    setForm({ ...form, items: newItems });
  };

  const addItem = () => {
    setForm({
      ...form,
      items: [...form.items, { description: "", quantity: 1, price: 0 }]
    });
  };

  const removeItem = (i) => {
    if (form.items.length > 1) {
      setForm({ ...form, items: form.items.filter((_, idx) => idx !== i) });
    } else {
      toast.error("Une facture doit contenir au moins un article");
    }
  };

  const validateForm = () => {
    if (!form.client) {
      toast.error("Veuillez sélectionner un client");
      return false;
    }

    if (!form.items.every(item => item.description && item.quantity > 0 && item.price >= 0)) {
      toast.error("Veuillez remplir tous les champs des articles");
      return false;
    }

    if (form.taxRate < 0 || form.taxRate > 100) {
      toast.error("Le taux de TVA doit être entre 0 et 100%");
      return false;
    }

    if (form.discount < 0 || form.discount > 100) {
      toast.error("La remise doit être entre 0 et 100%");
      return false;
    }

    return true;
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const payload = {
        client: form.client,
        opportunity: form.opportunity || null,
        ticket: form.ticket || null,
        invoiceNumber: form.invoiceNumber,
        dueDate: form.dueDate || null,
        items: form.items,
        taxRate: form.taxRate,
        discount: form.discount,
        notes: form.notes,
        subTotal: subtotal,
        taxAmount: taxAmount,
        totalAmount: totalAmount,
        status: form.status
      };

      const res = await api.post("/invoices", payload);
      
      toast.success("Facture créée avec succès");
      navigate(`/admin/billing/${res.data._id}`);

    } catch (err) {
      console.error("Erreur création facture:", err);
      toast.error(err?.response?.data?.message || "Erreur lors de la création de la facture.");
    }
  };

  const getStatusInfo = (status) => {
    const statuses = {
      pending: { label: "En attente", color: "amber", icon: Clock },
      paid: { label: "Payée", color: "emerald", icon: CheckCircle },
      cancelled: { label: "Annulée", color: "red", icon: XCircle }
    };
    return statuses[status] || statuses.pending;
  };

  const statusInfo = getStatusInfo(form.status);

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
      <div className="max-w-6xl mx-auto">
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
                <ChevronLeft className="w-5 h-5" />
              </motion.button>
              <h1 className="text-3xl font-bold text-gray-900">
                Nouvelle Facture
              </h1>
            </div>
            <p className="text-gray-600">
              Créez une nouvelle facture pour votre client
            </p>
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setForm(prev => ({
                  ...prev,
                  invoiceNumber: generateInvoiceNumber()
                }));
                toast.info("Numéro de facture regénéré");
              }}
              className="px-4 py-2.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Regénérer N°
            </motion.button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulaire principal */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <FileText className="text-blue-600" />
                Informations de facturation
              </h3>

              <form onSubmit={submit} className="space-y-6">
                {/* Informations de base */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="inline w-4 h-4 mr-1 text-blue-600" />
                      Client *
                    </label>
                    <select
                      value={form.client}
                      onChange={(e) => changeField("client", e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    >
                      <option value="">Sélectionner un client...</option>
                      {clients.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.prenom} {c.nom} • {c.email}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Hash className="inline w-4 h-4 mr-1 text-blue-600" />
                      Numéro de facture
                    </label>
                    <input
                      type="text"
                      value={form.invoiceNumber}
                      onChange={(e) => changeField("invoiceNumber", e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="FACT-20240101-001"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Briefcase className="inline w-4 h-4 mr-1 text-blue-600" />
                      Opportunité
                    </label>
                    <select
                      value={form.opportunity}
                      onChange={(e) => changeField("opportunity", e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="">Aucune opportunité</option>
                      {opps.map((o) => (
                        <option key={o._id} value={o._id}>
                          {o.title || o.name || "Opportunité #" + o._id.slice(-6)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Ticket className="inline w-4 h-4 mr-1 text-blue-600" />
                      Ticket lié
                    </label>
                    <select
                      value={form.ticket}
                      onChange={(e) => changeField("ticket", e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="">Aucun ticket</option>
                      {tickets.map((t) => (
                        <option key={t._id} value={t._id}>
                          {t.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="inline w-4 h-4 mr-1 text-blue-600" />
                      Date d'échéance
                    </label>
                    <input
                      type="date"
                      value={form.dueDate}
                      onChange={(e) => changeField("dueDate", e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <span className={`inline-flex items-center gap-2 ${statusInfo.color === 'amber' ? 'text-amber-600' : statusInfo.color === 'emerald' ? 'text-emerald-600' : 'text-red-600'}`}>
                        <statusInfo.icon className="w-4 h-4" />
                        Statut
                      </span>
                    </label>
                    <select
                      value={form.status}
                      onChange={(e) => changeField("status", e.target.value)}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        form.status === 'pending' ? 'border-amber-300' :
                        form.status === 'paid' ? 'border-emerald-300' :
                        'border-red-300'
                      }`}
                    >
                      <option value="pending">En attente</option>
                      <option value="paid">Payée</option>
                      <option value="cancelled">Annulée</option>
                    </select>
                  </div>
                </div>

                {/* Articles */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Package className="text-blue-600" />
                      Articles facturés
                    </h4>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={addItem}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow hover:shadow-lg transition-all flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Ajouter un article
                    </motion.button>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-12 gap-4 mb-2 px-2 text-sm text-gray-600 font-medium">
                      <div className="col-span-6">Description</div>
                      <div className="col-span-2">Quantité</div>
                      <div className="col-span-2">Prix unitaire</div>
                      <div className="col-span-1">Total</div>
                      <div className="col-span-1"></div>
                    </div>

                    <AnimatePresence>
                      {form.items.map((item, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="grid grid-cols-12 gap-4 items-center"
                        >
                          <div className="col-span-6">
                            <input
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                              placeholder="Description de l'article"
                              value={item.description}
                              onChange={(e) => changeItem(idx, "description", e.target.value)}
                              required
                            />
                          </div>

                          <div className="col-span-2">
                            <input
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                              type="number"
                              min="1"
                              step="1"
                              value={item.quantity}
                              onChange={(e) => changeItem(idx, "quantity", e.target.value)}
                              required
                            />
                          </div>

                          <div className="col-span-2">
                            <input
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.price}
                              onChange={(e) => changeItem(idx, "price", e.target.value)}
                              required
                            />
                          </div>

                          <div className="col-span-1 text-right font-medium text-gray-900">
                            {(item.quantity * item.price).toLocaleString('fr-FR')} Ar
                          </div>

                          <div className="col-span-1 text-center">
                            <motion.button
                              type="button"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => removeItem(idx)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              disabled={form.items.length <= 1}
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FileText className="inline w-4 h-4 mr-1 text-blue-600" />
                    Notes (optionnel)
                  </label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => changeField("notes", e.target.value)}
                    rows="3"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    placeholder="Informations supplémentaires, conditions de paiement, etc."
                  />
                </div>
              </form>
            </motion.div>
          </div>

          {/* Panneau latéral - Récapitulatif */}
          <div className="space-y-6">
            {/* Récapitulatif */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <DollarSign className="text-blue-600" />
                Récapitulatif
              </h3>

              <div className="space-y-4">
                {/* Paramètres */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Percent className="inline w-4 h-4 mr-1 text-blue-600" />
                      Taux de TVA (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={form.taxRate}
                      onChange={(e) => changeField("taxRate", e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Tag className="inline w-4 h-4 mr-1 text-blue-600" />
                      Remise (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={form.discount}
                      onChange={(e) => changeField("discount", e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Totaux */}
                <div className="space-y-3 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Sous-total:</span>
                    <span className="font-medium">{subtotal.toLocaleString('fr-FR')} Ar</span>
                  </div>

                  {form.discount > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Remise ({form.discount}%):</span>
                      <span className="font-medium text-red-600">-{discountAmount.toLocaleString('fr-FR')} Ar</span>
                    </div>
                  )}

                  {form.taxRate > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">TVA ({form.taxRate}%):</span>
                      <span className="font-medium">{taxAmount.toLocaleString('fr-FR')} Ar</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <span className="text-lg font-bold text-gray-900">Total TTC:</span>
                    <span className="text-2xl font-bold text-blue-700">
                      {totalAmount.toLocaleString('fr-FR')} Ar
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-6 space-y-3">
                  <motion.button
                    type="submit"
                    onClick={submit}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    Créer la facture
                  </motion.button>

                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(-1)}
                    className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all duration-300"
                  >
                    Annuler
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Informations client */}
            {selectedClient && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100"
              >
                <h4 className="font-semibold text-gray-900 mb-3">Client sélectionné</h4>
                <div className="space-y-2">
                  <p className="font-medium text-gray-900">
                    {selectedClient.prenom} {selectedClient.nom}
                  </p>
                  <p className="text-sm text-gray-600">{selectedClient.email}</p>
                  {selectedClient.telephone && (
                    <p className="text-sm text-gray-600">{selectedClient.telephone}</p>
                  )}
                  {selectedClient.entreprise && (
                    <p className="text-sm text-gray-600">{selectedClient.entreprise}</p>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}