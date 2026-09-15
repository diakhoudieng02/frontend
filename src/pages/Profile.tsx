import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { COUNTRY_CODES } from '@/types';
import type { ApiError } from '@/types/api';
import { 
  User as UserIcon, 
  Phone, 
  GraduationCap, 
  ArrowLeft, 
  Loader2, 
  Save, 
  Shield, 
  LogOut,
  AlertTriangle,
  Lock,
  Mail,
  Chrome,
  Camera
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { format, isValid } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { api } from '@/lib/api';

// Types pour les niveaux scolaires
const LEVELS = [
  { value: 'Seconde' as const, label: 'Seconde' },
  { value: 'Premiere' as const, label: 'Première' },
  { value: 'Terminale' as const, label: 'Terminale' },
] as const;

type LevelValue = typeof LEVELS[number]['value'];

// Interface pour le profil utilisateur (ce qui est dans data)
interface UserData {
  id: string;
  phoneNumber: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  schoolLevel: LevelValue | null;
  passBalance: number;
  role: string;
  countryCode?: string;
  createdAt?: string;
  authProvider?: 'google' | 'phone';
  photoUrl?: string;
  settings?: any;
  remainingPasses?: number;
}

// Interface pour la réponse API complète
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export default function Profile() {
  const { user, logout, updateProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('+221');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [savingPhone, setSavingPhone] = useState(false);

  // États pour l'édition du profil
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    schoolLevel: '',
    email: '',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Détecter si l'utilisateur vient de Google
  const isGoogleUser = profile?.phoneNumber?.startsWith('+google_') || false;

  // Formater le numéro de téléphone pour l'affichage
  const formatPhoneForDisplay = (phone: string) => {
    if (phone?.startsWith('+google_')) {
      return 'Compte Google';
    }
    return phone;
  };

  // Récupérer le profil au chargement
  useEffect(() => {
    console.log('🔄 Profile component mounted');
    console.log('📍 API Base URL:', import.meta.env.VITE_API_URL);
    console.log('👤 User from auth:', user);
    
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      console.log('📡 Fetching profile from /user-settings/profile...');
      
      // Vérifier le token avant la requête
      const token = localStorage.getItem('authToken');
      const session = localStorage.getItem('edupass_session');
      console.log('🔑 Token present:', !!token);
      console.log('📦 Session present:', !!session);
      
      // CORRECTION: Utiliser ApiResponse<UserData> comme type
      const response = await api.get<ApiResponse<UserData>>('/user-settings/profile');
      
      console.log('✅ Profile fetched successfully:', response);
      console.log('📊 Profile data:', JSON.stringify(response, null, 2));
      
      // CORRECTION: Extraire response.data
      const userData = response.data;
      
      setProfile(userData);
      
      // Mettre à jour les états du formulaire
      setEditForm({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        schoolLevel: userData.schoolLevel || '',
        email: userData.email || '',
      });
      setSelectedCountry(userData.countryCode || '+221');
      setPhoneNumber(userData.phoneNumber || '');
      
    } catch (err) {
      console.error('❌ Erreur détaillée lors du chargement du profil:', err);
      
      toast({
        title: "Erreur de chargement",
        description: (err as ApiError)?.message || "Impossible de charger le profil. Vérifiez votre connexion.",
        variant: "destructive"
      });
      
      if ((err as any)?.status === 401) {
        console.log('🔒 Non authentifié, redirection vers login...');
        setTimeout(() => navigate('/login'), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour le profil
  const handleUpdateProfile = async () => {
    setSavingProfile(true);
    try {
      console.log('📝 Mise à jour du profil avec:', editForm);
      
      const response = await api.put<ApiResponse<UserData>>('/user-settings/profile', editForm);
      
      console.log('✅ Profil mis à jour avec succès:', response);
      
      // CORRECTION: Extraire response.data
      setProfile(response.data);
      setIsEditingProfile(false);
      
      toast({
        title: "✅ Profil mis à jour",
        description: "Vos informations ont été enregistrées avec succès",
      });
    } catch (err) {
      console.error('❌ Erreur mise à jour profil:', err);
      toast({
        title: "Erreur",
        description: (err as ApiError).message || "Impossible de mettre à jour le profil",
        variant: "destructive"
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSavePhone = async () => {
    if (!phoneNumber || phoneNumber.length < 8) {
      toast({
        title: "Numéro invalide",
        description: "Veuillez entrer un numéro de téléphone valide",
        variant: "destructive"
      });
      return;
    }

    setSavingPhone(true);
    try {
      console.log('📝 Mise à jour du téléphone:', `${selectedCountry}${phoneNumber}`);
      
      const response = await api.put<ApiResponse<UserData>>('/user-settings/profile', {
        phoneNumber: `${selectedCountry}${phoneNumber}`,
        countryCode: selectedCountry
      });
      
      console.log('✅ Téléphone mis à jour avec succès:', response);
      
      // CORRECTION: Extraire response.data
      setProfile(response.data);
      setIsEditingPhone(false);
      
      toast({
        title: "✅ Numéro ajouté",
        description: "Votre numéro de téléphone a été enregistré avec succès",
      });
    } catch (err) {
      console.error('❌ Erreur mise à jour téléphone:', err);
      toast({
        title: "Erreur",
        description: (err as ApiError).message || "Impossible d'ajouter le numéro",
        variant: "destructive"
      });
    } finally {
      setSavingPhone(false);
    }
  };

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      await logout();
      toast({ 
        title: 'Déconnexion réussie', 
        description: 'Vous avez été déconnecté avec succès.', 
      });
      navigate('/login');
    } catch (err) {
      toast({ 
        title: 'Erreur de déconnexion', 
        description: 'Impossible de se déconnecter. Veuillez réessayer.', 
        variant: 'destructive' 
      });
    } finally {
      setLogoutLoading(false);
    }
  };

  // Formater la date
  const memberSinceFormatted = useMemo(() => {
    const dateStr = profile?.createdAt;
    if (!dateStr) return null;
    
    try {
      const date = new Date(dateStr);
      if (!isValid(date)) return null;
      return format(date, 'd MMMM yyyy', { locale: fr });
    } catch (error) {
      console.error('Invalid date:', dateStr);
      return null;
    }
  }, [profile?.createdAt]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement de votre profil...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-destructive/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-10 w-10 text-destructive" />
          </div>
          <h2 className="text-xl font-bold mb-2">Profil non trouvé</h2>
          <p className="text-muted-foreground mb-6">
            Impossible de charger votre profil. Veuillez vérifier votre connexion ou réessayer plus tard.
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={fetchProfile} variant="outline">
              Réessayer
            </Button>
            <Button onClick={() => navigate('/dashboard')}>
              Retour au dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Debug: Afficher les données en cours
  console.log('🎨 Rendu du profil avec:', profile);

  const country = COUNTRY_CODES.find(c => c.dial === profile.countryCode);

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-6">
      {/* Background blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 right-10 h-[400px] w-[400px] rounded-full bg-primary/5 blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 -left-40 h-[350px] w-[350px] rounded-full bg-accent/5 blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

    

      <main className="relative mx-auto max-w-3xl px-4 py-6 space-y-6">
        {/* Back link */}
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group">
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Retour au dashboard
        </Link>

        {/* Profile header avec photo */}
        <div className="glass-card p-6 animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-purple-500 shadow-glow text-2xl font-display font-bold text-white overflow-hidden">
                {profile.photoUrl ? (
                  <img 
                    src={profile.photoUrl} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <>
                    {(profile.firstName?.[0] || '?').toUpperCase()}
                    {(profile.lastName?.[0] || '').toUpperCase()}
                  </>
                )}
              </div>
              {isEditingProfile && (
                <button className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1.5 shadow-lg hover:bg-primary/90 transition-colors">
                  <Camera className="h-3 w-3 text-white" />
                </button>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-display font-bold text-foreground">
                {profile.firstName} {profile.lastName}
              </h1>
              
              {/* Badge Google si applicable */}
              {isGoogleUser && (
                <div className="flex items-center gap-1 mt-1">
                  <Chrome className="h-3.5 w-3.5 text-blue-500" />
                  <span className="text-xs text-blue-500 font-medium">Compte Google</span>
                </div>
              )}
              
              <div className="flex items-center gap-2 mt-1">
                {country && <span className="text-lg">{country.flag}</span>}
                <span className="text-sm text-muted-foreground">
                  {profile.countryCode} {formatPhoneForDisplay(profile.phoneNumber)}
                </span>
              </div>
              
              {memberSinceFormatted && (
                <p className="text-xs text-muted-foreground mt-1">
                  Membre depuis {memberSinceFormatted}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Informations */}
        <div className="glass-card p-6 animate-slide-up space-y-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <UserIcon className="h-5 w-5 text-primary" />
            </div>
            <h2 className="font-display font-bold text-foreground">Mes informations</h2>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              className="ml-auto"
            >
              {isEditingProfile ? 'Annuler' : 'Modifier'}
            </Button>
          </div>

          {/* Section Téléphone */}
          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              <Phone className="h-3.5 w-3.5" /> Téléphone
              {isGoogleUser && !isEditingPhone && !profile.phoneNumber && (
                <span className="ml-2 text-xs text-amber-500">Requis pour la validation</span>
              )}
            </label>

            {isEditingPhone ? (
              // Mode édition
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                    <SelectTrigger className="w-[140px] h-12 rounded-xl">
                      <SelectValue placeholder="Code" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRY_CODES.map((country) => (
                        <SelectItem key={country.code} value={country.dial}>
                          <span className="flex items-center gap-2">
                            <span>{country.flag}</span>
                            <span>{country.dial}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="77 123 45 67"
                    className="flex-1 h-12 rounded-xl"
                    maxLength={15}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditingPhone(false)}
                    className="flex-1 h-11 rounded-xl"
                    disabled={savingPhone}
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={handleSavePhone}
                    className="flex-1 h-11 rounded-xl bg-gradient-to-r from-primary to-primary/80"
                    disabled={savingPhone || !phoneNumber}
                  >
                    {savingPhone ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Enregistrement...
                      </>
                    ) : (
                      'Enregistrer'
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              // Mode lecture seule
              <div>
                {profile.phoneNumber && !profile.phoneNumber.startsWith('+google_') ? (
                  <div className="flex h-12 items-center gap-2 rounded-xl bg-muted/30 px-4 text-sm text-muted-foreground">
                    {country && <span className="text-lg">{country.flag}</span>}
                    <span className="font-medium">
                      {profile.countryCode} {profile.phoneNumber}
                    </span>
                    <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary flex items-center gap-1">
                      <Shield className="h-2.5 w-2.5" /> Vérifié
                    </span>
                  </div>
                ) : (
                  <div className="flex h-12 items-center gap-2 rounded-xl bg-blue-500/10 px-4 text-sm text-blue-600">
                    <Chrome className="h-4 w-4 shrink-0" />
                    <span className="flex-1">Connecté avec Google</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {isEditingProfile ? (
            // Mode édition du profil
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Prénom</label>
                <Input
                  value={editForm.firstName}
                  onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                  className="h-12 rounded-xl"
                  placeholder="Votre prénom"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Nom</label>
                <Input
                  value={editForm.lastName}
                  onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                  className="h-12 rounded-xl"
                  placeholder="Votre nom"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Niveau scolaire</label>
                <Select 
                  value={editForm.schoolLevel} 
                  onValueChange={(value) => setEditForm({ ...editForm, schoolLevel: value })}
                >
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue placeholder="Sélectionnez votre niveau" />
                  </SelectTrigger>
                  <SelectContent>
                    {LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {profile.email && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="h-12 rounded-xl"
                    placeholder="votre@email.com"
                    type="email"
                  />
                </div>
              )}

              <Button
                onClick={handleUpdateProfile}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-primary/80"
                disabled={savingProfile}
              >
                {savingProfile ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Enregistrer les modifications
                  </>
                )}
              </Button>
            </>
          ) : (
            // Mode lecture seule
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Prénom</label>
                <div className="flex h-12 items-center rounded-xl bg-muted/30 px-4 text-sm text-foreground">
                  {profile.firstName || 'Non renseigné'}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Nom</label>
                <div className="flex h-12 items-center rounded-xl bg-muted/30 px-4 text-sm text-foreground">
                  {profile.lastName || 'Non renseigné'}
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-sm font-medium">
                  <GraduationCap className="h-3.5 w-3.5" /> Niveau scolaire
                </label>
                <div className="flex h-12 items-center rounded-xl bg-muted/30 px-4 text-sm text-foreground">
                  {profile.schoolLevel 
                    ? LEVELS.find(l => l.value === profile.schoolLevel)?.label || profile.schoolLevel
                    : 'Non renseigné'}
                </div>
              </div>

              {profile.email && (
                <div className="space-y-2">
                  <label className="flex items-center gap-1.5 text-sm font-medium">
                    <Mail className="h-3.5 w-3.5" /> Email
                  </label>
                  <div className="flex h-12 items-center gap-2 rounded-xl bg-muted/30 px-4 text-sm text-foreground">
                    {profile.email}
                    {isGoogleUser && (
                      <span className="ml-auto rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-500">
                        Google
                      </span>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Logout section */}
        <div className="glass-card p-6 animate-slide-up border border-destructive/20 hover:border-destructive/30 transition-colors">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <h2 className="font-display font-bold text-foreground">Zone de sécurité</h2>
              <p className="text-sm text-muted-foreground mt-0.5">Gérez votre connexion et votre compte</p>
            </div>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                className="w-full h-11 rounded-xl bg-destructive/90 hover:bg-destructive text-destructive-foreground transition-all duration-200 shadow-sm hover:shadow-md"
              >
                {logoutLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <LogOut className="h-4 w-4 mr-2" />
                )}
                Se déconnecter
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-sm rounded-2xl glass-strong bg-popover border-destructive/20">
              <AlertDialogHeader>
                <AlertDialogTitle className="font-display text-destructive flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Confirmer la déconnexion
                </AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground">
                  Êtes-vous sûr de vouloir vous déconnecter ? Vous devrez vous reconnecter pour accéder à votre compte.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-xl">Annuler</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleLogout} 
                  className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {logoutLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Déconnexion...
                    </>
                  ) : (
                    'Se déconnecter'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <p className="text-xs text-muted-foreground mt-3">
            La déconnexion fermera votre session sur tous les appareils.
          </p>
        </div>
      </main>
    </div>
  );
}