// services/courses.service.ts
import { api } from './api';
import type {
  ApiResponse,
  Course,
  CourseOutputs,
  CoursesListResponse,
  UploadCoursePayload,
  CourseWithOutputs,
  ScanUploadResponse,
  ScanUploadPayload,
  DocumentType, // ✅ Importer le nouveau type
} from '@/types/api';
import type { PassTransaction } from '@/types';
import type {
  SummaryResponse,
  CourseSummary,
  GenerateSummaryPayload,
  GenerateSummaryResponse,
  SummaryStreamCallbacks,
  SummaryJobResponse,
} from '@/types/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://srv1346125.hstgr.cloud/api';

export const coursesService = {

  // ============================================================
  // SCAN UPLOAD - CORRIGÉ
  // ============================================================
  /**
   * Upload d'images (scan) et création de cours avec OCR
   * POST /courses/scan-upload
   */
  scanUpload: async (payload: ScanUploadPayload): Promise<ScanUploadResponse> => {
    const formData = new FormData();
    formData.append('title', payload.title);
    formData.append('subject', payload.subject);
    
    if (payload.notes) {
      formData.append('notes', payload.notes);
    }
    
    // ✅ Ajouter le type si présent (défaut: 'COURS')
    formData.append('type', payload.type || 'COURS');
    if (payload.examDate) {
      formData.append('examDate', payload.examDate);
    }
    
    payload.images.forEach((image) => {
      formData.append('images', image);
    });

    const response = await api.post<ApiResponse<ScanUploadResponse>>(
      '/courses/scan-upload',
      formData
    );
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Erreur lors du scan des images');
    }

    return response.data as unknown as ScanUploadResponse;
  },

  /**
   * Récupérer le résumé structuré d'un cours
   * GET /courses/{id}/summary
   */
  getSummary: async (courseId: string): Promise<CourseSummary | null> => {
    try {
      const response = await api.get<ApiResponse<SummaryResponse>>(
        `/courses/${courseId}/summary`
      );
      
      if (!response.success || !response.data) {
        return null;
      }
      
      return response.data.summary;
    } catch (error) {
      console.debug('Pas de résumé disponible pour ce cours');
      return null;
    }
  },

  /**
   * Générer (ou régénérer) le résumé structuré d'un cours
   * POST /courses/{id}/generate-summary
   */
  generateSummary: async (
    courseId: string,
    options?: GenerateSummaryPayload
  ): Promise<CourseSummary> => {
    const payload = {
      force: options?.force ?? false,
      targetLevel: options?.targetLevel ?? 'Seconde',
      language: options?.language ?? 'fr',
    };

    const response = await api.post<ApiResponse<GenerateSummaryResponse>>(
      `/courses/${courseId}/generate-summary`,
      payload
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Erreur lors de la génération du résumé');
    }

    return response.data.summary;
  },

  /**
   * Lancer un job de génération de résumé (asynchrone)
   * POST /courses/{id}/summary/jobs
   */
  createSummaryJob: async (
    courseId: string,
    options?: GenerateSummaryPayload
  ): Promise<SummaryJobResponse> => {
    const payload = {
      force: options?.force ?? false,
      targetLevel: options?.targetLevel ?? 'Seconde',
      language: options?.language ?? 'fr',
    };

    const response = await api.post<ApiResponse<SummaryJobResponse>>(
      `/courses/${courseId}/summary/jobs`,
      payload
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Erreur lors du lancement du job de résumé');
    }

    return response.data as SummaryJobResponse;
  },

  /**
   * Récupérer le statut d'un job de résumé
   * GET /courses/{id}/summary/jobs/{jobId}
   */
  getSummaryJobStatus: async (
    courseId: string,
    jobId: string
  ): Promise<SummaryJobResponse> => {
    const response = await api.get<ApiResponse<SummaryJobResponse>>(
      `/courses/${courseId}/summary/jobs/${jobId}`
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Erreur lors de la récupération du statut du job');
    }

    return response.data as SummaryJobResponse;
  },
  
  /**
   * Générer le résumé en streaming SSE
   * GET /courses/{id}/summary/stream?token=JWT&force=...&targetLevel=...&language=...
   * Retourne une fonction de cleanup (ferme le EventSource).
   */
  streamSummary: (
    courseId: string,
    token: string,
    options: GenerateSummaryPayload,
    callbacks: SummaryStreamCallbacks
  ): (() => void) => {
    const params = new URLSearchParams({
      token,
      force: String(options.force ?? false),
      targetLevel: options.targetLevel ?? 'Seconde',
      language: options.language ?? 'fr',
    });

    const abort = new AbortController();

    (async () => {
      let response: Response;
      try {
        response = await fetch(
          `${API_BASE_URL}/courses/${courseId}/summary/stream?${params}`,
          { signal: abort.signal }
        );
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
        callbacks.onError?.({ code: 'INTERNAL_ERROR', message: 'Impossible de joindre le serveur' });
        return;
      }

      if (!response.ok) {
        callbacks.onError?.({ code: 'INTERNAL_ERROR', message: `Erreur serveur (HTTP ${response.status})` });
        return;
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let eventType = 'message';
      let eventData = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            if (line.startsWith('event:')) {
              eventType = line.slice(6).trim();
            } else if (line.startsWith('data:')) {
              eventData = line.slice(5).trim();
            } else if (line === '') {
              if (eventData) {
                const parsed = JSON.parse(eventData);
                switch (eventType) {
                  case 'status':          callbacks.onStatus?.(parsed); break;
                  case 'content_chunk':   callbacks.onChunk?.(parsed); break;
                  case 'map_progress':    callbacks.onMapProgress?.(parsed); break;
                  case 'structured_data': callbacks.onStructuredData?.(parsed); break;
                  case 'complete':
                    callbacks.onComplete?.(parsed);
                    return; // Stream terminé normalement
                  case 'error':
                    callbacks.onError?.(parsed);
                    return;
                }
              }
              eventType = 'message';
              eventData = '';
            }
          }
        }
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          callbacks.onError?.({ code: 'INTERNAL_ERROR', message: 'Connexion interrompue' });
        }
      }
    })();

    return () => abort.abort();
  },

  /**
   * Upload d'un cours PDF
   * POST /courses/upload
   */
// services/courses.service.ts

upload: async (
  title: string, 
  subject: 'math' | 'Langues', 
  file: File,
  type: DocumentType = 'COURS',
  examDate?: string
): Promise<Course> => {
  console.log('📤 Service upload - Paramètres reçus:', { title, subject, type, examDate });
  
  const formData = new FormData();
  formData.append('title', title);
  formData.append('subject', subject);
  formData.append('type', type); // ✅ 'COURS' ou 'EPREUVE'
  if (examDate) {
    formData.append('examDate', examDate);
  }
  formData.append('file', file);

  // Afficher le contenu du FormData
  console.log('📦 FormData entries:');
  for (let pair of (formData as any).entries()) {
    console.log(`  - ${pair[0]}:`, pair[1] instanceof File ? `File(${pair[1].name})` : pair[1]);
  }

  const response = await api.post<ApiResponse<{ course: Course }>>(
    '/courses/upload',
    formData
  );

  if (!response.success || !response.data) {
    throw new Error(response.message || 'Erreur lors de l\'upload');
  }

  // ✅ Normaliser le type si absent
  const course = response.data.course;
  const normalizedCourse: Course = {
    ...course,
    type: course.type || type,
  };

  console.log('✅ Réponse upload - Course reçu:', normalizedCourse);
  return normalizedCourse;
},

  /**
   * Lister tous les cours
   * GET /courses
   */
  list: async (): Promise<Course[]> => {
    console.log('📡 Appel API /courses');
    const response = await api.get<ApiResponse<CoursesListResponse>>('/courses');
    console.log('📡 Réponse API brute:', response);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Erreur lors de la récupération');
    }

    // ✅ Normaliser les cours : si pas de type, défaut 'COURS'
    const normalizedCourses = response.data.courses.map((course) => ({
      ...course,
      type: course.type || 'COURS',
    }));

    console.log('📚 Cours normalisés:');
    normalizedCourses.forEach((course) => {
      console.log(`  - ${course.title}: type="${course.type}"`);
    });

    return normalizedCourses;
  },

  /**
   * Récupérer mes cours (alias de list)
   */
  getMyCourses: async (): Promise<Course[]> => {
    return coursesService.list();
  },

  /**
   * Récupérer un cours par ID
   * GET /courses/{courseId}
   */
  getById: async (courseId: string): Promise<CourseWithOutputs> => {
    const response = await api.get<ApiResponse<{ course: CourseWithOutputs }>>(
      `/courses/${courseId}`
    );
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Erreur lors de la récupération');
    }

    // ✅ Normaliser le type pour le cours individuel
    const course = response.data.course;
    return {
      ...course,
      type: course.type || 'COURS',
    };
  },

  /**
   * Récupérer les outputs d'un cours
   * GET /courses/{courseId}/outputs
   */
  getOutputs: async (courseId: string): Promise<CourseOutputs> => {
    const response = await api.get<ApiResponse<{ outputs: CourseOutputs }>>(
      `/courses/${courseId}/outputs`
    );
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Erreur lors de la récupération des outputs');
    }
    return response.data.outputs;
  },

  /**
   * Générer les outputs d'un cours
   * POST /courses/{courseId}/outputs/generate
   */
  generateOutputs: async (courseId: string): Promise<CourseOutputs> => {
    const response = await api.post<ApiResponse<{ outputs: CourseOutputs }>>(
      `/courses/${courseId}/outputs/generate`
    );
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Erreur lors de la génération des outputs');
    }
    return response.data.outputs;
  },

  /**
   * Obtenir l'URL de téléchargement signée
   * GET /courses/{id}/download
   */
  getDownloadUrl: async (courseId: string): Promise<string> => {
    const response = await api.get<ApiResponse<{ downloadUrl: string; expiresIn: number }>>(
      `/courses/${courseId}/download`
    );
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Erreur lors de la génération du lien');
    }
    return response.data.downloadUrl;
  },

  /**
   * Supprimer un cours
   * DELETE /courses/{courseId}
   */
  deleteCourse: async (courseId: string): Promise<void> => {
    const response = await api.delete<ApiResponse<null>>(`/courses/${courseId}`);
    
    if (!response.success) {
      throw new Error(response.message || 'Erreur lors de la suppression');
    }
  },

  // ============================================================
  // GESTION DES PASS (à déplacer dans un service dédié plus tard)
  // ============================================================
  async getPassBalance(): Promise<{ balance: number; transactions: PassTransaction[] }> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const stored = localStorage.getItem('passBalance');
    const balance = stored ? parseInt(stored) : 10;
    
    const storedTxs = localStorage.getItem('passTransactions');
    const transactions = storedTxs ? JSON.parse(storedTxs) : [];
    
    return { balance, transactions };
  },

  async consumePass(): Promise<{ success: boolean }> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const { balance } = await this.getPassBalance();
    if (balance > 0) {
      localStorage.setItem('passBalance', (balance - 1).toString());
      return { success: true };
    }
    return { success: false };
  },

  async addPasses(amount: number): Promise<{ success: boolean; newBalance: number }> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const { balance } = await this.getPassBalance();
    const newBalance = balance + amount;
    localStorage.setItem('passBalance', newBalance.toString());
    return { success: true, newBalance };
  }
};