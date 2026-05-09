import { useEffect, useState, useCallback } from 'react';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Profile() {
  const { user, updateMe } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [offered, setOffered] = useState((user?.skillsOffered || []).join(', '));
  const [wanted, setWanted] = useState((user?.skillsWanted || []).join(', '));
  const [savedMsg, setSavedMsg] = useState('');

  // Listings
  const [listings, setListings] = useState([]);
  const [editing, setEditing] = useState(null); // {id, ...}
  const [form, setForm] = useState({ skillName: '', description: '', category: '' });
  const [err, setErr] = useState('');

  const loadListings = useCallback(async () => {
    const { data } = await api.get('/skills', { params: { owner: user.id } });
    setListings(data.items);
  }, [user.id]);

  useEffect(() => {
    loadListings();
  }, [loadListings]);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSavedMsg('');
    await updateMe({
      name,
      skillsOffered: offered.split(',').map((s) => s.trim()).filter(Boolean),
      skillsWanted: wanted.split(',').map((s) => s.trim()).filter(Boolean),
    });
    setSavedMsg('Saved!');
    setTimeout(() => setSavedMsg(''), 2000);
  };

  const submitListing = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      if (editing) {
        await api.put(`/skills/${editing.id}`, form);
      } else {
        await api.post('/skills', form);
      }
      setForm({ skillName: '', description: '', category: '' });
      setEditing(null);
      loadListings();
    } catch (e) {
      setErr(e.response?.data?.error || 'Failed');
    }
  };

  const startEdit = (l) => {
    setEditing(l);
    setForm({ skillName: l.skillName, description: l.description, category: l.category });
  };

  const cancelEdit = () => {
    setEditing(null);
    setForm({ skillName: '', description: '', category: '' });
  };

  const removeListing = async (id) => {
    if (!confirm('Delete this listing?')) return;
    await api.delete(`/skills/${id}`);
    loadListings();
  };

  return (
    <section className="profile">
      <h2>Your profile</h2>
      <form onSubmit={saveProfile} className="panel">
        <label>Name<input value={name} onChange={(e) => setName(e.target.value)} /></label>
        <label>Skills offered (comma-separated)
          <input value={offered} onChange={(e) => setOffered(e.target.value)} />
        </label>
        <label>Skills wanted
          <input value={wanted} onChange={(e) => setWanted(e.target.value)} />
        </label>
        <div className="row-end">
          {savedMsg && <span className="alert success inline">{savedMsg}</span>}
          <button className="btn btn-primary">Save profile</button>
        </div>
      </form>

      <h2>Your skill listings</h2>
      <form onSubmit={submitListing} className="panel">
        <h3>{editing ? 'Edit listing' : 'New listing'}</h3>
        <label>Skill name
          <input required value={form.skillName} onChange={(e) => setForm({ ...form, skillName: e.target.value })} />
        </label>
        <label>Description
          <textarea required rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </label>
        <label>Category
          <input required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Programming, Music…" />
        </label>
        {err && <div className="alert error">{err}</div>}
        <div className="row-end">
          {editing && <button type="button" className="btn btn-ghost" onClick={cancelEdit}>Cancel</button>}
          <button className="btn btn-primary">{editing ? 'Save changes' : 'Add listing'}</button>
        </div>
      </form>

      {listings.length === 0 ? (
        <p className="empty">You haven't listed any skills yet.</p>
      ) : (
        <ul className="listing-list">
          {listings.map((l) => (
            <li key={l.id} className="listing-row">
              <div>
                <span className="pill">{l.category}</span>
                <strong>{l.skillName}</strong>
                <p className="muted small">{l.description}</p>
              </div>
              <div className="row-end">
                <button className="btn btn-ghost btn-sm" onClick={() => startEdit(l)}>Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => removeListing(l.id)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
