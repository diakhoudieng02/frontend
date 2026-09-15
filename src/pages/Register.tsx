import { useState } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { PhoneInput } from '@/components/auth/PhoneInput';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton';
import { Loader2, Shield, ArrowRight, MessageCircle } from 'lucide-react'; // ✅ Remplacer Smartphone par MessageCircle
import { useToast } from '@/hooks/use-toast';
import type { ApiError } from '@/types/api';

export default function Register() {
  const { registerRequest, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+221');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (phone.length < 6) {
      toast({ 
        title: 'Numéro invalide', 
        description: 'Veuillez entrer un numéro de téléphone valide.', 
        variant: 'destructive' 
      });
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      const fullPhone = `${countryCode}${phone}`;
      
      await registerRequest(fullPhone);
      
      toast({ 
        title: '📩 Code envoyé !', 
        description: `Un message WhatsApp a été envoyé au ${countryCode} ${phone}` 
      });
      
      navigate('/verify-otp', { 
        state: { 
          phoneNumber: fullPhone, 
          flow: 'register' 
        } 
      });
    } catch (err) {
      const apiError = err as ApiError;
      const msg = apiError.message || 'Erreur lors de l\'envoi du code';
      setError(msg);
      toast({ title: 'Erreur', description: msg, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="mb-6 flex flex-col items-center gap-3 animate-fade-in">
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl btn-primary-gradient shadow-glow">
          <MessageCircle className="h-8 w-8 text-white" /> {/* ✅ Icône WhatsApp au lieu de Smartphone */}
          <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-accent shadow-sm">
            <Shield className="h-3 w-3 text-accent-foreground" />
          </div>
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-sage-blue-50 px-3 py-1">
          <Shield className="h-3 w-3 text-primary" />
          <span className="text-xs font-medium text-primary">Inscription sécurisée</span>
        </div>
        <h1 className="text-2xl font-display font-bold text-foreground">Créer un compte</h1>
        <p className="text-muted-foreground text-sm">Inscrivez-vous rapidement avec votre téléphone</p>
      </div>

      <div className="card-elevated rounded-2xl p-6 animate-slide-up">
        <div className="mb-5 flex items-start gap-3 rounded-xl bg-sage-blue-50 p-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <MessageCircle className="h-4 w-4 text-primary" /> {/* ✅ Icône WhatsApp au lieu de Smartphone */}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Inscription par WhatsApp</p>
            <p className="text-xs text-muted-foreground">Nous vous enverrons un code de vérification par WhatsApp</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-destructive/10 px-4 py-3">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-destructive/20">
                <span className="text-xs text-destructive">!</span>
              </div>
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Numéro de téléphone</label>
            <PhoneInput 
              value={phone} 
              onChange={setPhone} 
              countryCode={countryCode} 
              onCountryChange={setCountryCode} 
            />
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Shield className="h-3 w-3" /> Vos données sont protégées et cryptées
            </p>
          </div>

          <Button 
            type="submit" 
            className="group w-full h-12 text-base rounded-xl btn-primary-gradient border-0 relative overflow-hidden" 
            disabled={loading}
          >
            <span className={`inline-flex items-center gap-2 transition-all duration-300 ${loading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
              <MessageCircle className="h-4 w-4" /> {/* ✅ Icône WhatsApp au lieu de ArrowRight seul */}
              Recevoir le code
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
            {loading && (
              <span className="absolute inset-0 flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-white" />
                <span className="text-white text-sm">Envoi en cours...</span>
              </span>
            )}
          </Button>
        </form>

        {/* SÉPARATEUR + BOUTON GOOGLE */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Ou s'inscrire avec
            </span>
          </div>
        </div>

        <GoogleLoginButton mode="register" />

        <div className="mt-5 text-center">
          <p className="text-sm text-muted-foreground">
            Déjà inscrit ?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}