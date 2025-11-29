// crm-frontend/src/components/Pagination.jsx
export default function Pagination({ meta, onChange }) {
  const { page, pages } = meta || { page:1, pages:1 };
  const prev = () => onChange(Math.max(1, page-1));
  const next = () => onChange(Math.min(pages, page+1));

  const range = [];
  for (let i = 1; i <= pages; i++) range.push(i);

  return (
    <div className="flex items-center gap-2">
      <button onClick={prev} className="px-3 py-1 border rounded">Prev</button>
      {range.map(p => (
        <button key={p} onClick={()=>onChange(p)} className={`px-3 py-1 border rounded ${p===page? "bg-gray-200": ""}`}>{p}</button>
      ))}
      <button onClick={next} className="px-3 py-1 border rounded">Next</button>
    </div>
  );
}
