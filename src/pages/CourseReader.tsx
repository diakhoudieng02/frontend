import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from "@/components/layout/Navbar";
import type { Course } from '@/types/api';
// COMMENTÉ : Import du service API réel
// import { coursesService } from '@/services/courses.service';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  FileText,
  BookOpen,
  MessageSquare,
  Loader2,
} from 'lucide-react';

// IMPORT DES DONNÉES MOCKÉES
import { mockCoursesMap, mockCourseWithOutputs, mockCoursesList } from '@/data/mockCourseData';

// ✅ Catégories alignées avec le backend
const COURSE_CATEGORIES = [
  { value: 'math', label: 'Mathématiques', emoji: '📐' },
  { value: 'Langues', label: 'Langues', emoji: '🗣️' },
];

// ✅ Composant pour afficher le PDF avec URL signée (version mockée)
function PDFViewer({ courseId, title }: { courseId: string; title: string }) {
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const loadPdfUrl = async () => {
      try {
        // Simuler un délai réseau
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Version mockée : utiliser une URL factice
        // Dans un environnement réel, ce serait l'URL du PDF
        setPdfUrl('https://raw.githubusercontent.com/mozilla/pdf.js-sample-files/master/helloworld.pdf');
        
        /* COMMENTÉ : Appel API réel
        const url = await coursesService.getDownloadUrl(courseId);
        setPdfUrl(url);
        */
        
      } catch (err) {
        console.error('Erreur chargement PDF:', err);
        setError('Impossible de charger le PDF');
        toast({
          title: 'Erreur',
          description: 'Impossible de charger le PDF',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadPdfUrl();
  }, [courseId, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !pdfUrl) {
    return (
      <div className="p-12 text-center">
        <p className="text-destructive font-semibold mb-2">Erreur</p>
        <p className="text-sm text-muted-foreground">{error || 'PDF introuvable'}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {/* Embedded PDF iframe avec un PDF de démo */}
      <iframe
        src={pdfUrl}
        className="w-full h-[70vh] min-h-[400px] border-0"
        title={title}
      />
      <div className="p-3 w-full border-t border-border/60 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          PDF · {title} (Mode Démo)
        </span>
        <a
          href={pdfUrl}
          download
          className="text-xs font-medium text-primary hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Télécharger
        </a>
      </div>
    </div>
  );
}

export default function CourseReader() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [course, setCourse] = useState<Course | null>(null);
  const [loadingCourse, setLoadingCourse] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) {
      navigate('/courses');
      return;
    }
    
    const load = async () => {
      setLoadingCourse(true);
      setError('');
      try {
        // Simuler un délai réseau
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Utiliser les données mockées
        let mockCourse = null;
        
        // Vérifier si l'ID est dans notre map de cours mockés
        if (id.startsWith('mock-')) {
          mockCourse = mockCoursesMap[id];
        }
        
        // Si pas trouvé, chercher dans la liste des cours
        if (!mockCourse) {
          mockCourse = mockCoursesList.find(c => c.id === id);
        }
        
        // Fallback vers le cours par défaut
        if (!mockCourse) {
          console.warn(`Cours avec ID "${id}" non trouvé, utilisation du cours par défaut`);
          mockCourse = mockCourseWithOutputs;
        }
        
        setCourse(mockCourse);
        
        /* COMMENTÉ : Appel API réel
        const c = await coursesService.getById(id);
        setCourse(c);
        */
        
      } catch (err) {
        console.error('Erreur chargement cours:', err);
        setError('Impossible de charger le cours');
        toast({
          title: 'Erreur',
          description: 'Impossible de charger le cours',
          variant: 'destructive',
        });
      } finally {
        setLoadingCourse(false);
      }
    };
    
    load();
  }, [id, navigate, toast]);

  const cat = course ? COURSE_CATEGORIES.find(c => c.value === course.subject) : null;

  const handleChat = () => {
    if (!course) return;
    navigate(`/courses/${course.id}`, {
      state: {
        courseTitle: course.title,
        courseCategory: cat?.label || course.subject,
      },
    });
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <p className="text-destructive font-semibold mb-2">Erreur</p>
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={() => navigate('/courses')} className="mt-4" variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux cours
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-6">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl animate-pulse-slow" />
      </div>

      <Navbar />

      <main className="relative mx-auto max-w-3xl px-4 py-6 space-y-5">
        {/* Header */}
        <div className="animate-fade-in">
          <button 
            onClick={() => navigate('/courses')} 
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
          >
            <ArrowLeft className="h-4 w-4" /> Retour aux cours
          </button>

          {loadingCourse ? (
            <div className="space-y-2">
              <Skeleton className="h-7 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          ) : course ? (
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                    <span className="text-xl">{cat?.emoji || '📄'}</span>
                    {course.title}
                  </h1>
                  <span className="px-2 py-0.5 text-xs font-medium bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 rounded-full whitespace-nowrap">
                    Mode Démo
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {cat?.label || course.subject} · PDF
                </p>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                className="rounded-xl gap-1.5 shrink-0" 
                onClick={handleChat}
              >
                <MessageSquare className="h-3.5 w-3.5" /> Chat IA
              </Button>
            </div>
          ) : null}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pdf" className="animate-fade-in" style={{ animationDelay: '0.05s' }}>
          <TabsList className="w-full grid grid-cols-2 h-11 rounded-xl bg-muted/60">
            <TabsTrigger 
              value="pdf" 
              className="rounded-lg gap-1.5 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <FileText className="h-3.5 w-3.5" /> PDF
            </TabsTrigger>
            <TabsTrigger 
              value="info" 
              className="rounded-lg gap-1.5 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <BookOpen className="h-3.5 w-3.5" /> Infos
            </TabsTrigger>
          </TabsList>

          {/* ── PDF VIEWER ── */}
          <TabsContent value="pdf" className="mt-4 space-y-4">
            <div className="glass-card overflow-hidden rounded-2xl">
              {loadingCourse ? (
                <Skeleton className="h-[500px] w-full" />
              ) : course ? (
                <PDFViewer courseId={course.id} title={course.title} />
              ) : null}
            </div>
          </TabsContent>

          {/* ── INFO TAB ── */}
          <TabsContent value="info" className="mt-4 space-y-4">
            {loadingCourse ? (
              <div className="space-y-4">
                <Skeleton className="h-24 w-full rounded-2xl" />
                <Skeleton className="h-32 w-full rounded-2xl" />
              </div>
            ) : course ? (
              <>
                <div className="glass-card p-5 space-y-3">
                  <h3 className="font-display font-bold text-foreground">À propos du cours</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Titre :</span>
                      <span className="font-medium">{course.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Matière :</span>
                      <span className="font-medium">{cat?.label || course.subject}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ajouté le :</span>
                      <span className="font-medium">
                        {new Date(course.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Mode :</span>
                      <span className="font-medium text-yellow-600 dark:text-yellow-400">Démonstration</span>
                    </div>
                  </div>
                </div>

                <div className="glass-card p-5 space-y-3">
                  <h3 className="font-display font-bold text-foreground text-sm">
                    🚧 Fonctionnalités à venir
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <span className="text-primary">•</span>
                      Extraction automatique du contenu
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-primary">•</span>
                      Résumés générés par IA
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-primary">•</span>
                      Fiches de révision
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-primary">•</span>
                      Quiz personnalisés
                    </li>
                  </ul>
                </div>

                <Button 
                  className="w-full btn-primary-gradient border-0 rounded-xl h-11 font-semibold gap-2" 
                  onClick={handleChat}
                >
                  <MessageSquare className="h-4 w-4" /> 
                  Discuter avec l'IA sur ce cours
                </Button>
              </>
            ) : null}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}