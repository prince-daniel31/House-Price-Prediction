import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="page-container not-found">
      <p className="not-found-code">404</p>
      <h1 className="page-title">This page doesn't exist</h1>
      <p className="page-subtitle" style={{ margin: "0 auto 32px" }}>
        The page you're looking for was moved or never built. Head back to the estimator.
      </p>
      <Link to="/" className="btn-secondary">
        ← Back home
      </Link>
    </div>
  );
}
