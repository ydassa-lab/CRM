import { useEffect, useState } from "react";
import axios from "../../services/api";
import { MessageSquare, Plus } from "lucide-react";

export default function ClientTickets() {
  const [tickets, setTickets] = useState([]);
  const [showAdd, setShowAdd] = useState(false);

  const fetchTickets = async () => {
    try {
      const res = await axios.get("/tickets");
      setTickets(res.data);
    } catch (err) {
      console.error("Erreur fetch tickets:", err);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  return (
    <div className="p-6">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Mes tickets</h1>

        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" /> Nouveau ticket
        </button>
      </div>

      {/* Liste tickets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tickets.map((t) => (
          <div key={t._id} className="bg-white shadow p-4 rounded-lg border">
            <h3 className="text-lg font-bold">{t.title}</h3>

            <p className="text-gray-600 mt-2">{t.message}</p>

            <span
              className={`inline-block mt-3 px-3 py-1 text-sm rounded-full ${
                t.status === "Ouvert" ? "bg-green-100 text-green-600" :
                t.status === "En cours" ? "bg-yellow-100 text-yellow-700" :
                t.status === "Résolu" ? "bg-blue-100 text-blue-600" :
                "bg-gray-200 text-gray-600"
              }`}
            >
              {t.status}
            </span>

            <button
              onClick={() => alert("Afficher détails + réponses (à coder après)")}
              className="mt-4 flex items-center gap-2 text-blue-600"
            >
              <MessageSquare className="w-4 h-4" />
              Voir les réponses
            </button>
          </div>
        ))}
      </div>


      {/* MODAL AJOUT TICKET */}
      {showAdd && <AddTicketModal onClose={() => setShowAdd(false)} onSuccess={fetchTickets} />}
    </div>
  );
}

function AddTicketModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ title: "", message: "" });

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/tickets", form);
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Erreur création ticket:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <form onSubmit={submit} className="bg-white p-6 rounded-lg shadow w-full max-w-lg">

        <h2 className="text-xl font-semibold mb-4">Nouveau ticket</h2>

        <input
          name="title"
          required
          placeholder="Titre"
          value={form.title}
          onChange={change}
          className="w-full border p-2 rounded mb-3"
        />

        <textarea
          name="message"
          required
          rows={5}
          placeholder="Décrivez votre problème..."
          value={form.message}
          onChange={change}
          className="w-full border p-2 rounded mb-3"
        />

        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-3 py-1 border rounded">
            Annuler
          </button>
          <button type="submit" className="px-4 py-1 bg-blue-600 text-white rounded">
            Envoyer
          </button>
        </div>
      </form>
    </div>
  );
}
