import { useEffect, useState, useCallback } from 'react';
import api from '../api/client.js';

function StatusPill({ status }) {
  return <span className={`pill status-${status}`}>{status}</span>;
}

export default function Requests() {
  const [data, setData] = useState({ incoming: [], outgoing: [] });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await api.get('/requests');
    setData(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const act = async (id, status) => {
    await api.patch(`/requests/${id}`, { status });
    load();
  };

  if (loading) return <div className="loading">Loading…</div>;

  return (
    <section>
      <h2>Incoming requests</h2>
      {data.incoming.length === 0 ? (
        <p className="empty">No incoming requests yet.</p>
      ) : (
        <ul className="req-list">
          {data.incoming.map((r) => (
            <li key={r.id} className="req-row">
              <div>
                <StatusPill status={r.status} />
                <strong>{r.requester?.name}</strong> wants to learn{' '}
                <em>{r.listing?.skillName}</em>
                <p className="muted">Offers: <b>{r.offerSkill}</b></p>
                {r.message && <p className="quote">“{r.message}”</p>}
              </div>
              {r.status === 'pending' && (
                <div className="row-end">
                  <button className="btn btn-primary btn-sm" onClick={() => act(r.id, 'approved')}>Approve</button>
                  <button className="btn btn-danger btn-sm" onClick={() => act(r.id, 'rejected')}>Reject</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <h2>Outgoing requests</h2>
      {data.outgoing.length === 0 ? (
        <p className="empty">You haven't sent any requests yet.</p>
      ) : (
        <ul className="req-list">
          {data.outgoing.map((r) => (
            <li key={r.id} className="req-row">
              <div>
                <StatusPill status={r.status} />
                You asked <strong>{r.receiver?.name}</strong> for{' '}
                <em>{r.listing?.skillName}</em>
                <p className="muted">You offered: <b>{r.offerSkill}</b></p>
                {r.message && <p className="quote">“{r.message}”</p>}
              </div>
              {r.status === 'pending' && (
                <div className="row-end">
                  <button className="btn btn-ghost btn-sm" onClick={() => act(r.id, 'cancelled')}>Cancel</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
