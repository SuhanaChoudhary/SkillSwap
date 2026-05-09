import { useEffect, useState, useCallback } from 'react';
import api from '../api/client.js';

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [u, s] = await Promise.all([
      api.get('/admin/users'),
      api.get('/admin/stats'),
    ]);
    setUsers(u.data.items);
    setStats(s.data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const remove = async (id) => {
    if (!confirm('Delete this user and all their data?')) return;
    await api.delete(`/admin/users/${id}`);
    load();
  };

  if (loading) return <div className="loading">Loading…</div>;

  return (
    <section>
      <h2>Admin dashboard</h2>
      {stats && (
        <div className="stats-grid">
          <div className="stat"><span className="stat-num">{stats.users}</span><span>Users</span></div>
          <div className="stat"><span className="stat-num">{stats.listings}</span><span>Listings</span></div>
          <div className="stat"><span className="stat-num">{stats.requests}</span><span>Requests</span></div>
          <div className="stat"><span className="stat-num">{stats.pending}</span><span>Pending</span></div>
        </div>
      )}

      <h3>All users</h3>
      <table className="table">
        <thead>
          <tr><th>Name</th><th>Email</th><th>Role</th><th>Offered</th><th>Wanted</th><th></th></tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td><span className={`pill ${u.role === 'admin' ? 'status-approved' : ''}`}>{u.role}</span></td>
              <td>{(u.skillsOffered || []).join(', ')}</td>
              <td>{(u.skillsWanted || []).join(', ')}</td>
              <td>
                {u.role !== 'admin' && (
                  <button className="btn btn-danger btn-sm" onClick={() => remove(u.id)}>Delete</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
