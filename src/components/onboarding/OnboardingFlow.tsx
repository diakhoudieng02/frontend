import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { 
  User, 
  GraduationCap, 
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check
} from 'lucide-react';

interface OnboardingData {
  firstName: string;
  lastName: string;
  schoolName: string;
  schoolLevel: 'Seconde' | 'Premiere' | 'Terminale' | '';
  avatarIndex: number;
}

interface OnboardingFlowProps {
  onComplete: (data: OnboardingData) => void;
}

const avatars = [
  '🧑‍🎓', '👩‍🎓', '🦊', '🐼', '🦁', '🐸', '🦄', '🐙', '🦋', '🌟',
];

const schoolLevels = [
  { value: 'Seconde', label: 'Seconde', emoji: '📗' },
  { value: 'Premiere', label: 'Première', emoji: '📘' },
  { value: 'Terminale', label: 'Terminale', emoji: '📕' },
];

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    firstName: '',
    lastName: '',
    schoolName: '',
    schoolLevel: '',
    avatarIndex: 0,
  });

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  const canProceed = () => {
    switch (step) {
      case 1:
        return data.firstName.trim() && data.lastName.trim();
      case 2:
        return data.schoolLevel !== '';
      case 3:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onComplete(data);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header with progress */}
      <div className="px-6 pt-8 pb-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground">
            Étape {step} sur {totalSteps}
          </span>
          {step > 1 && (
            <button
              onClick={handleBack}
              className="text-sm text-primary font-medium flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour
            </button>
          )}
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step content */}
      <div className="flex-1 px-6 py-8 overflow-hidden">
        <AnimatePresence mode="wait" custom={step}>
          {step === 1 && (
            <motion.div
              key="step1"
              custom={1}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground">
                  Qui es-tu ? 👋
                </h2>
                <p className="text-muted-foreground mt-2">
                  Aide-nous à personnaliser ton expérience
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input
                    id="firstName"
                    placeholder="Ton prénom"
                    value={data.firstName}
                    onChange={(e) => setData({ ...data, firstName: e.target.value })}
                    className="h-14 rounded-xl text-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom</Label>
                  <Input
                    id="lastName"
                    placeholder="Ton nom"
                    value={data.lastName}
                    onChange={(e) => setData({ ...data, lastName: e.target.value })}
                    className="h-14 rounded-xl text-lg"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              custom={1}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="w-8 h-8 text-accent" />
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground">
                  Ton niveau 📚
                </h2>
                <p className="text-muted-foreground mt-2">
                  Pour adapter les exercices à ton programme
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="schoolName">Nom de ton lycée (optionnel)</Label>
                  <Input
                    id="schoolName"
                    placeholder="Ex: Lycée Victor Hugo"
                    value={data.schoolName}
                    onChange={(e) => setData({ ...data, schoolName: e.target.value })}
                    className="h-14 rounded-xl"
                  />
                </div>

                <div className="space-y-3">
                  <Label>Classe</Label>
                  <div className="grid gap-3">
                    {schoolLevels.map((level) => (
                      <button
                        key={level.value}
                        onClick={() => setData({ ...data, schoolLevel: level.value as OnboardingData['schoolLevel'] })}
                        className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                          data.schoolLevel === level.value
                            ? 'border-primary bg-primary/5'
                            : 'border-border bg-card hover:border-primary/50'
                        }`}
                      >
                        <span className="text-2xl">{level.emoji}</span>
                        <span className="font-medium text-foreground flex-1 text-left">
                          {level.label}
                        </span>
                        {data.schoolLevel === level.value && (
                          <Check className="w-5 h-5 text-primary" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              custom={1}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-primary-foreground" />
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground">
                  Choisis ton avatar ✨
                </h2>
                <p className="text-muted-foreground mt-2">
                  Qui t'accompagnera dans tes révisions ?
                </p>
              </div>

              <div className="grid grid-cols-5 gap-3">
                {avatars.map((avatar, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setData({ ...data, avatarIndex: index })}
                    className={`aspect-square text-3xl rounded-2xl border-2 flex items-center justify-center transition-all ${
                      data.avatarIndex === index
                        ? 'border-primary bg-primary/10 shadow-glow'
                        : 'border-border bg-card hover:border-primary/50'
                    }`}
                  >
                    {avatar}
                  </motion.button>
                ))}
              </div>

              <div className="card-elevated p-4 rounded-2xl mt-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center text-4xl">
                    {avatars[data.avatarIndex]}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      {data.firstName || 'Prénom'} {data.lastName || 'Nom'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {data.schoolLevel || 'Niveau'} {data.schoolName && `• ${data.schoolName}`}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer with CTA */}
      <div className="px-6 pb-8 safe-area-pb">
        <Button
          onClick={handleNext}
          disabled={!canProceed()}
          size="lg"
          className="w-full btn-primary-gradient h-14 rounded-2xl text-lg font-semibold"
        >
          {step === totalSteps ? (
            <>
              Commencer ! 🚀
            </>
          ) : (
            <>
              Continuer
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
