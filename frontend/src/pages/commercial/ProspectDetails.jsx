// crm-frontend/src/pages/commercial/ProspectDetails.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api";
import toast from "../../utils/toast";

export default function ProspectDetails(){
  const { id } = useParams();
  const [p, setP] = useState(null);

  useEffect(()=>{
    api.get(`/prospect/${id}`).then(r=>setP(r.data)).catch(()=>toast.error("Impossible de charger"));
  }, [id]);

  if (!p) return <div className="p-4">Chargement...</div>;

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-2">{p.prenom} {p.nom}</h2>
      <p><strong>Email:</strong> {p.email}</p>
      <p><strong>Téléphone:</strong> {p.telephone}</p>
      <p><strong>Source:</strong> {p.source}</p>
      <p><strong>Statut:</strong> {p.statut}</p>
      <p className="mt-3"><strong>Notes:</strong></p>
      <div className="p-3 border rounded mt-2">{p.notes || "Aucune"}</div>
    </div>
  );
}
