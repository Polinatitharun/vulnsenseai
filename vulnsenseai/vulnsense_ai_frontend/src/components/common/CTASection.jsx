import { useNavigate } from "react-router-dom";

export function CTASection({  }) {
  const navigate = useNavigate()
  return (
    <section className="cta-section">
      <div className="cta-container">
        <h3>Ready to Secure Your Applications?</h3>
        <p>
          Join leading organizations using VulnSense AI to automate their security workflows 
          and protect against emerging threats.
        </p>
        <div className="cta-button">
          <button onClick={() => navigate("/login")} className="btn btn-secondary btn-large">
            Get Started Now
          </button>
        </div>
      </div>
    </section>
  );
}
