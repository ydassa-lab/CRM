// src/components/AddTicketModal.jsx
import { useState } from "react";

export default function AddTicketModal({ onClose, onSave }) {
  const [form, setForm] = useState({ title: "", description: "", priority: "medium", tags: "" });

  const change = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const submit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return alert("Titre requis");
    const body = { ...form, tags: form.tags ? form.tags.split(",").map(s=>s.trim()).filter(Boolean) : [] };
    onSave(body);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <form onSubmit={submit} className="bg-white p-6 rounded shadow w-full max-w-md">
        <h3 className="text-lg font-bold mb-4">Nouveau ticket</h3>

        <input name="title" value={form.title} onChange={change} placeholder="Titre" className="border p-2 w-full mb-2" />
        <textarea name="description" value={form.description} onChange={change} placeholder="Description" className="border p-2 w-full mb-2" />
        <div className="flex gap-2">
          <select name="priority" value={form.priority} onChange={change} className="border p-2">
            <option value="low">Faible</option>
            <option value="medium">Moyenne</option>
            <option value="high">Haute</option>
          </select>
          <input name="tags" value={form.tags} onChange={change} placeholder="Tags (csv)" className="border p-2 flex-1" />
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-3 py-1 border rounded">Annuler</button>
          <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded">Créer</button>
        </div>
      </form>
    </div>
  );
}
