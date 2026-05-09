import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/client.js';

export default function SkillCard({ listing, onChange }) {
  const { user } = useAuth();
  const isOwner = user && user.id === listing.ownerId;
  const isAdmin = user?.role === 'admin';
  const [showRequest, setShowRequest] = useState(false);
  const [offerSkill, setOfferSkill] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [okMsg, setOkMsg] = useState('');

  const handleDelete = async () => {
    if (!confirm('Delete this listing?')) return;
    await api.delete(`/skills/${listing.id}`);
    onChange?.();
  };

  const handleRequest = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    setOkMsg('');
    try {
      await api.post('/requests', {
        listingId: listing.id,
        offerSkill,
        message,
      });
      setOkMsg('Request sent!');
      setOfferSkill('');
      setMessage('');
      setShowRequest(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className="card">
      <header className="card-head">
        <span className="pill">{listing.category}</span>
        {(isOwner || isAdmin) && (
          <button className="icon-btn" title="Delete" onClick={handleDelete}>✕</button>
        )}
      </header>
      <h3>{listing.skillName}</h3>
      <p className="muted">{listing.description}</p>
      <footer className="card-foot">
        <span className="by">by <b>{listing.owner?.name || 'Unknown'}</b></span>
        {user && !isOwner && (
          <button className="btn btn-primary btn-sm" onClick={() => setShowRequest((v) => !v)}>
            {showRequest ? 'Cancel' : 'Request swap'}
          </button>
        )}
      </footer>
      {okMsg && <div className="alert success">{okMsg}</div>}
      {showRequest && (
        <form onSubmit={handleRequest} className="request-form">
          <label>
            Skill you offer in exchange
            <input
              required
              value={offerSkill}
              onChange={(e) => setOfferSkill(e.target.value)}
              placeholder="e.g. French Conversation"
            />
          </label>
          <label>
            Message (optional)
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hi! I'd love to swap…"
              rows={3}
            />
          </label>
          {error && <div className="alert error">{error}</div>}
          <button className="btn btn-primary" disabled={busy}>
            {busy ? 'Sending…' : 'Send request'}
          </button>
        </form>
      )}
    </article>
  );
}
