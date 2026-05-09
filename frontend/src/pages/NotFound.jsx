import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="empty" style={{ padding: '4rem 0' }}>
      <h2>404</h2>
      <p>That page doesn't exist.</p>
      <Link className="btn btn-primary" to="/">Back home</Link>
    </div>
  );
}
