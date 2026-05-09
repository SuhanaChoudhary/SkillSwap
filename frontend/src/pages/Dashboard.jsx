import { useEffect, useState, useCallback } from 'react';
import api from '../api/client.js';
import SkillCard from '../components/SkillCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (category) params.category = category;
    const { data } = await api.get('/skills', { params });
    setItems(data.items);
    setLoading(false);
  }, [search, category]);

  useEffect(() => {
    load();
  }, [load]);

  const categories = Array.from(new Set(items.map((i) => i.category)));

  return (
    <section>
      <div className="hero">
        <h1>Find a skill. Trade one back.</h1>
        <p>Browse what your community is teaching. Offer what you know in return — no money involved.</p>
      </div>

      <div className="filters">
        <input
          type="search"
          placeholder="Search skills, e.g. guitar, python, cooking…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        {!user && (
          <span className="hint">Tip: <a href="/login">log in</a> to request a swap.</span>
        )}
      </div>

      {loading ? (
        <div className="loading">Loading…</div>
      ) : items.length === 0 ? (
        <div className="empty">No skills match your search.</div>
      ) : (
        <div className="grid">
          {items.map((l) => (
            <SkillCard key={l.id} listing={l} onChange={load} />
          ))}
        </div>
      )}
    </section>
  );
}
