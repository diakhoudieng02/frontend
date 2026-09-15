// services/faq.service.ts
import { api } from './api';

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  displayOrder: number;
}

export interface FaqCategory {
  id: string;
  title: string;
  iconName: string;
  displayOrder: number;
  items: FaqItem[];
}

// ✅ Interface alignée avec la réponse réelle du backend
export interface FaqResponse {
  success: boolean;
  data: FaqCategory[];
  cachedAt?: string;  // ✅ Pas de propriété 'message'
}

class FaqService {
  /**
   * Récupère toutes les FAQ
   */
  async getAll(): Promise<FaqCategory[]> {
    try {
      console.log('📤 Récupération des FAQs...');
      const response = await api.get<FaqResponse>('/faq');
      
      console.log('📦 Réponse brute:', response);
      
      // ✅ Vérifier success et data, pas de message
      if (!response.success || !response.data) {
        throw new Error('Erreur lors de la récupération des FAQs');
      }
      
      console.log('✅ FAQs récupérées:', response.data.length, 'catégories');
      if (response.cachedAt) {
        console.log('📦 Cache du:', new Date(response.cachedAt).toLocaleString('fr-FR'));
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération FAQs:', error);
      throw error;
    }
  }

  /**
   * Invalide le cache des FAQs (admin seulement)
   */
  async invalidateCache(): Promise<{ success: boolean; message: string }> {
    try {
      console.log('📤 Invalidation du cache FAQ...');
      // ✅ Ici on peut avoir une structure différente
      const response = await api.get<{ success: boolean; message: string }>('/faq/invalidate-cache');
      
      console.log('📦 Réponse invalidation:', response);
      
      return response;
    } catch (error) {
      console.error('❌ Erreur invalidation cache:', error);
      throw error;
    }
  }

  /**
   * Recherche dans les FAQs
   */
  searchFaqs(categories: FaqCategory[], query: string): (FaqItem & { categoryTitle: string; categoryIcon: string })[] {
    if (!query.trim()) return [];
    
    const searchTerms = query.toLowerCase().split(' ');
    
    const allItems = categories.flatMap(cat => 
      cat.items.map(item => ({
        ...item,
        categoryTitle: cat.title,
        categoryIcon: cat.iconName
      }))
    );
    
    return allItems.filter(item => {
      const question = item.question.toLowerCase();
      const answer = item.answer.toLowerCase();
      
      // Vérifier si tous les termes de recherche sont présents
      return searchTerms.every(term => 
        question.includes(term) || answer.includes(term)
      );
    });
  }

  /**
   * Groupe les FAQs par catégorie après recherche
   */
  groupByCategory(categories: FaqCategory[], searchResults: (FaqItem & { categoryTitle: string; categoryIcon: string })[]): FaqCategory[] {
    if (searchResults.length === 0) return categories;
    
    // Créer une map des résultats par catégorie
    const resultsByCategory = new Map<string, FaqItem[]>();
    
    searchResults.forEach(item => {
      const category = categories.find(cat => 
        cat.items.some(i => i.id === item.id)
      );
      
      if (category) {
        if (!resultsByCategory.has(category.id)) {
          resultsByCategory.set(category.id, []);
        }
        resultsByCategory.get(category.id)!.push(item);
      }
    });
    
    // Reconstruire les catégories avec seulement les résultats
    return Array.from(resultsByCategory.entries()).map(([categoryId, items]) => {
      const originalCategory = categories.find(c => c.id === categoryId)!;
      return {
        ...originalCategory,
        items: items.sort((a, b) => a.displayOrder - b.displayOrder)
      };
    });
  }
}

export const faqService = new FaqService();