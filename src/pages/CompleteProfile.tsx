import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Loader2, Phone, UserPlus, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { COUNTRY_CODES } from '@/types';
import type { ApiError } from '@/types';

const LEVELS = [
  { value: 'seconde' as const, label: 'Seconde' },
  { value: 'premiere' as const, label: 'Première' },
  { value: 'terminale' as const, label: 'Terminale' },
];

export default function CompleteProfile() {
  const { completeProfile, isAuthenticated } = useAuth();
  const location = useLocation();
  const { toast } = useToast();

  const phone = (location.state as any)?.phone as string | undefined;
  const countryCode = (location.state as any)?.countryCode as string | undefined;
  const tempToken = (location.state as any)?.tempToken as string | undefined;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [level, setLevel] = useState<string>('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!phone || !countryCode || !tempToken) return <Navigate to="/login" replace />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const selected = COUNTRY_CODES.find(c => c.dial === countryCode);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();

    if (!trimmedFirst || trimmedFirst.length < 2) {
      toast({ title: 'Prénom requis', description: 'Le prénom doit contenir au moins 2 caractères.', variant: 'destructive' });
      return;
    }
    if (!trimmedLast || trimmedLast.length < 2) {
      toast({ title: 'Nom requis', description: 'Le nom doit contenir au moins 2 caractères.', variant: 'destructive' });
      return;
    }
    if (!level) {
      toast({ title: 'Niveau requis', description: 'Veuillez sélectionner votre niveau scolaire.', variant: 'destructive' });
      return;
    }

    setError('');
    setLoading(true);
    try {
      await completeProfile({
        temp_token: tempToken,
        first_name: trimmedFirst,
        last_name: trimmedLast,
        school_level: level as 'seconde' | 'premiere' | 'terminale',
      });
      toast({ title: '🎉 Bienvenue !', description: `Votre profil a été créé avec succès, ${trimmedFirst}.`, variant: 'success' });
    } catch (err) {
      const msg = (err as ApiError).message || 'Erreur lors de la création du profil';
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
          <UserPlus className="h-8 w-8 text-white" />
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-sage-emerald-50 px-3 py-1">
          <Shield className="h-3 w-3 text-accent" />
          <span className="text-xs font-medium text-sage-emerald-600">Numéro vérifié ✓</span>
        </div>
        <h1 className="text-2xl font-display font-bold text-foreground">Compléter votre profil</h1>
        <p className="text-muted-foreground text-sm">Quelques informations pour commencer</p>
      </div>

      <div className="card-elevated rounded-2xl p-6 animate-slide-up">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-destructive/10 px-4 py-3">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-destructive/20">
                <span className="text-xs text-destructive">!</span>
              </div>
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Téléphone</label>
            <div className="flex h-12 items-center gap-2 rounded-xl border bg-sage-blue-50 px-4 text-sm text-foreground">
              {selected && <span className="text-lg">{selected.flag}</span>}
              <Phone className="h-4 w-4 text-primary" />
              <span className="font-medium">{countryCode} {phone}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Prénom</label>
            <Input className="h-12 rounded-xl" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Ex: Mamadou" maxLength={50} autoFocus />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Nom</label>
            <Input className="h-12 rounded-xl" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Ex: Diallo" maxLength={50} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Niveau scolaire</label>
            <Select onValueChange={setLevel} value={level}>
              <SelectTrigger className="h-12 rounded-xl">
                <SelectValue placeholder="Choisir votre niveau" />
              </SelectTrigger>
              <SelectContent>
                {LEVELS.map(l => (
                  <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full h-12 text-base rounded-xl btn-primary-gradient border-0 relative overflow-hidden" disabled={loading}>
            <span className={`inline-flex items-center gap-2 transition-all duration-300 ${loading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
              Commencer 🚀
            </span>
            {loading && (
              <span className="absolute inset-0 flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-white" />
                <span className="text-white text-sm">Création du profil...</span>
              </span>
            )}
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
}
