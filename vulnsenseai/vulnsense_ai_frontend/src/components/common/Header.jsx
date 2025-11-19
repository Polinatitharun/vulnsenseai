import { Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Header({ }) {
  const navigate = useNavigate()
  return (
    <header className="header">
      <div className="header-container">
        <div className="header-content">
          <div className="logo">
            <div className="logo-icon">
              <Shield className="icon" />
            </div>
            <div className="logo-text">
              <h1>VulnSense AI</h1>
              <p>Agentic Security Platform</p>
            </div>
          </div>
          <button onClick={() => navigate("/login")} className="btn btn-primary">
            Sign In
          </button>
        </div>
      </div>
    </header>
  );
}
