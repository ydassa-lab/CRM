// src/components/AddClientModal.jsx
import { useState } from "react";

export default function AddClientModal({ onClose, onSaveClient }) {
  const [form, setForm] = useState({
    prenom: "",
    nom: "",
    email: "",
    telephone: "",
    entreprise: "",
    adresse: "",
    notes: "",
    isActive: true
  });

  const change = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const submit = (e) => {
    e.preventDefault();
    if (!form.prenom.trim() || !form.nom.trim()) {
      alert("Prénom et nom sont obligatoires");
      return;
    }
    onSaveClient(form);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <form onSubmit={submit} className="bg-white p-6 rounded shadow w-full max-w-md">
        <h3 className="text-lg font-bold mb-4">Ajouter Client</h3>

        <div className="grid grid-cols-1 gap-3">
          <div className="flex gap-2">
            <input name="prenom" value={form.prenom} onChange={change} placeholder="Prénom" className="border p-2 flex-1 rounded" />
            <input name="nom" value={form.nom} onChange={change} placeholder="Nom" className="border p-2 flex-1 rounded" />
          </div>

          <input name="email" value={form.email} onChange={change} placeholder="Email" className="border p-2 rounded" />
          <input name="telephone" value={form.telephone} onChange={change} placeholder="Téléphone" className="border p-2 rounded" />
          <input name="entreprise" value={form.entreprise} onChange={change} placeholder="Entreprise" className="border p-2 rounded" />
          <input name="adresse" value={form.adresse} onChange={change} placeholder="Adresse" className="border p-2 rounded" />

          <textarea name="notes" value={form.notes} onChange={change} placeholder="Notes" className="border p-2 rounded" />

          <label className="inline-flex items-center gap-2 mt-1">
            <input type="checkbox" name="isActive" checked={form.isActive} onChange={change} />
            Compte actif
          </label>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-3 py-1 border rounded">Annuler</button>
          <button type="submit" className="px-3 py-1 bg-green-600 text-white rounded">Créer</button>
        </div>
      </form>
    </div>
  );
}
