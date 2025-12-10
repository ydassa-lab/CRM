import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../services/api";
import {
  ArrowLeft,
  Send,
  File,
  User,
  Calendar
} from "lucide-react";
import { motion } from "framer-motion";

export default function TicketDetails({ role }) {
  const { id } = useParams(); // ⬅️ On utilise SEULEMENT id
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);

  const fetchTicket = async () => {
    try {
      const res = await axios.get(`/tickets/${id}`);
      setTicket(res.data);
    } catch (err) {
      console.error("Erreur fetch ticket:", err);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const sendReply = async () => {
    if (!message.trim()) return;

    const formData = new FormData();
    formData.append("message", message);
    if (file) formData.append("attachment", file);

    try {
      await axios.post(`/tickets/${id}/reply`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setMessage("");
      setFile(null);
      fetchTicket();
    } catch (err) {
      console.error("Erreur réponse:", err);
    }
  };

  if (!ticket) return <p className="p-6">Chargement...</p>;

  const avatar = (u) =>
    (u?.prenom?.[0] || "?") + (u?.nom?.[0] || "");

  const isClient = (u) => u?.role === "client";

  return (
    <div className="p-6">

      {/* HEADER */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 flex items-center gap-2"
        >
          <ArrowLeft /> Retour
        </button>
        <h1 className="text-2xl font-semibold">Discussion du ticket</h1>
      </div>

      {/* TICKET HEADER CARD */}
      <div className="bg-white p-5 rounded-xl shadow mb-6">
        <h2 className="text-xl font-bold">{ticket.title}</h2>

        <div className="flex items-center gap-4 text-gray-600 text-sm mt-2">
          <span className="flex items-center gap-1">
            <User className="w-4 h-4" />
            {ticket.createdBy?.prenom} {ticket.createdBy?.nom}
          </span>

          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {new Date(ticket.createdAt).toLocaleString()}
          </span>
        </div>

        <p className="mt-4">{ticket.message}</p>

        {ticket.attachment && (
          <a
            href={`http://localhost:5000/uploads/${ticket.attachment}`}
            target="_blank"
            className="flex items-center gap-2 text-blue-600 mt-3 underline"
          >
            <File className="w-4 h-4" />
            Voir la pièce jointe
          </a>
        )}

        <span
          className={`inline-block mt-4 px-3 py-1 text-sm rounded-full ${
            ticket.status === "Ouvert"
              ? "bg-green-100 text-green-700"
              : ticket.status === "En cours"
              ? "bg-yellow-100 text-yellow-700"
              : ticket.status === "Résolu"
              ? "bg-blue-100 text-blue-700"
              : "bg-gray-200 text-gray-600"
          }`}
        >
          Statut : {ticket.status}
        </span>
      </div>

      {/* TIMELINE CHAT */}
      <div className="bg-white p-4 rounded-xl shadow mb-6 max-h-[60vh] overflow-y-auto space-y-6">

        {ticket.responses.length === 0 && (
          <p className="text-gray-500 text-center">Aucune réponse encore.</p>
        )}

        {ticket.responses.map((r, index) => {
          const fromClient = isClient(r.postedBy);

          return (
            <motion.div
              key={r._id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`flex items-start gap-3 ${
                fromClient ? "flex-row-reverse text-right" : "flex-row"
              }`}
            >

              {/* AVATAR */}
              <div
                className={`w-10 h-10 flex items-center justify-center rounded-full text-white font-bold ${
                  fromClient ? "bg-blue-600" : "bg-gray-600"
                }`}
              >
                {avatar(r.postedBy)}
              </div>

              {/* MESSAGE */}
              <div>
                <div
                  className={`p-3 rounded-2xl shadow max-w-xs break-words ${
                    fromClient
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-gray-200 text-gray-900 rounded-bl-none"
                  }`}
                >
                  {r.message}

                  {r.attachment && (
                    <a
                      href={`http://localhost:5000/uploads/${r.attachment}`}
                      target="_blank"
                      className={`flex items-center gap-2 underline mt-2 ${
                        fromClient ? "text-white" : "text-blue-700"
                      }`}
                    >
                      <File className="w-4 h-4" />
                      Fichier joint
                    </a>
                  )}
                </div>

                <p className="text-xs text-gray-400 mt-1">
                  {new Date(r.createdAt).toLocaleString()}
                </p>
              </div>

            </motion.div>
          );
        })}
      </div>

      {/* BOX DE RÉPONSE */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h3 className="text-lg font-semibold mb-3">Envoyer une réponse</h3>

        <textarea
          placeholder="Votre réponse..."
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="mt-2"
        />

        <button
          onClick={sendReply}
          className="mt-3 flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded"
        >
          <Send className="w-4 h-4" />
          Envoyer
        </button>
      </div>

    </div>
  );
}
