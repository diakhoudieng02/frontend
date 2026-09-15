// pages/Settings.tsx
import { useState, useEffect } from 'react';
import { Navbar } from "@/components/layout/Navbar";
import { useSettings } from '@/hooks/useSettings';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import {
  Settings as SettingsIcon,
  Bell,
  Palette,
  Globe,
  Moon,
  Sun,
  BellRing,
  MessageSquare,
  Mail,
  Trophy,
  RotateCcw,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const LANGUAGES = [
  { value: 'fr', label: 'Français', flag: '🇫🇷' },
  { value: 'en', label: 'English', flag: '🇬🇧' },
];

export default function Settings() {
  const { settings, loading, updating, updateSettings, resetSettings } = useSettings();
  const { toast } = useToast();
  const [localTheme, setLocalTheme] = useState<'light' | 'dark'>(
    () => (document.documentElement.classList.contains('dark') ? 'dark' : 'light')
  );

  // Observer les changements de thème
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const isDark = document.documentElement.classList.contains('dark');
          setLocalTheme(isDark ? 'dark' : 'light');
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  const handleThemeToggle = async () => {
    const newTheme = localTheme === 'dark' ? 'light' : 'dark';
    setLocalTheme(newTheme);
    await updateSettings({ darkMode: newTheme === 'dark' });
  };

  const handleNotificationToggle = async (
    key: 'revisionReminders' | 'quizResults' | 'chatMessages' | 'appUpdates',
    currentValue: boolean
  ) => {
    const payload: any = {};
    
    // Map des clés
    switch (key) {
      case 'revisionReminders':
        payload.notificationsRevision = !currentValue;
        break;
      case 'quizResults':
        payload.notificationsQuiz = !currentValue;
        break;
      case 'chatMessages':
        payload.notificationsChat = !currentValue;
        break;
      case 'appUpdates':
        payload.notificationsUpdates = !currentValue;
        break;
    }
    
    await updateSettings(payload);
  };

  const handleLanguageChange = async (value: string) => {
    await updateSettings({ language: value });
  };

  const handleReset = async () => {
    await resetSettings();
  };

  // État de chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-24 md:pb-6">
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -top-40 right-20 h-[400px] w-[400px] rounded-full bg-primary/5 blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-40 -left-40 h-[350px] w-[350px] rounded-full bg-accent/5 blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
        </div>

      
        <main className="relative mx-auto max-w-3xl px-4 py-6 space-y-6">
          <div className="animate-fade-in">
            <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
              <SettingsIcon className="h-5 w-5 text-primary" />
              Paramètres
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Chargement de vos préférences...</p>
          </div>

          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-6">
      {/* Background blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 right-20 h-[400px] w-[400px] rounded-full bg-primary/5 blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-40 -left-40 h-[350px] w-[350px] rounded-full bg-accent/5 blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      
      
      <main className="relative mx-auto max-w-3xl px-4 py-6 space-y-6">
        {/* Header avec bouton reset */}
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
              <SettingsIcon className="h-5 w-5 text-primary" />
              Paramètres
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Personnalise ton expérience</p>
          </div>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Réinitialiser
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Réinitialiser les paramètres ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action remettra tous vos paramètres aux valeurs par défaut.
                  Elle est irréversible.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handleReset} className="bg-destructive hover:bg-destructive/90">
                  Réinitialiser
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Indicateur de mise à jour */}
        {updating && (
          <div className="flex items-center justify-center gap-2 text-sm text-primary bg-primary/5 p-2 rounded-lg animate-pulse">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Mise à jour en cours...</span>
          </div>
        )}

        {/* Theme section */}
        <section className="glass-card p-5 space-y-4 animate-fade-in">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Palette className="h-5 w-5 text-primary" />
            </div>
            <h2 className="font-display text-base font-bold text-foreground">Apparence</h2>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-muted/30 p-4 hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              {localTheme === 'dark' ? (
                <Moon className="h-5 w-5 text-primary" />
              ) : (
                <Sun className="h-5 w-5 text-primary" />
              )}
              <div>
                <Label className="font-semibold text-foreground">Mode sombre</Label>
                <p className="text-xs text-muted-foreground">
                  {localTheme === 'dark' ? 'Activé — interface sombre' : 'Désactivé — interface claire'}
                </p>
              </div>
            </div>
            <Switch 
              checked={localTheme === 'dark'} 
              onCheckedChange={handleThemeToggle}
              disabled={updating}
            />
          </div>
        </section>

        {/* Notifications section */}
        <section className="glass-card p-5 space-y-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
              <Bell className="h-5 w-5 text-accent" />
            </div>
            <h2 className="font-display text-base font-bold text-foreground">Notifications</h2>
          </div>

          <div className="space-y-2">
            {/* Rappels de révision */}
            <div className="flex items-center justify-between rounded-xl bg-muted/30 p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <BellRing className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <Label className="font-semibold text-foreground text-sm">Rappels de révision</Label>
                  <p className="text-xs text-muted-foreground truncate">
                    Notifications quotidiennes pour tes tâches planifiées
                  </p>
                </div>
              </div>
              <Switch 
                checked={settings?.notifications?.revisionReminders ?? true} 
                onCheckedChange={() => handleNotificationToggle(
                  'revisionReminders',
                  settings?.notifications?.revisionReminders ?? true
                )}
                disabled={updating}
              />
            </div>

            {/* Résultats de quiz */}
            <div className="flex items-center justify-between rounded-xl bg-muted/30 p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <Trophy className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <Label className="font-semibold text-foreground text-sm">Résultats de quiz</Label>
                  <p className="text-xs text-muted-foreground truncate">
                    Résumé après chaque quiz complété
                  </p>
                </div>
              </div>
              <Switch 
                checked={settings?.notifications?.quizResults ?? true} 
                onCheckedChange={() => handleNotificationToggle(
                  'quizResults',
                  settings?.notifications?.quizResults ?? true
                )}
                disabled={updating}
              />
            </div>

            {/* Messages du chat */}
            <div className="flex items-center justify-between rounded-xl bg-muted/30 p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <MessageSquare className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <Label className="font-semibold text-foreground text-sm">Messages du chat</Label>
                  <p className="text-xs text-muted-foreground truncate">
                    Nouvelles réponses de l'assistant IA
                  </p>
                </div>
              </div>
              <Switch 
                checked={settings?.notifications?.chatMessages ?? true} 
                onCheckedChange={() => handleNotificationToggle(
                  'chatMessages',
                  settings?.notifications?.chatMessages ?? true
                )}
                disabled={updating}
              />
            </div>

            {/* Mises à jour */}
            <div className="flex items-center justify-between rounded-xl bg-muted/30 p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <Label className="font-semibold text-foreground text-sm">Mises à jour</Label>
                  <p className="text-xs text-muted-foreground truncate">
                    Nouveautés et améliorations de l'app
                  </p>
                </div>
              </div>
              <Switch 
                checked={settings?.notifications?.appUpdates ?? false} 
                onCheckedChange={() => handleNotificationToggle(
                  'appUpdates',
                  settings?.notifications?.appUpdates ?? false
                )}
                disabled={updating}
              />
            </div>
          </div>
        </section>

        {/* Language section */}
        <section className="glass-card p-5 space-y-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Globe className="h-5 w-5 text-primary" />
            </div>
            <h2 className="font-display text-base font-bold text-foreground">Langue</h2>
          </div>

          <div className="rounded-xl bg-muted/30 p-4">
            <Label className="font-semibold text-foreground text-sm block mb-2">
              Langue de l'interface
            </Label>
            <Select 
              value={settings?.language || 'fr'} 
              onValueChange={handleLanguageChange}
              disabled={updating}
            >
              <SelectTrigger className="w-full rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                {LANGUAGES.map(lang => (
                  <SelectItem key={lang.value} value={lang.value}>
                    <span className="flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <span>{lang.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-2">
              La traduction complète arrive bientôt. Seul le français est entièrement supporté.
            </p>
          </div>
        </section>

        {/* Dernière mise à jour */}
        {settings?.updatedAt && (
          <div className="text-center text-xs text-muted-foreground border-t border-border/50 pt-4">
            Dernière modification : {new Date(settings.updatedAt).toLocaleString('fr-FR')}
          </div>
        )}
      </main>
    </div>
  );
}