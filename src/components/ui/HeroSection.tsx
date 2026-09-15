import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import GradientBadge from '@/shared/GradientBadge';
import StatsGrid from '@/shared/StatsGrid';
import ImageCarousel from '@/components/ui/ImageCarousel';
import { ArrowRight, Sparkles, Play } from 'lucide-react'; // Remplacer Rocket par Play
import { useState } from 'react';
import VideoModal from '@/components/ui/VideoModal'; // À créer

interface HeroSectionProps {
  onGetStarted: () => void;
  onViewDemo?: () => void;
  onViewPricing?: () => void;
  onWatchVideo?: () => void; // Nouvelle prop optionnelle
}

const STATS = [
  { value: "10 000+", label: "Étudiants" },
  { value: "98%", label: "Satisfaction" },
  { value: "24/7", label: "Disponibilité" },
];

export default function HeroSection({ 
  onGetStarted, 
  onViewDemo,
  onWatchVideo, // Nouvelle prop
  onViewPricing 
}: HeroSectionProps) {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  
  const demoVideoUrl = "https://wpyqtlwufegoeofkbunp.supabase.co/storage/v1/object/public/demo/etooblo_ai_presentation.mp4";

  const handleWatchVideo = () => {
    if (onWatchVideo) {
      onWatchVideo();
    } else {
      setIsVideoModalOpen(true);
    }
  };

  return (
    <>
      <section className="relative px-4 sm:px-6 pt-8 pb-16 md:pt-16 overflow-hidden">
        {/* Background gradients (inchangé) */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-primary/8 blur-3xl animate-pulse-slow" />
          <div
            className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-accent/8 blur-3xl animate-pulse-slow"
            style={{ animationDelay: "2s" }}
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[300px] rounded-full bg-purple-500/5 blur-3xl animate-float" />
        </div>

        <div className="container mx-auto relative">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center">
            {/* Left Column - Text Content */}
            <div className="w-full lg:w-1/2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="max-w-2xl mx-auto lg:mx-0"
              >
                <GradientBadge
                  icon={Sparkles}
                  text="IA Éducative Nouvelle Génération"
                  className="mb-6"
                />

                <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                  Transforme tes cours en{' '}
                  <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                    super-pouvoirs
                  </span>{' '}
                  d'apprentissage
                </h1>

                <p className="text-lg sm:text-xl text-muted-foreground mb-8 leading-relaxed">
                  L'assistant IA intelligent qui révise avec toi, à partir de TES cours.
                  Personnalisé, précis et disponible quand tu en as besoin.
                </p>

                {/* CTA Buttons - Version avec vidéo */}
                <div className="flex flex-col sm:flex-row gap-4 mb-12">
                  <Button
                    onClick={onGetStarted}
                    size="lg"
                    className="btn-primary-gradient h-14 px-8 text-lg font-semibold rounded-2xl shadow-glow w-full sm:w-auto"
                  >
                    Commencer gratuitement
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  
                  {/* Nouveau bouton vidéo */}
                  <Button
                    onClick={handleWatchVideo}
                    size="lg"
                    variant="outline"
                    className="h-14 px-8 text-lg font-semibold rounded-2xl w-full sm:w-auto group hover:border-primary/50"
                  >
                    <Play className="w-5 h-5 mr-2 fill-current group-hover:text-primary transition-colors" />
                    Voir la démo vidéo
                  </Button>
                </div>

                <StatsGrid stats={STATS} />
              </motion.div>
            </div>

            {/* Right Column - Carousel */}
            <div className="w-full lg:w-1/2">
              <ImageCarousel />
            </div>
          </div>
        </div>
      </section>

      {/* Modal vidéo */}
      <VideoModal 
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        videoUrl={demoVideoUrl}
      />
    </>
  );
}