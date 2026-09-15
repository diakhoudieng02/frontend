// components/modals/WelcomeModal.tsx
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, FileText, ArrowRight, Gift } from 'lucide-react';

interface WelcomeModalProps {
  open: boolean;
  onClose: () => void;
  passBalance?: number;
}

const PERKS = [
  {
    icon: Zap,
    label: '1 Pass = 1 000 000 tokens',
    sub: 'Largement suffisant pour un gros fichier',
  },
  {
    icon: FileText,
    label: 'Jusqu\'à 15 MB par analyse',
    sub: 'PDF, scans, photos de cours acceptés',
  },
];

export function WelcomeModal({ open, onClose, passBalance = 5 }: WelcomeModalProps) {
  const navigate = useNavigate();

  const handleCTA = () => {
    onClose();
    setTimeout(() => navigate('/courses'), 200);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent
        className="w-[95vw] max-w-sm sm:max-w-md p-0 overflow-hidden border-0 rounded-3xl shadow-2xl bg-transparent"
        // Supprimer le bouton de fermeture natif
        onInteractOutside={(e) => e.preventDefault()}
      >
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', damping: 20, stiffness: 280 }}
              className="relative flex flex-col items-center rounded-3xl overflow-hidden bg-card border border-border/40"
            >
              {/* ── Fond décoratif ── */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />
                <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-pink-500/10 blur-2xl" />
                {/* Étoiles décoratives */}
                {[
                  { top: '12%', left: '8%', size: 6, delay: 0 },
                  { top: '20%', right: '10%', size: 4, delay: 0.3 },
                  { top: '55%', left: '5%', size: 5, delay: 0.6 },
                  { top: '70%', right: '8%', size: 4, delay: 0.15 },
                  { top: '40%', right: '4%', size: 3, delay: 0.45 },
                ].map((star, i) => (
                  <motion.div
                    key={i}
                    className="absolute rounded-full bg-yellow-400/70"
                    style={{
                      top: star.top,
                      left: (star as any).left,
                      right: (star as any).right,
                      width: star.size,
                      height: star.size,
                    }}
                    animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.2, 0.8] }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      delay: star.delay,
                      ease: 'easeInOut',
                    }}
                  />
                ))}
              </div>

              {/* ── Contenu ── */}
              <div className="relative z-10 flex flex-col items-center gap-5 px-6 pt-8 pb-7 text-center w-full">

                {/* Icône cadeau animée */}
                <motion.div
                  initial={{ scale: 0, rotate: -15 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.1 }}
                  className="relative"
                >
                  <div className="flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/30">
                    <Gift className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
                  </div>
                  {/* Badge pass */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, type: 'spring', stiffness: 300 }}
                    className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-yellow-400 text-yellow-900 text-xs font-black shadow-md border-2 border-background"
                  >
                    ×{passBalance}
                  </motion.div>
                </motion.div>

                {/* Titre */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-1.5"
                >
                  <p className="text-xs font-semibold uppercase tracking-widest text-purple-500">
                    Pack Découverte activé 🎉
                  </p>
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground leading-tight">
                    Vous avez reçu{' '}
                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                      {passBalance} Pass gratuits
                    </span>{' '}
                    🚀
                  </h2>
                </motion.div>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-sm text-muted-foreground max-w-xs leading-relaxed"
                >
                  Pour vous souhaiter la bienvenue, nous avons crédité votre compte d'un{' '}
                  <span className="font-semibold text-foreground">Pack Initial</span>.
                </motion.p>

                {/* Avantages */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="w-full space-y-2.5"
                >
                  {PERKS.map((perk, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 rounded-2xl bg-muted/50 border border-border/50 px-4 py-3 text-left"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                        <perk.icon className="h-4 w-4 text-purple-500" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{perk.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{perk.sub}</p>
                      </div>
                    </div>
                  ))}
                </motion.div>

                {/* Note tarifaire */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.45 }}
                  className="w-full rounded-2xl bg-gradient-to-r from-purple-500/5 to-pink-500/5 border border-purple-500/10 px-4 py-3"
                >
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    💡 Besoin de plus de puissance ?{' '}
                    <span className="font-semibold text-foreground">
                      Nos packs commencent à 350 FCFA
                    </span>{' '}
                    seulement.
                  </p>
                </motion.div>

                {/* CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="w-full pt-1"
                >
                  <Button
                    onClick={handleCTA}
                    className="w-full h-12 rounded-2xl gap-2 text-base font-semibold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Sparkles className="h-4 w-4" />
                    C'est parti !
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </motion.div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}