import { motion } from 'framer-motion';
import Section from '@/components/layout/Section';
import { Upload, Brain, MessageCircle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const FEATURES = [
  {
    icon: Upload,
    title: "Upload ton cours",
    description: "PDF, photos ou notes manuscrites",
    gradient: "from-primary to-purple-500",
  },
  {
    icon: Brain,
    title: "L'IA analyse",
    description: "Extraction intelligente du contenu",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: MessageCircle,
    title: "Pose tes questions",
    description: "Réponses basées sur TON cours",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    icon: Sparkles,
    title: "Génère des exercices",
    description: "Quiz personnalisés pour réviser",
    gradient: "from-accent to-teal-500",
  },
];

export default function FeaturesSection() {
  return (
    <Section id="features" className="bg-gradient-to-b from-transparent to-muted/30">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="text-center mb-12"
      >
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
          Comment ça marche ?
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Découvre comment ETOOBLO AI transforme ta façon d'apprendre
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {FEATURES.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5 }}
            className={cn(
              "glass-card p-6 rounded-2xl hover:scale-[1.02] transition-transform duration-300",
              "hover:shadow-lg"
            )}
          >
            <div
              className={cn(
                "mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl",
                "bg-gradient-to-br text-white shadow-md",
                feature.gradient
              )}
            >
              <feature.icon className="h-6 w-6" />
            </div>
            <h3 className="font-display text-lg font-semibold text-foreground mb-2">
              {feature.title}
            </h3>
            <p className="text-muted-foreground">{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}