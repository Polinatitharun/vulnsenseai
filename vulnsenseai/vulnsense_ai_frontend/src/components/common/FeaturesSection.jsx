import { Globe, CheckCircle, Users } from 'lucide-react';

export function FeaturesSection() {
  return (
    <section className="features-section">
      <div className="features-container">
        <div className="features-header">
          <h3>How VulnSense AI Works</h3>
          <p>Our agentic AI system provides end-to-end vulnerability management with intelligent automation</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-header">
              <div className="feature-icon feature-icon-blue">
                <Globe className="icon" />
              </div>
              <h4>Submit & Scan</h4>
            </div>
            <p>
              Users submit URLs or Git repositories. Our AI agent immediately begins 
              comprehensive security analysis using advanced scanning techniques.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-header">
              <div className="feature-icon feature-icon-green">
                <CheckCircle className="icon" />
              </div>
              <h4>Auto-Resolve</h4>
            </div>
            <p>
              Minor vulnerabilities are automatically fixed by our AI. Code patches, 
              configuration updates, and security improvements are applied instantly.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-header">
              <div className="feature-icon feature-icon-orange">
                <Users className="icon" />
              </div>
              <h4>Admin Review</h4>
            </div>
            <p>
              Critical issues are escalated to security admins with AI-generated 
              recommendations, detailed analysis, and suggested remediation strategies.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
