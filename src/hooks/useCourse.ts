import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { coursesService } from '@/services/courses.service';
import { useToast } from '@/hooks/use-toast';
import type { CourseWithOutputs, CourseOutputs, ApiError, CourseSection } from '@/types/api';

export function useCourse(id: string | undefined) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [course, setCourse] = useState<CourseWithOutputs | null>(null);
  const [summary, setSummary] = useState<any | null>(null);
  const [outputs, setOutputs] = useState<CourseOutputs | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [courseStatus, setCourseStatus] = useState<'processing' | 'ready' | 'error'>('ready');
  const [navigationSections, setNavigationSections] = useState<CourseSection[]>([]);
  const pollingRef = useRef<{ cancelled: boolean } | null>(null);

  const getJobStorageKey = useCallback((courseId: string) => `summaryJob:${courseId}`, []);

  const extractNavigationSections = useCallback((markdown: string) => {
    const lines = markdown.split('\n');
    const sections: CourseSection[] = [];
    const headingRegex = /^(#{2,3})\s+(.+)$/;

    lines.forEach((line) => {
      const match = line.match(headingRegex);
      if (match) {
        const level = match[1].length;
        const title = match[2];
        const id = title.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

        sections.push({
          id,
          title,
          level: level === 2 ? 'h2' : 'h3',
        });
      }
    });

    setNavigationSections(sections);
  }, []);

  const fetchCourse = useCallback(async () => {
    if (!id) {
      setError('ID du cours manquant');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const courseData = await coursesService.getById(id);
      setCourse(courseData);
      setCourseStatus(courseData.status || 'ready');

      if (courseData.outputs) {
        setOutputs(courseData.outputs);
      }

      try {
        const summaryData = await coursesService.getSummary(id);
        if (summaryData) {
          setSummary(summaryData);
          if (summaryData.markdownBody) {
            extractNavigationSections(summaryData.markdownBody);
          }
        }
      } catch (summaryErr) {
        console.log('No summary available yet');
      }
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Impossible de charger le cours');
      toast({
        title: 'Erreur',
        description: apiError.message || 'Impossible de charger le cours',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [id, toast, extractNavigationSections]);

  const finalizeSummary = useCallback((summaryData: any | null) => {
    if (summaryData) {
      setSummary(summaryData);
      if (summaryData.markdownBody) {
        extractNavigationSections(summaryData.markdownBody);
      }
    }
  }, [extractNavigationSections]);

  const startPollingSummaryJob = useCallback((jobId: string) => {
    if (!id) return;

    if (pollingRef.current) {
      pollingRef.current.cancelled = true;
    }

    const token = { cancelled: false };
    pollingRef.current = token;

    const maxAttempts = 120; // ~5 minutes à 2.5s
    const intervalMs = 2500;
    let attempts = 0;

    const poll = async () => {
      if (token.cancelled) return;
      attempts += 1;

      try {
        const status = await coursesService.getSummaryJobStatus(id, jobId);

        if (status.status === 'COMPLETED') {
          if (status.summary) {
            finalizeSummary(status.summary);
          } else {
            const summaryData = await coursesService.getSummary(id);
            finalizeSummary(summaryData);
          }

          localStorage.removeItem(getJobStorageKey(id));
          setGenerating(false);
          toast({
            title: 'Succès',
            description: 'Le résumé a été généré avec succès',
          });
          return;
        }

        if (status.status === 'FAILED') {
          localStorage.removeItem(getJobStorageKey(id));
          setGenerating(false);
          toast({
            title: 'Échec',
            description: status.errorMessage || 'La génération du résumé a échoué',
            variant: 'destructive',
          });
          return;
        }
      } catch (err) {
        // Erreurs réseau/transitoires: on continue à poller sans notifier
      }

      if (attempts < maxAttempts) {
        setTimeout(poll, intervalMs);
      } else {
        setGenerating(false);
        toast({
          title: 'Délai dépassé',
          description: 'Le résumé prend plus de temps que prévu. Vous pourrez réessayer dans quelques minutes.',
        });
      }
    };

    void poll();
  }, [id, finalizeSummary, toast]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        pollingRef.current.cancelled = true;
      }
    };
  }, []);

  useEffect(() => {
    if (!id || summary || generating) return;
    if (pollingRef.current && !pollingRef.current.cancelled) return;

    const storedJobId = localStorage.getItem(getJobStorageKey(id));
    if (storedJobId) {
      startPollingSummaryJob(storedJobId);
    }
  }, [id, summary, generating, startPollingSummaryJob, getJobStorageKey]);

  const handleGenerateSummary = async () => {
    if (!id) return;
    if (generating) {
      toast({
        title: 'Info',
        description: 'Une génération est déjà en cours',
      });
      return;
    }

    if (pollingRef.current && !pollingRef.current.cancelled) {
      toast({
        title: 'Info',
        description: 'Résumé en cours de génération',
      });
      return;
    }

    setGenerating(true);
    try {
      const job = await coursesService.createSummaryJob(id, {
        targetLevel: 'Seconde',
        language: 'fr',
        force: false,
      });

      if (job.status === 'COMPLETED') {
        finalizeSummary(job.summary ?? null);
        localStorage.removeItem(getJobStorageKey(id));
        setGenerating(false);
        toast({
          title: 'Succès',
          description: 'Le résumé a été généré avec succès',
        });
        return;
      }

      localStorage.setItem(getJobStorageKey(id), job.jobId);
      startPollingSummaryJob(job.jobId);
      return;
    } catch (err) {
      const apiError = err as ApiError;
      setGenerating(false);
      toast({
        title: 'Erreur',
        description: apiError.message || 'Impossible de générer le résumé',
        variant: 'destructive',
      });
    } finally {
      // Le polling gère la fin de génération
    }
  };

  const handleDeleteCourse = async () => {
    if (!course) return;

    try {
      await coursesService.deleteCourse(course.id);
      toast({
        title: 'Cours supprimé',
        description: 'Le cours a été supprimé avec succès',
      });
      navigate('/courses');
    } catch (err) {
      const apiError = err as ApiError;
      toast({
        title: 'Erreur',
        description: apiError.message || 'Impossible de supprimer le cours',
        variant: 'destructive',
      });
      throw err;
    }
  };

  return {
    course,
    summary,
    outputs,
    loading,
    generating,
    error,
    courseStatus,
    navigationSections,
    handleGenerateSummary,
    handleDeleteCourse,
    refreshCourse: fetchCourse,
  };
}
