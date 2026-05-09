import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    skillsOffered: '',
    skillsWanted: '',
  });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        skillsOffered: form.skillsOffered.split(',').map((s) => s.trim()).filter(Boolean),
        skillsWanted: form.skillsWanted.split(',').map((s) => s.trim()).filter(Boolean),
      });
      nav('/dashboard');
    } catch (e) {
      setErr(e.response?.data?.error || 'Registration failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-card">
      <h2>Join SkillSwap</h2>
      <form onSubmit={submit}>
        <label>Name<input required value={form.name} onChange={set('name')} /></label>
        <label>Email<input type="email" required value={form.email} onChange={set('email')} /></label>
        <label>Password (min 6)
          <input type="password" required minLength={6} value={form.password} onChange={set('password')} />
        </label>
        <label>Skills you offer (comma-separated)
          <input value={form.skillsOffered} onChange={set('skillsOffered')} placeholder="Python, Photography" />
        </label>
        <label>Skills you want
          <input value={form.skillsWanted} onChange={set('skillsWanted')} placeholder="Spanish, Yoga" />
        </label>
        {err && <div className="alert error">{err}</div>}
        <button className="btn btn-primary" disabled={busy}>{busy ? 'Creating…' : 'Create account'}</button>
      </form>
      <p className="muted">Already have an account? <Link to="/login">Log in</Link></p>
    </div>
  );
}
