// src/pages/Clients.jsx
import { useEffect, useState } from "react";
import api from "../services/api";
import Pagination from "../components/Pagination.jsx";
import AddClientModal from "../components/AddClientModal.jsx";
import ClientDetails from "../components/ClientDetails.jsx";
import toast from "../utils/toast.js";

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("createdAt:desc");
  const [loading, setLoading] = useState(false);

  const [showAdd, setShowAdd] = useState(false);
  const [viewClient, setViewClient] = useState(null);

  const fetchClients = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: meta.limit,
        sort,
        role: "client"
      };
      if (q) params.search = q;
      const res = await api.get("/user", { params });
      setClients(res.data.data || []);
      setMeta(res.data.meta || { page: 1, limit: 10, total: 0, pages: 1 });
    } catch (err) {
      console.error(err);
      toast.error("Impossible de charger les clients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients(1);
    // eslint-disable-next-line
  }, [q, sort]);

  const handleAddClient = async (payload) => {
    try {
      // ensure role=client
      const body = { ...payload, role: "client", isActive: payload.isActive ?? true };
      await api.post("/auth/signup", body); // if your backend signup route creates a User
      toast.success("Client créé");
      setShowAdd(false);
      fetchClients(1);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Erreur création client");
    }
  };

  const toggleActive = async (id, isActive) => {
    try {
      await api.patch(`/user/${id}/activate`, { isActive });
      toast.success("Statut mis à jour");
      fetchClients(meta.page);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Erreur activation");
    }
  };

  const onDelete = async (id) => {
    try {
      await api.delete(`/user/${id}`);
      toast.success("Client supprimé");
      fetchClients(meta.page);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Erreur suppression");
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Clients</h1>
        <div className="flex gap-2">
          <button onClick={() => setShowAdd(true)} className="bg-green-600 text-white px-4 py-2 rounded shadow hover:brightness-95">Ajouter Client</button>
        </div>
      </div>

      <div className="flex gap-3 mb-4">
        <input
          placeholder="Recherche (nom, email, téléphone)"
          value={q}
          onChange={e => setQ(e.target.value)}
          className="border p-2 flex-1 rounded"
        />
        <select value={sort} onChange={e => setSort(e.target.value)} className="border p-2 rounded">
          <option value="createdAt:desc">Plus récents</option>
          <option value="createdAt:asc">Plus anciens</option>
          <option value="prenom:asc">Prénom A→Z</option>
          <option value="prenom:desc">Prénom Z→A</option>
        </select>
      </div>

      <div className="bg-white shadow rounded overflow-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">Nom</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Téléphone</th>
              <th className="p-3 text-left">Statut</th>
              <th className="p-3 text-left">Créé le</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="p-4 text-center">Chargement...</td></tr>
            ) : clients.length === 0 ? (
              <tr><td colSpan="6" className="p-4 text-center">Aucun client</td></tr>
            ) : clients.map(c => (
              <tr key={c._id} className="border-t hover:bg-gray-50">
                <td className="p-3">{c.prenom} {c.nom}</td>
                <td className="p-3">{c.email || "-"}</td>
                <td className="p-3">{c.telephone || "-"}</td>
                <td className="p-3">
                  {c.isActive ? <span className="inline-block px-2 py-1 text-sm rounded bg-green-100 text-green-700">Actif</span> : <span className="inline-block px-2 py-1 text-sm rounded bg-red-100 text-red-700">Inactif</span>}
                </td>
                <td className="p-3">{new Date(c.createdAt).toLocaleDateString()}</td>
                <td className="p-3 flex gap-2">
                  <button onClick={() => setViewClient(c)} className="px-2 py-1 border rounded">Voir</button>
                  {c.isActive ? (
                    <button onClick={() => toggleActive(c._id, false)} className="px-2 py-1 bg-yellow-500 text-white rounded">Désactiver</button>
                  ) : (
                    <button onClick={() => toggleActive(c._id, true)} className="px-2 py-1 bg-green-600 text-white rounded">Activer</button>
                  )}
                  <button onClick={() => onDelete(c._id)} className="px-2 py-1 bg-red-600 text-white rounded">Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4">
        <Pagination meta={meta} onChange={(p) => fetchClients(p)} />
      </div>

      {showAdd && <AddClientModal onClose={() => setShowAdd(false)} onSaveClient={handleAddClient} />}
      {viewClient && <ClientDetails client={viewClient} onClose={() => setViewClient(null)} />}
    </div>
  );
}
