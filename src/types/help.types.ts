// types/help.types.ts
import type { FaqCategory as ApiFaqCategory, FaqItem as ApiFaqItem } from '@/services/faq.service';

export type FaqCategory = ApiFaqCategory;
export type FaqItem = ApiFaqItem;

// Pour l'affichage, on peut ajouter des propriétés supplémentaires
export interface DisplayFaqItem extends FaqItem {
  categoryTitle?: string;
  categoryIcon?: string;
}

export interface HelpStats {
  avgResponseTime: string;
  supportHours: string;
  totalFaqs: number;
  totalCategories: number;
}