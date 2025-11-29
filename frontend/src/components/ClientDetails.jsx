// src/components/ClientDetails.jsx
import { useEffect, useState } from "react";
import api from "../services/api";
import toast from "../utils/toast.js";

export default function ClientDetails({ client, onClose }) {
  const [data, setData] = useState(client);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/user/${client._id}`);
        setData(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Impossible de charger le client");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [client._id]);

  if (!data) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white p-6 rounded shadow w-full max-w-2xl">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-bold">{data.prenom} {data.nom}</h3>
          <div className="text-sm text-gray-500">{new Date(data.createdAt).toLocaleString()}</div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <p><strong>Email:</strong> {data.email || "-"}</p>
            <p className="mt-2"><strong>Téléphone:</strong> {data.telephone || "-"}</p>
            <p className="mt-2"><strong>Entreprise:</strong> {data.entreprise || "-"}</p>
          </div>

          <div>
            <p><strong>Statut:</strong> {data.isActive ? <span className="text-green-600">Actif</span> : <span className="text-red-600">Inactif</span>}</p>
            <p className="mt-2"><strong>Rôle:</strong> {data.role}</p>
          </div>
        </div>

        <div className="mt-4">
          <h4 className="font-semibold">Notes</h4>
          <p className="mt-2 whitespace-pre-line">{data.notes || "—"}</p>
        </div>

        <div className="mt-6 text-right">
          <button onClick={onClose} className="px-3 py-1 border rounded">Fermer</button>
        </div>
      </div>
    </div>
  );
}
