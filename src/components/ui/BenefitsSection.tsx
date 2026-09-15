import { motion } from 'framer-motion';
import Section from '@/components/layout/Section';
import { Zap, Clock, BarChart3, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

const BENEFITS = [
  { 
    icon: Zap, 
    text: "Révisions personnalisées à 100%",
    description: "Des exercices adaptés à tes besoins spécifiques"
  },
  { 
    icon: Clock, 
    text: "Disponible 24h/24",
    description: "Révise à ton rythme, quand tu veux"
  },
  { 
    icon: BarChart3, 
    text: "Adapté à ton niveau",
    description: "Progresse avec des défis à ta mesure"
  },
  { 
    icon: Shield, 
    text: "Anti-hallucination IA",
    description: "Des réponses fiables et vérifiées"
  },
];

export default function BenefitsSection() {
  return (
    <Section id="benefits">
      <div className="max-w-4xl mx-auto">
        <div className="glass-card rounded-2xl sm:rounded-3xl p-6 sm:p-8">
          <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6">
            Pourquoi choisir ETOOBLO AI ?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {BENEFITS.map((benefit, index) => (
              <motion.div
                key={benefit.text}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3 sm:gap-4 p-4 rounded-xl bg-white/50 dark:bg-gray-900/50"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <benefit.icon className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground text-sm sm:text-base mb-1">
                    {benefit.text}
                  </h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {benefit.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}