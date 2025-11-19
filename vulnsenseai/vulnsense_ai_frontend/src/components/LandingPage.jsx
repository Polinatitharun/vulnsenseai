import '../styles/LandingPage.css';
import { Header } from './common/Header';
import { HeroSection } from './common/HeroSection';
import { FeaturesSection } from './common/FeaturesSection';
import { CapabilitiesSection } from './common/CapabilitiesSection';
import { CTASection } from './common/CTASection';
import { Footer } from './common/Footer';

export function LandingPage({ onNavigateToLogin }) {
  return (
    <div className="landing-page">
      <Header onNavigateToLogin={onNavigateToLogin} />
      <HeroSection onNavigateToLogin={onNavigateToLogin} />
      <FeaturesSection />
      <CapabilitiesSection />
      <CTASection onNavigateToLogin={onNavigateToLogin} />
      <Footer />
    </div>
  );
}
