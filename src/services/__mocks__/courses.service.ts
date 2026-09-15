// src/services/__mocks__/courses.service.mock.ts
import { mockCoursesMap, mockCourseWithOutputs } from '@/data/mockCourseData';
import type { CourseWithOutputs, CourseOutputs } from '@/types/api';

// Simuler un délai réseau
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockCoursesService = {
  getById: async (id: string): Promise<CourseWithOutputs> => {
    await delay(1000); // Simuler le chargement
    
    if (mockCoursesMap[id]) {
      return mockCoursesMap[id];
    }
    
    // Par défaut, retourner le cours complet si l'ID commence par 'mock-'
    if (id.startsWith('mock-')) {
      return mockCourseWithOutputs;
    }
    
    throw { message: 'Cours non trouvé', status: 404 };
  },
  
  getOutputs: async (id: string): Promise<CourseOutputs> => {
    await delay(800);
    
    const course = mockCoursesMap[id];
    if (course?.outputs) {
      return course.outputs;
    }
    
    throw { message: 'Outputs non disponibles', status: 404 };
  },
  
  generateOutputs: async (id: string): Promise<CourseOutputs> => {
    await delay(2000); // Simuler un temps de génération plus long
    
    // Simuler la génération en ajoutant une section au résumé
    const course = mockCoursesMap[id] || mockCourseWithOutputs;
    const newOutputs = {
      ...course.outputs!,
      summary: course.outputs?.summary + '\n\n## Nouvelle section générée\n\nCe contenu a été généré dynamiquement par l\'IA.'
    };
    
    return newOutputs;
  },
  
  markFlashcardMastered: async (courseId: string, flashcardId: string): Promise<{ success: boolean }> => {
    await delay(300);
    return { success: true };
  },
  
  getDownloadUrl: async (courseId: string): Promise<string> => {
    await delay(500);
    return `https://example.com/course-${courseId}-download.pdf`;
  }
};