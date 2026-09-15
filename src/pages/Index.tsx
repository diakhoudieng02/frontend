import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/ui/HeroSection';
import FeaturesSection from '@/components/ui/FeaturesSection';
import BenefitsSection from '@/components/ui/BenefitsSection';
import CTASection from '@/components/ui/CTASection';

export default function Index() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleCTA = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      // Rediriger vers la page d'inscription
      navigate('/register');
    }
  };

  const handleViewDemo = () => {
    navigate('/demo');
  };

  const handleViewLogin = () => {
    // Pour le bouton "Voir la démo" ou autres actions nécessitant la connexion
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      
      
      <HeroSection 
        onGetStarted={handleCTA}
        onViewDemo={handleViewDemo}
       
      />
      
      <FeaturesSection />
      <BenefitsSection />
      <CTASection onGetStarted={handleCTA} />
      
      <Footer />
    </div>
  );
}