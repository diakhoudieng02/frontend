// src/constants/index.ts
import { 
  Upload, Brain, MessageCircle, Sparkles, 
  Zap, Clock, BarChart3, Shield 
} from 'lucide-react';

export const FEATURES = [
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

export const BENEFITS = [
  { icon: Zap, text: "Révisions personnalisées à 100%" },
  { icon: Clock, text: "Disponible 24h/24" },
  { icon: BarChart3, text: "Adapté à ton niveau" },
  { icon: Shield, text: "Anti-hallucination IA" },
];

export const STATS = [
  { value: "10 000+", label: "Étudiants" },
  { value: "98%", label: "Satisfaction" },
  { value: "24/7", label: "Disponibilité" },
];

export const ILLUSTRATIONS = [
  { image: "/images/img1.png", alt: "Interface d'upload de cours" },
  { image: "/images/img2.png", alt: "Analyse IA des documents" },
  { image: "/images/img3.png", alt: "Génération d'exercices" },
];