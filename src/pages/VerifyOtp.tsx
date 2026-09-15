import { useState, useEffect, useRef, useCallback } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Loader2, ArrowLeft, CheckCircle2, Shield, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { ApiError } from '@/types/api';

const OTP_LENGTH = 6;
const RESEND_DELAY = 60;

interface LocationState {
  phoneNumber?: string;
  flow?: 'login' | 'register';
}

export default function VerifyOtp() {
  const { registerVerify, loginVerify, registerRequest, loginRequest, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const state = location.state as LocationState;
  const phoneNumber = state?.phoneNumber;
  const flow = state?.flow || 'login';

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_DELAY);
  const [currentStep, setCurrentStep] = useState<'otp' | 'profile' | 'school'>(flow === 'register' ? 'otp' : 'otp');
  
  // Données du profil
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [schoolLevel, setSchoolLevel] = useState<string>('');
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleResend = useCallback(async () => {
    if (countdown > 0 || !phoneNumber) return;
    
    try {
      if (flow === 'register') {
        await registerRequest(phoneNumber);
      } else {
        await loginRequest(phoneNumber);
      }
      
      setCountdown(RESEND_DELAY);
      setOtp(Array(OTP_LENGTH).fill(''));
      setError('');
      inputRefs.current[0]?.focus();
      toast({ 
        title: '📩 Code renvoyé !', 
        description: `Un nouveau code a été envoyé` 
      });
    } catch {
      toast({ 
        title: 'Erreur', 
        description: 'Impossible de renvoyer le code', 
        variant: 'destructive' 
      });
    }
  }, [countdown, phoneNumber, flow, registerRequest, loginRequest, toast]);

  if (!phoneNumber) return <Navigate to="/login" replace />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const updated = [...otp];
    updated[index] = digit;
    setOtp(updated);
    setError('');
    
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    const updated = [...otp];
    
    for (let i = 0; i < pasted.length; i++) {
      updated[i] = pasted[i];
    }
    
    setOtp(updated);
    inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const code = otp.join('');
    
    // ÉTAPE 1 : Vérification OTP
    if (currentStep === 'otp') {
      if (code.length !== OTP_LENGTH) {
        toast({ 
          title: 'Code incomplet', 
          description: 'Veuillez entrer les 6 chiffres du code.', 
          variant: 'destructive' 
        });
        return;
      }
      
      // Pour la connexion, on vérifie directement
      if (flow === 'login') {
        setLoading(true);
        try {
          await loginVerify(phoneNumber, code);
          toast({ 
            title: '🎉 Connexion réussie !', 
            description: 'Bienvenue sur ETOOBLO AI.', 
          });
        } catch (err) {
          const apiError = err as ApiError;
          const msg = apiError.message || 'Code incorrect';
          setError(msg);
          toast({ title: 'Erreur', description: msg, variant: 'destructive' });
          setOtp(Array(OTP_LENGTH).fill(''));
          inputRefs.current[0]?.focus();
        } finally {
          setLoading(false);
        }
      } else {
        // Pour l'inscription, on passe à l'étape profil
        setCurrentStep('profile');
      }
      return;
    }
    
    // ÉTAPE 2 : Saisie prénom/nom
    if (currentStep === 'profile') {
      if (!firstName.trim() || firstName.trim().length < 2) {
        toast({ 
          title: 'Prénom invalide', 
          description: 'Le prénom doit contenir au moins 2 caractères', 
          variant: 'destructive' 
        });
        return;
      }
      if (!lastName.trim() || lastName.trim().length < 2) {
        toast({ 
          title: 'Nom invalide', 
          description: 'Le nom doit contenir au moins 2 caractères', 
          variant: 'destructive' 
        });
        return;
      }
      setCurrentStep('school');
      return;
    }
    
    // ÉTAPE 3 : Envoi final avec toutes les données
    if (currentStep === 'school') {
      setLoading(true);
      try {
        await registerVerify(
          phoneNumber, 
          code, 
          firstName.trim(), 
          lastName.trim(), 
          schoolLevel || undefined
        );
        toast({ 
          title: '🎉 Inscription réussie !', 
          description: 'Bienvenue sur ETOOBLO AI.', 
        });
      } catch (err) {
        const apiError = err as ApiError;
        const msg = apiError.message || 'Erreur lors de l\'inscription';
        setError(msg);
        toast({ title: 'Erreur', description: msg, variant: 'destructive' });
        setCurrentStep('otp');
        setOtp(Array(OTP_LENGTH).fill(''));
        inputRefs.current[0]?.focus();
      } finally {
        setLoading(false);
      }
    }
  };

  const maskedPhone = phoneNumber.length > 4
    ? phoneNumber.slice(0, 6) + ' •• •• ' + phoneNumber.slice(-2)
    : phoneNumber;

  const backPath = flow === 'register' ? '/register' : '/login';

  return (
    <AuthLayout>
      <div className="mb-6 flex flex-col items-center gap-3 animate-fade-in">
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl btn-primary-gradient shadow-glow">
          <ShieldCheck className="h-8 w-8 text-white" />
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-sage-blue-50 px-3 py-1">
          <Shield className="h-3 w-3 text-primary" />
          <span className="text-xs font-medium text-primary">
            {currentStep === 'otp' && 'Vérification en cours'}
            {currentStep === 'profile' && 'Complétez votre profil'}
            {currentStep === 'school' && 'Dernière étape'}
          </span>
        </div>
        <h1 className="text-2xl font-display font-bold text-foreground">
          {currentStep === 'otp' && 'Vérifiez votre identité'}
          {currentStep === 'profile' && 'Qui êtes-vous ?'}
          {currentStep === 'school' && 'Votre niveau scolaire'}
        </h1>
        <p className="text-muted-foreground text-sm text-center max-w-xs">
          {currentStep === 'otp' && `Code envoyé au ${maskedPhone}`}
          {currentStep === 'profile' && 'Entrez votre prénom et nom'}
          {currentStep === 'school' && 'Choisissez votre niveau (optionnel)'}
        </p>
      </div>

      <div className="card-elevated rounded-2xl p-6 animate-slide-up">
        {currentStep === 'otp' && (
          <div className="mb-5 flex items-start gap-3 rounded-xl bg-sage-emerald-50 p-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/10">
              <CheckCircle2 className="h-4 w-4 text-accent" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Code envoyé avec succès</p>
              <p className="text-xs text-muted-foreground">
                Entrez le code à 6 chiffres reçu par SMS
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-destructive/10 px-4 py-3">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-destructive/20">
                <span className="text-xs text-destructive">!</span>
              </div>
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* ÉTAPE 1 : Code OTP */}
          {currentStep === 'otp' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Code de vérification</label>
              <div className="flex justify-center gap-2.5" onPaste={handlePaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleChange(i, e.target.value)}
                    onKeyDown={e => handleKeyDown(i, e)}
                    className="otp-input"
                    autoFocus={i === 0}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Entrez le code à 6 chiffres reçu par SMS
              </p>
            </div>
          )}

          {/* ÉTAPE 2 : Prénom et Nom */}
          {currentStep === 'profile' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Prénom</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  placeholder="Ex: Moussa"
                  className="w-full h-12 px-4 rounded-xl glass-card border-0 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Nom</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  placeholder="Ex: Diallo"
                  className="w-full h-12 px-4 rounded-xl glass-card border-0 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          )}

          {/* ÉTAPE 3 : Niveau scolaire */}
          {currentStep === 'school' && (
            <div className="space-y-3">
              <label className="text-sm font-medium">Niveau scolaire (optionnel)</label>
              <div className="space-y-2">
                {['Seconde', 'Premiere', 'Terminale'].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setSchoolLevel(level)}
                    className={`w-full p-3 rounded-xl text-left transition-all ${
                      schoolLevel === level
                        ? 'bg-primary/10 border-2 border-primary text-primary font-semibold'
                        : 'glass-card border border-border hover:border-primary/50'
                    }`}
                  >
                    {level}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setSchoolLevel('')}
                  className={`w-full p-3 rounded-xl text-left transition-all ${
                    schoolLevel === ''
                      ? 'bg-primary/10 border-2 border-primary text-primary font-semibold'
                      : 'glass-card border border-border hover:border-primary/50'
                  }`}
                >
                  Passer cette étape
                </button>
              </div>
            </div>
          )}

          <Button
            type="submit"
            className="group w-full h-12 text-base rounded-xl btn-primary-gradient border-0 relative overflow-hidden"
            disabled={loading || (currentStep === 'otp' && otp.join('').length !== OTP_LENGTH)}
          >
            <span className={`inline-flex items-center gap-2 transition-all duration-300 ${loading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
              <ShieldCheck className="h-4 w-4" /> 
              {currentStep === 'otp' && (flow === 'register' ? 'Continuer' : 'Vérifier et se connecter')}
              {currentStep === 'profile' && 'Continuer'}
              {currentStep === 'school' && 'Terminer l\'inscription'}
            </span>
            {loading && (
              <span className="absolute inset-0 flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-white" />
                <span className="text-white text-sm">Vérification...</span>
              </span>
            )}
          </Button>
        </form>

        <div className="mt-5 flex flex-col items-center gap-3 text-sm">
          {currentStep === 'otp' ? (
            <>
              <button 
                type="button" 
                onClick={handleResend} 
                disabled={countdown > 0}
                className={`font-semibold transition-colors ${countdown > 0 ? 'text-muted-foreground cursor-not-allowed' : 'text-primary hover:underline'}`}
              >
                {countdown > 0 ? `Renvoyer le code (${countdown}s)` : 'Renvoyer le code'}
              </button>
              <button 
                type="button" 
                onClick={() => navigate(backPath)}
                className="group flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" /> 
                Changer de numéro
              </button>
            </>
          ) : (
            <button 
              type="button" 
              onClick={() => {
                if (currentStep === 'profile') setCurrentStep('otp');
                if (currentStep === 'school') setCurrentStep('profile');
              }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> 
              Retour
            </button>
          )}
        </div>
      </div>
    </AuthLayout>
  );
}