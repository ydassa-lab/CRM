// src/components/TicketDetails.jsx
import { useEffect, useState } from "react";
import api from "../services/api";
import toast from "../utils/toast.js";

export default function TicketDetails({ ticket, onClose, onUpdated }) {
  const [data, setData] = useState(ticket);
  const [loading, setLoading] = useState(false);
  const [comment, setComment] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/tickets/${ticket._id}`);
      setData(res.data);
    } catch (err) {
      toast.error("Impossible de charger le ticket");
    } finally { setLoading(false); }
  };

  useEffect(()=>{ load(); }, [ticket._id]);

  const addComment = async () => {
    if (!comment.trim()) return;
    try {
      const res = await api.post(`/tickets/${ticket._id}/comments`, { message: comment });
      setData(res.data);
      setComment("");
      toast.success("Commentaire ajouté");
      onUpdated?.();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Erreur commentaire");
    }
  };

  const changeStatus = async (status) => {
    try {
      await api.put(`/tickets/${ticket._id}`, { status });
      toast.success("Statut mis à jour");
      load();
      onUpdated?.();
    } catch (err) {
      toast.error("Erreur mise à jour");
    }
  };

  const assignToMe = async () => {
    try {
      // backend will accept assignedTo id
      const meId = JSON.parse(localStorage.getItem("user") || "{}").id;
      await api.put(`/tickets/${ticket._id}`, { assignedTo: meId });
      toast.success("Assigné à vous");
      load();
      onUpdated?.();
    } catch (err) { toast.error("Erreur assignation"); }
  };

  if (!data) return null;

  return (
    <div className="fixed inset-0 flex items-start justify-center pt-8 bg-black/40 z-50">
      <div className="bg-white p-6 rounded shadow w-full max-w-3xl">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold">{data.title}</h3>
            <div className="text-sm text-gray-500">{data.createdBy?.prenom} {data.createdBy?.nom} — {new Date(data.createdAt).toLocaleString()}</div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => changeStatus("in_progress")} className="px-2 py-1 border rounded">Prendre</button>
            <button onClick={() => changeStatus("resolved")} className="px-2 py-1 bg-green-600 text-white rounded">Résolu</button>
            <button onClick={() => changeStatus("closed")} className="px-2 py-1 bg-red-600 text-white rounded">Fermer</button>
            <button onClick={assignToMe} className="px-2 py-1 border rounded">M'assigner</button>
            <button onClick={onClose} className="px-2 py-1 border rounded">Fermer</button>
          </div>
        </div>

        <div className="mt-4">
          <h4 className="font-semibold">Description</h4>
          <p className="mt-2">{data.description || "—"}</p>
        </div>

        <div className="mt-4">
          <h4 className="font-semibold">Commentaires</h4>
          <div className="mt-2 space-y-3 max-h-60 overflow-auto">
            {data.comments?.length ? data.comments.map(c => (
              <div key={c._id} className="border p-2 rounded">
                <div className="text-sm text-gray-600">{c.author?.prenom} {c.author?.nom} — {new Date(c.createdAt).toLocaleString()}</div>
                <div className="mt-1">{c.message}</div>
              </div>
            )) : <div className="text-gray-500">Pas de commentaire</div>}
          </div>

          <div className="mt-3 flex gap-2">
            <input value={comment} onChange={e=>setComment(e.target.value)} placeholder="Ajouter un commentaire" className="border p-2 flex-1" />
            <button onClick={addComment} className="px-3 py-1 bg-blue-600 text-white rounded">Envoyer</button>
          </div>
        </div>
      </div>
    </div>
  );
}
