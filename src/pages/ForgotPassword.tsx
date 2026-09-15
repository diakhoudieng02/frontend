import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { PhoneInput } from '@/components/auth/PhoneInput';
import { Loader2, ArrowLeft, CheckCircle2, BookOpen } from 'lucide-react';
import type { ApiError } from '@/types';

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+225');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 6) {
      setError('Numéro de téléphone invalide');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await resetPassword(`${countryCode}${phone}`);
      setSent(true);
    } catch (err) {
      setError((err as ApiError).message || 'Erreur lors de l\'envoi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="mb-8 flex flex-col items-center gap-3 animate-fade-in">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl btn-primary-gradient">
          <BookOpen className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-2xl font-display font-bold text-foreground">Récupération</h1>
        <p className="text-muted-foreground text-sm text-center">
          {sent ? 'Lien envoyé !' : 'Entrez votre numéro pour recevoir un lien'}
        </p>
      </div>

      <div className="card-elevated w-full max-w-sm rounded-2xl p-6 animate-slide-up">
        {sent ? (
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sage-emerald-50">
              <CheckCircle2 className="h-8 w-8 text-sage-emerald-600" />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Vérifiez vos messages pour réinitialiser votre mot de passe.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Numéro de téléphone</label>
              <PhoneInput
                value={phone}
                onChange={setPhone}
                countryCode={countryCode}
                onCountryChange={setCountryCode}
              />
            </div>
            <Button type="submit" className="w-full h-12 text-base rounded-xl btn-primary-gradient border-0" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Envoyer le lien
            </Button>
          </form>
        )}

        <div className="mt-5 text-center">
          <Link to="/login" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  );
}
