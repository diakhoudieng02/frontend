// hooks/usePdf.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { coursesService } from '@/services/courses.service';
import { useToast } from '@/hooks/use-toast';
import type { CourseWithOutputs } from '@/types/api';

export function usePdf(course: CourseWithOutputs | null) {
  const { toast } = useToast();
  const [pdfUrl, setPdfUrl] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfProgress, setPdfProgress] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isScanCourse, setIsScanCourse] = useState(false); // ✅ Nouvel état
  const [pdfError, setPdfError] = useState<string | null>(null); // ✅ Nouvel état
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  // ✅ Détecter si c'est un cours scanné
  useEffect(() => {
    if (!course) return;
    
    // Un cours scanné a souvent un fileUrl qui est une image ou pas de fileUrl du tout
    const scanned = !course.fileUrl || 
                    course.fileUrl.includes('.jpg') || 
                    course.fileUrl.includes('.jpeg') ||
                    course.fileUrl.includes('.png') ||
                    course.fileUrl.includes('.webp');
    
    setIsScanCourse(scanned);
  }, [course]);

  const handlePdfScroll = useCallback(() => {
    if (!iframeRef.current) return;
    
    try {
      const iframe = iframeRef.current;
      const iframeDocument = iframe.contentDocument || iframe.contentWindow?.document;
      
      if (iframeDocument) {
        const scrollElement = iframeDocument.documentElement || iframeDocument.body;
        const scrollTop = scrollElement.scrollTop;
        const scrollHeight = scrollElement.scrollHeight - scrollElement.clientHeight;
        const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
        
        setPdfProgress(Math.min(100, Math.max(0, Math.round(progress))));
        
        setIsScrolling(true);
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
        scrollTimeoutRef.current = setTimeout(() => {
          setIsScrolling(false);
        }, 150);
      }
    } catch (error) {
      console.debug('Impossible de détecter le scroll du PDF');
    }
  }, []);

  const handleIframeLoad = useCallback(() => {
    setPdfProgress(0);
    
    setTimeout(() => {
      if (iframeRef.current) {
        try {
          const iframe = iframeRef.current;
          const iframeDocument = iframe.contentDocument || iframe.contentWindow?.document;
          
          if (iframeDocument) {
            iframeDocument.removeEventListener('scroll', handlePdfScroll);
            iframeDocument.addEventListener('scroll', handlePdfScroll);
          }
        } catch (error) {
          console.error('Erreur attachement listener:', error);
        }
      }
    }, 500);
  }, [handlePdfScroll]);

// hooks/usePdf.ts - CORRECTION

useEffect(() => {
  if (!course) return;
  
  const loadPdfUrl = async () => {
    // Si c'est un cours scanné, pas de PDF
    if (isScanCourse) {
      console.log('📄 Cours scanné détecté - pas de PDF disponible');
      setPdfError('Ce cours a été créé par scan. Aucun PDF disponible.');
      setPdfLoading(false);
      
      toast({
        title: "Cours scanné",
        description: "Les cours créés par scan n'ont pas de fichier PDF.",
        variant: "default",
      });
      return;
    }

    setPdfLoading(true);
    setPdfError(null);
    
    try {
      // STRATÉGIE 1: Utiliser downloadUrl si disponible
      if (course.downloadUrl) {
        console.log('✅ Utilisation downloadUrl:', course.downloadUrl);
        setPdfUrl(course.downloadUrl);
      } 
      // STRATÉGIE 2: Utiliser fileUrl si disponible
      else if (course.fileUrl) {
        // ✅ Vérifier que fileUrl n'est pas "scan" ou autre valeur invalide
        if (course.fileUrl === 'scan' || course.fileUrl.includes('scan')) {
          console.log('⚠️ fileUrl invalide pour PDF:', course.fileUrl);
          setPdfError('Ce cours ne contient pas de fichier PDF.');
        }
        else if (course.fileUrl.startsWith('http')) {
          console.log('✅ Utilisation fileUrl complet:', course.fileUrl);
          setPdfUrl(course.fileUrl);
        } 
        else {
          // ✅ Construire l'URL publique correcte
          const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
          // Format: /storage/v1/object/public/courses/{userId}/{filename}
          const publicUrl = `${supabaseUrl}/storage/v1/object/public/courses/${course.fileUrl}`;
          console.log('✅ Construction URL publique:', publicUrl);
          setPdfUrl(publicUrl);
        }
      }
      // STRATÉGIE 3: Appeler l'API en dernier recours
      else {
        console.log('📡 Appel API getDownloadUrl');
        const url = await coursesService.getDownloadUrl(course.id);
        setPdfUrl(url);
      }
    } catch (err) {
      console.error('❌ Erreur chargement PDF:', err);
      setPdfError('Impossible de charger le PDF');
      toast({
        title: 'Erreur',
        description: 'Impossible de charger le PDF',
        variant: 'destructive',
      });
    } finally {
      setPdfLoading(false);
    }
  };
  
  loadPdfUrl();
}, [course, toast, isScanCourse]);

  useEffect(() => {
    if (!iframeRef.current) return;

    const iframe = iframeRef.current;
    
    const observer = new MutationObserver(() => {
      handleIframeLoad();
    });

    observer.observe(iframe, {
      childList: true,
      attributes: true,
      subtree: true
    });

    return () => {
      observer.disconnect();
      if (iframe.contentDocument) {
        iframe.contentDocument.removeEventListener('scroll', handlePdfScroll);
      }
    };
  }, [handleIframeLoad, handlePdfScroll]);

  const handlePdfProgressChange = (value: number[]) => {
    const newProgress = value[0];
    setPdfProgress(newProgress);
    
    if (iframeRef.current) {
      try {
        const iframe = iframeRef.current;
        const iframeDocument = iframe.contentDocument || iframe.contentWindow?.document;
        
        if (iframeDocument) {
          const scrollElement = iframeDocument.documentElement || iframeDocument.body;
          const scrollHeight = scrollElement.scrollHeight - scrollElement.clientHeight;
          const scrollTop = (newProgress / 100) * scrollHeight;
          
          scrollElement.scrollTo({
            top: scrollTop,
            behavior: 'smooth'
          });
        }
      } catch (error) {
        console.debug('Erreur scroll manuel:', error);
      }
    }
  };

  const handleDownloadPdf = async () => {
    if (!course) return;
    
    // ✅ Pour les cours scannés, message d'information
    if (isScanCourse) {
      toast({
        title: 'Cours scanné',
        description: 'Les cours créés par scan n\'ont pas de fichier PDF à télécharger.',
        variant: 'default',
      });
      return;
    }
    
    try {
      const downloadUrl = await coursesService.getDownloadUrl(course.id);
      window.open(downloadUrl, '_blank');
      
      toast({
        title: 'Téléchargement démarré',
        description: 'Le PDF est en cours de téléchargement',
      });
    } catch (err) {
      toast({
        title: 'Erreur',
        description: 'Impossible de télécharger le PDF',
        variant: 'destructive',
      });
    }
  };

  return {
    pdfUrl,
    pdfLoading,
    pdfProgress,
    pdfError,
    isScrolling,
    isScanCourse,
    iframeRef,
    handlePdfProgressChange,
    handleDownloadPdf
  };
}