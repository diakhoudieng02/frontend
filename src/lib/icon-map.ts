// lib/icon-map.ts
import * as Icons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// Map des noms d'icônes vers les composants Lucide
export const ICON_MAP: Record<string, LucideIcon> = {
  BookOpen: Icons.BookOpen,
  CreditCard: Icons.CreditCard,
  Zap: Icons.Zap,
  Shield: Icons.Shield,
  HelpCircle: Icons.HelpCircle,
  MessageSquare: Icons.MessageSquare,
  Send: Icons.Send,
  Loader2: Icons.Loader2,
  Search: Icons.Search,
  X: Icons.X,
  ChevronDown: Icons.ChevronDown,
  ChevronRight: Icons.ChevronRight,
  AlertCircle: Icons.AlertCircle,
  CheckCircle: Icons.CheckCircle
};

/**
 * Récupère le composant d'icône correspondant au nom
 * Retourne une icône par défaut si non trouvée
 */
export function getIcon(iconName: string, defaultIcon: LucideIcon = Icons.HelpCircle): LucideIcon {
  return ICON_MAP[iconName] || defaultIcon;
}