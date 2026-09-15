// pages/Help.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  HelpCircle, 
  MessageSquare, 
  AlertCircle,
  Ticket,
  Mail,
  Clock,
  Loader2
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supportService } from '@/services/support.service';
import { faqService, type FaqCategory, type FaqItem } from '@/services/faq.service';
import { cn } from '@/lib/utils';
import type { SupportTicket } from '@/types/support.types';
import { FaqAccordion } from '@/components/help/FaqAccordion';
import { CategoryTabs } from '@/components/help/CategoryTabs';
import { SearchBar } from '@/components/help/SearchBar';
import { ContactForm } from '@/components/help/ContactForm';

export default function HelpPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<FaqCategory[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [filteredItems, setFilteredItems] = useState<FaqItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('faq');
  const [recentTickets, setRecentTickets] = useState<SupportTicket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);

  // Charger les FAQs depuis l'API
  useEffect(() => {
    const loadFaqs = async () => {
      try {
        setLoading(true);
        const data = await faqService.getAll();
        
        // ✅ Utiliser directement les données du backend
        setCategories(data);
        
        if (data.length > 0) {
          setActiveCategory(data[0].title); // ✅ Utiliser 'title' pas 'name'
        }
      } catch (error) {
        console.error('❌ Erreur chargement FAQs:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les FAQs. Réessaie plus tard.',
          variant: 'destructive'
        });
        setCategories([]); // ✅ Tableau vide en cas d'erreur
      } finally {
        setLoading(false);
      }
    };

    loadFaqs();
  }, [toast]);

  // Charger les tickets récents (si onglet tickets)
  useEffect(() => {
    if (activeTab === 'tickets') {
      loadRecentTickets();
    }
  }, [activeTab]);

  const loadRecentTickets = async () => {
    setLoadingTickets(true);
    try {
      const tickets = await supportService.getMyTickets();
      setRecentTickets(tickets.slice(0, 3));
    } catch (error) {
      console.error('❌ Erreur chargement tickets:', error);
    } finally {
      setLoadingTickets(false);
    }
  };

  // Filtrer les éléments par catégorie ou recherche
  useEffect(() => {
    // ✅ Vérifier que categories est un tableau
    const safeCategories = categories || [];
    
    if (searchQuery.trim()) {
      // Mode recherche : utiliser la méthode du service
      const searchResults = faqService.searchFaqs(safeCategories, searchQuery);
      setFilteredItems(searchResults);
    } else {
      // Mode normal : afficher la catégorie active
      const activeCategoryData = safeCategories.find(c => c.title === activeCategory);
      setFilteredItems(activeCategoryData?.items || []);
    }
  }, [categories, activeCategory, searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const statusConfig: Record<string, { label: string; color: string }> = {
    PENDING: { label: 'En attente', color: 'bg-amber-500/10 text-amber-500' },
    PROCESSING: { label: 'En cours', color: 'bg-blue-500/10 text-blue-500' },
    RESOLVED: { label: 'Résolu', color: 'bg-green-500/10 text-green-500' },
    ARCHIVED: { label: 'Archivé', color: 'bg-gray-500/10 text-gray-500' },
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
      
        <main className="mx-auto max-w-5xl px-4 py-6">
          <div className="flex items-center justify-center py-12">
            <div className="space-y-4 text-center">
              <Loader2 className="animate-spin h-8 w-8 text-primary mx-auto" />
              <p className="text-sm text-muted-foreground">Chargement de l'aide...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-6">
      {/* Background blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 right-20 h-[400px] w-[400px] rounded-full bg-primary/5 blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-40 -left-40 h-[350px] w-[350px] rounded-full bg-accent/5 blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

     
      
      <main className="relative mx-auto max-w-5xl px-4 py-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="font-display text-3xl font-bold text-foreground flex items-center justify-center gap-2 mb-2">
            <HelpCircle className="h-6 w-6 text-primary" />
            Centre d'aide
          </h1>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            Trouvez des réponses à vos questions ou contactez notre équipe de support.
          </p>
        </motion.div>

        {/* Barre de recherche */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <SearchBar onSearch={handleSearch} />
        </motion.div>

        {/* Tabs principaux */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="faq" className="gap-2">
              <HelpCircle className="h-4 w-4" />
              FAQ
            </TabsTrigger>
            <TabsTrigger value="tickets" className="gap-2">
              <Ticket className="h-4 w-4" />
              Mes tickets
            </TabsTrigger>
          </TabsList>

          {/* Onglet FAQ */}
          <TabsContent value="faq" className="mt-6 space-y-6">
            {/* Navigation par catégories (cachée en mode recherche) */}
            {!searchQuery && categories.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <CategoryTabs
                  categories={categories}
                  activeCategory={activeCategory}
                  onCategoryChange={setActiveCategory}
                />
              </motion.div>
            )}

            {/* Résultats FAQ */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {filteredItems.length > 0 ? (
                <FaqAccordion items={filteredItems} />
              ) : (
                <div className="text-center py-12 glass-card rounded-2xl">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Aucun résultat trouvé
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {searchQuery 
                      ? `Aucune FAQ ne correspond à "${searchQuery}"`
                      : "Aucune FAQ disponible pour le moment"}
                  </p>
                </div>
              )}
            </motion.div>
          </TabsContent>

          {/* Onglet Mes tickets - reste identique */}
          <TabsContent value="tickets" className="mt-6 space-y-6">
            {/* ... (code inchangé) ... */}
          </TabsContent>
        </Tabs>

        {/* Section Contact - Toujours visible */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6 rounded-2xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
              <MessageSquare className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-foreground">
                {searchQuery ? 'Toujours pas de réponse ?' : 'Nous contacter'}
              </h2>
              <p className="text-xs text-muted-foreground">
                Réponse garantie sous 48h ouvrées
              </p>
            </div>
          </div>

          <ContactForm />
        </motion.section>
      </main>
    </div>
  );
}