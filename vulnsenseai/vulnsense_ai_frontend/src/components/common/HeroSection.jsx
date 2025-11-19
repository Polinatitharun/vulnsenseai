import { Bot, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function HeroSection({ }) {
  const navigate = useNavigate()
  return (
    <section className="hero-section">
      <div className="hero-container">
        <div className="hero-icon">
          <Bot className="icon" />
        </div>
        <h2 className="hero-title">Autonomous Vulnerability Detection</h2>
        <p className="hero-description">
          VulnSense AI is an advanced agentic platform that automatically scans, detects, 
          and resolves security vulnerabilities in your code repositories and web applications.
        </p>
        <div className="hero-cta">
          <button onClick={() => navigate("/login")} className="btn btn-primary btn-large">
            Get Started
            <ArrowRight className="btn-icon" />
          </button>
        </div>
      </div>
    </section>
  );
}
