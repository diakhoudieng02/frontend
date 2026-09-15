import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Rocket, ChevronRight } from 'lucide-react';

interface CTASectionProps {
  onGetStarted: () => void;
  onViewPricing?: () => void;
}

export default function CTASection({ onGetStarted, onViewPricing }: CTASectionProps) {
  return (
    <section className="px-4 sm:px-6 py-12 sm:py-16">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto text-center glass-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12"
        >
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-3 sm:mb-4">
            Prêt à révolutionner tes révisions ?
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground mb-6 sm:mb-8">
            Rejoins des milliers d'étudiants qui réussissent mieux avec ETOOBLO AI
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Button
              onClick={onGetStarted}
              size="lg"
              className="btn-primary-gradient h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg font-semibold rounded-2xl w-full sm:w-auto"
            >
              <Rocket className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Commencer maintenant
            </Button>
            {onViewPricing && (
              <Button
                onClick={onViewPricing}
                size="lg"
                variant="outline"
                className="h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg font-semibold rounded-2xl w-full sm:w-auto"
              >
                Voir les tarifs
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}