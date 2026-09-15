// src/pages/Maintenance.tsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Construction, 
  Clock, 
  Mail, 
  Twitter, 
  Facebook, 
  Instagram,
  ArrowLeft,
  RefreshCw,
  Wrench,
  Hammer,
  Paintbrush,
  Settings,
  Cog,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function Maintenance() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    hours: 2,
    minutes: 30,
    seconds: 0
  });
  const { toast } = useToast();

  // Compte à rebours simulé
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast({
        title: 'Email invalide',
        description: 'Veuillez entrer une adresse email valide',
        variant: 'destructive',
      });
      return;
    }

    setSubscribed(true);
    toast({
      title: '✅ Merci !',
      description: 'Vous serez notifié dès la fin de la maintenance',
    });
    setEmail('');
  };

  const handleRefresh = () => {
    toast({
      title: '🔄 Vérification...',
      description: 'Vérification de l\'état du serveur',
    });
    setTimeout(() => {
      toast({
        title: '❌ Toujours en maintenance',
        description: 'Le site n\'est pas encore disponible',
        variant: 'destructive',
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 overflow-hidden relative">
      {/* Éléments décoratifs animés */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-accent/5 blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        
        {/* Outils animés */}
        <motion.div
          className="absolute top-20 left-20 text-primary/10"
          animate={{ y: [0, 20, 0], rotate: [0, 10, -10, 0] }}
          transition={{ duration: 5, repeat: Infinity }}
        >
          <Wrench size={60} />
        </motion.div>
        
        <motion.div
          className="absolute bottom-20 right-20 text-accent/10"
          animate={{ y: [0, -20, 0], rotate: [0, -10, 10, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
        >
          <Hammer size={60} />
        </motion.div>
        
        <motion.div
          className="absolute top-40 right-40 text-primary/10"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <Paintbrush size={50} />
        </motion.div>

        {/* Icônes supplémentaires */}
        <motion.div
          className="absolute top-1/3 left-1/4 text-primary/10"
          animate={{ scale: [1, 1.2, 1], rotate: [0, 45, 0] }}
          transition={{ duration: 7, repeat: Infinity }}
        >
          <Settings size={45} />
        </motion.div>

        <motion.div
          className="absolute bottom-1/3 right-1/4 text-accent/10"
          animate={{ scale: [1, 1.3, 1], rotate: [0, -45, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        >
          <Cog size={45} />
        </motion.div>
      </div>

      {/* Contenu principal */}
      <div className="relative z-10 container mx-auto px-4 py-12 min-h-screen flex flex-col items-center justify-center">
        {/* Badge maintenance */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full border border-primary/20">
            <Construction className="h-4 w-4" />
            <span className="text-sm font-medium">Maintenance en cours</span>
          </div>
        </motion.div>

        {/* Titre principal avec icône de maintenance */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl font-display font-bold text-center mb-4 flex items-center justify-center gap-4 flex-wrap"
        >
          <Settings className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 text-primary animate-spin-slow" />
          <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Maintenance en cours
          </span>
          <Cog className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 text-accent animate-spin-slow" />
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg sm:text-xl text-muted-foreground text-center max-w-2xl mb-12"
        >
          Nous travaillons actuellement sur une nouvelle version de <span className="font-semibold text-primary">ETOOBLO IA </span> 
          pour vous offrir une meilleure expérience d'apprentissage.
        </motion.p>

        {/* Compte à rebours */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="glass-card p-8 rounded-2xl mb-12 w-full max-w-md"
        >
          <h2 className="text-center font-display font-semibold text-lg mb-6 flex items-center justify-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Retour estimé
            
          </h2>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-primary">
                {String(timeLeft.hours).padStart(2, '0')}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Heures</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-primary">
                {String(timeLeft.minutes).padStart(2, '0')}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Minutes</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-primary">
                {String(timeLeft.seconds).padStart(2, '0')}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Secondes</div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
            <AlertTriangle className="h-3 w-3 text-amber-500" />
            <span>Le site sera de retour dans environ {timeLeft.hours}h {timeLeft.minutes}m</span>
          </div>
        </motion.div>

        {/* Formulaire de notification */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="w-full max-w-md mb-12"
        >
          {!subscribed ? (
            <form onSubmit={handleSubscribe} className="space-y-4">
              <p className="text-sm text-muted-foreground text-center flex items-center justify-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                Soyez notifié dès que le site est de retour :
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 h-11 rounded-xl"
                />
                <Button type="submit" className="h-11 rounded-xl btn-primary-gradient whitespace-nowrap gap-2">
                  <Mail className="h-4 w-4" />
                  M'avertir
                </Button>
              </div>
            </form>
          ) : (
            <div className="text-center p-6 bg-primary/5 rounded-xl border border-primary/20">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Construction className="h-5 w-5 text-primary" />
                <p className="text-primary font-medium">✅ Vous serez notifié !</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Nous vous enverrons un email dès la fin de la maintenance.
              </p>
            </div>
          )}
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 mb-12"
        >
          <Button
            variant="outline"
            onClick={handleRefresh}
            className="gap-2 h-11 rounded-xl"
          >
            <RefreshCw className="h-4 w-4" />
            Vérifier à nouveau
          </Button>
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="gap-2 h-11 rounded-xl"
          >
            <ArrowLeft className="h-4 w-4" />
            Page précédente
          </Button>
        </motion.div>

        {/* Réseaux sociaux */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex items-center gap-4"
        >
          <a
            href="https://twitter.com/docusage"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-colors"
          >
            <Twitter className="h-5 w-5" />
          </a>
          <a
            href="https://facebook.com/docusage"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-colors"
          >
            <Facebook className="h-5 w-5" />
          </a>
          <a
            href="https://instagram.com/docusage"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-colors"
          >
            <Instagram className="h-5 w-5" />
          </a>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="absolute bottom-6 left-0 right-0 text-center"
        >
          <p className="text-xs text-muted-foreground">
            © 2025 ETOOBLO IA. Tous droits réservés.
          </p>
        </motion.div>
      </div>
    </div>
  );
}