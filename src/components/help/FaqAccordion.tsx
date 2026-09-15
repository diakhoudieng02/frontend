// components/help/FaqAccordion.tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FaqItem } from '@/types/help.types';

interface FaqAccordionProps {
  items: FaqItem[];
  categoryTitle?: string;
  categoryIcon?: string;
}

export function FaqAccordion({ items, categoryTitle, categoryIcon }: FaqAccordionProps) {
  const [openItemId, setOpenItemId] = useState<string | null>(null);

  const toggleItem = (id: string) => {
    setOpenItemId(openItemId === id ? null : id);
  };

  if (items.length === 0) return null;

  return (
    <div className="space-y-3">
      {categoryTitle && (
        <div className="flex items-center gap-2 px-1 mb-2">
          <span className="text-lg">{categoryIcon}</span>
          <h3 className="font-display font-semibold text-foreground">{categoryTitle}</h3>
        </div>
      )}
      
      <div className="space-y-2">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
              "glass-card rounded-xl overflow-hidden transition-all",
              openItemId === item.id ? "ring-2 ring-primary/20" : "hover:bg-muted/50"
            )}
          >
            {/* Question */}
            <button
              onClick={() => toggleItem(item.id)}
              className="w-full flex items-center justify-between p-4 text-left"
            >
              <div className="flex items-center gap-3 pr-8">
                <HelpCircle className="h-5 w-5 text-primary shrink-0" />
                <span className="font-medium text-foreground text-sm sm:text-base">
                  {item.question}
                </span>
              </div>
              <div className="shrink-0">
                {openItemId === item.id ? (
                  <ChevronUp className="h-5 w-5 text-primary" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </button>

            {/* Réponse */}
            <AnimatePresence>
              {openItemId === item.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 pt-2 border-t border-border/50 bg-muted/20">
                    <div className="pl-8 text-sm text-muted-foreground leading-relaxed">
                      {item.answer.split('\n').map((paragraph, i) => (
                        <p key={i} className={i > 0 ? 'mt-2' : ''}>
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}