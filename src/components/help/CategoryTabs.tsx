// components/help/CategoryTabs.tsx
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { FaqCategory } from '@/types/help.types';
import * as Icons from 'lucide-react';

interface CategoryTabsProps {
  categories: FaqCategory[];
  activeCategory: string;
  onCategoryChange: (categoryName: string) => void;
}

export function CategoryTabs({ categories, activeCategory, onCategoryChange }: CategoryTabsProps) {
  // Fonction pour obtenir l'icône dynamiquement
  const getIcon = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName] || Icons.HelpCircle;
    return <IconComponent className="h-4 w-4" />;
  };

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {categories.map((category, index) => {
        // ✅ Utiliser l'ID comme clé unique (meilleure pratique)
        // Si l'ID n'existe pas, utiliser le titre comme fallback
        const key = category.id || category.title || `category-${index}`;
        
        return (
          <motion.button
            key={key}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onCategoryChange(category.title)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
              "border border-border/50",
              activeCategory === category.title
                ? "bg-primary text-primary-foreground border-primary shadow-md"
                : "bg-card hover:bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {getIcon(category.iconName)}
            <span>{category.title}</span>
            {category.items && (
              <span className="text-xs opacity-70 ml-1">
                ({category.items.length})
              </span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}