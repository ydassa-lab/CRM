import { useEffect, useState } from "react";
import axios from "../services/api";
import { MessageSquare, Reply, Users } from "lucide-react";

export default function SupportTickets() {
  const [tickets, setTickets] = useState([]);
  const [filter, setFilter] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);

  const fetchTickets = async () => {
    try {
      const res = await axios.get(`/tickets${filter ? "?status=" + filter : ""}`);
      setTickets(res.data);
    } catch (err) {
      console.error("Erreur fetch tickets:", err);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [filter]);

  return (
    <div className="p-6">

      {/* FILTRES */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-semibold">Tickets Support</h1>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Tous</option>
          <option value="Ouvert">Ouverts</option>
          <option value="En cours">En cours</option>
          <option value="Résolu">Résolus</option>
          <option value="Fermé">Fermés</option>
        </select>
      </div>

      {/* LISTE DES TICKETS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tickets.map((t) => (
          <div key={t._id} className="bg-white p-4 border rounded shadow">
            <h3 className="text-lg font-semibold">{t.title}</h3>
            <p className="text-gray-700 mt-2">{t.message}</p>

            <div className="mt-3 text-sm text-gray-600">
              De : <strong>{t.createdBy?.prenom} {t.createdBy?.nom}</strong>
            </div>

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

            <div className="flex gap-3 mt-4">
              <button
                className="text-blue-600 flex items-center gap-2"
                onClick={() => setSelectedTicket(t)}
              >
                <MessageSquare className="w-4 h-4" /> Gérer
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedTicket && (
        <TicketManageModal 
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          refresh={fetchTickets}
        />
      )}
    </div>
  );
}



/* --------------------------------------------------------
   MODAL POUR RÉPONDRE / CHANGER STATUT / ASSIGNER AGENT
---------------------------------------------------------*/
function TicketManageModal({ ticket, onClose, refresh }) {
  const [response, setResponse] = useState("");
  const [status, setStatus] = useState(ticket.status);

  const sendReply = async () => {
    try {
      await axios.post(`/tickets/${ticket._id}/reply`, { message: response });
      setResponse("");
      refresh();
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  const updateStatus = async () => {
    try {
      await axios.put(`/tickets/${ticket._id}/status`, { status });
      refresh();
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow w-full max-w-xl">

        <h2 className="text-xl font-semibold mb-2">{ticket.title}</h2>
        <p className="text-gray-700 mb-4">{ticket.message}</p>

        {/* Réponses */}
        <div className="bg-gray-100 p-3 rounded mb-4 max-h-48 overflow-y-auto">
          {ticket.responses.length === 0 && (
            <p className="text-gray-500 text-sm">Aucune réponse pour le moment.</p>
          )}

          {ticket.responses.map((r, i) => (
            <div key={i} className="mb-2 p-2 bg-white rounded shadow-sm">
              <strong>{r.postedBy?.prenom} :</strong>
              <p>{r.message}</p>
            </div>
          ))}
        </div>

        {/* Répondre */}
        <textarea
          rows={4}
          placeholder="Votre réponse..."
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          className="w-full border p-2 rounded mb-4"
        />

        {/* Changer statut */}
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border p-2 rounded w-full mb-4"
        >
          <option>Ouvert</option>
          <option>En cours</option>
          <option>Résolu</option>
          <option>Fermé</option>
        </select>

        <div className="flex justify-between mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded"
          >
            Fermer
          </button>

          <div className="flex gap-3">
            <button
              onClick={updateStatus}
              className="px-4 py-2 bg-yellow-600 text-white rounded"
            >
              Mettre statut à jour
            </button>

            <button
              onClick={sendReply}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Répondre
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
