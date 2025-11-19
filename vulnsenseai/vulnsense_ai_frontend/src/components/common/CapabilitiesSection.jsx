import { AlertTriangle, GitBranch, Zap, Bot } from 'lucide-react';

export function CapabilitiesSection() {
  return (
    <section className="capabilities-section">
      <div className="capabilities-container">
        <div className="capabilities-header">
          <h3>Advanced AI Capabilities</h3>
          <p>Built on cutting-edge technology for comprehensive security analysis</p>
        </div>

        <div className="capabilities-grid">
          <div className="capability-card">
            <div className="capability-header">
              <AlertTriangle className="capability-icon capability-icon-red" />
              <h4>Vulnerability Detection</h4>
            </div>
            <p>OWASP Top 10, CVE analysis, SQL injection, XSS, CSRF, and advanced threat detection</p>
          </div>

          <div className="capability-card">
            <div className="capability-header">
              <GitBranch className="capability-icon capability-icon-blue" />
              <h4>Code Analysis</h4>
            </div>
            <p>Static analysis, dependency scanning, secret detection, and code quality assessment</p>
          </div>

          <div className="capability-card">
            <div className="capability-header">
              <Zap className="capability-icon capability-icon-yellow" />
              <h4>Auto-Remediation</h4>
            </div>
            <p>Intelligent patch generation, configuration fixes, and security hardening automation</p>
          </div>

          <div className="capability-card">
            <div className="capability-header">
              <Bot className="capability-icon capability-icon-purple" />
              <h4>AI Intelligence</h4>
            </div>
            <p>Machine learning models trained on latest security research and vulnerability databases</p>
          </div>
        </div>
      </div>
    </section>
  );
}
