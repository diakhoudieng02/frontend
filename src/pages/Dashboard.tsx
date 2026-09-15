// pages/Dashboard.tsx
import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { PassBadge } from "@/components/pass/PassBadge";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { SubjectCard } from "@/components/dashboard/SubjectCard";
import { DailyGoals } from "@/components/dashboard/DailyGoals";
import { CourseCard } from "@/components/dashboard/CourseCard";
import { StatsOverview } from "@/components/dashboard/StatsOverview";
import { ScoreEvolution } from "@/components/dashboard/ScoreEvolution";
import { ActivityStats } from "@/components/dashboard/ActivityStats";
import { ConceptProgress } from "@/components/dashboard/ConceptProgress";
import { UploadModal } from "@/components/course/UploadModal";
import { MultiImageScanner } from "@/components/course/MultiImageScanner";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { coursesService } from "@/services/courses.service";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useRevision } from "@/hooks/useRevision";
import { usePasses } from "@/hooks/usePasses";
import { useTracking } from '@/hooks/useTracking';
import { useExerciseStats } from '@/hooks/useExerciseStats';
import type { Course, PassTransaction, ApiError, CourseSubject } from "@/types";
import { BookOpen, Search, X, Camera, Upload, ChevronRight, MessageSquare } from "lucide-react";
import { cn } from '@/lib/utils';
import { ScoreEvolutionChart } from '@/components/dashboard/ScoreEvolutionChart';


const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

// Catégories alignées avec le type CourseSubject
const COURSE_CATEGORIES: { value: CourseSubject; label: string; emoji: string }[] = [
  { value: 'math', label: 'Mathématiques', emoji: '📐' },
  { value: 'Langues', label: 'Français', emoji: '📚' },
];

export default function Dashboard() {
  const getCourseRoute = (course: Course) =>
    course.type === 'EPREUVE' ? `/correction/${course.id}` : `/course/${course.id}`;
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // États locaux
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showScanModal, setShowScanModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Hooks
  const { 
    tasks, 
    results, 
    loadingTasks,
    toggleTask, 
    submitQuiz, 
    getProgressBySubject 
  } = useRevision();

  const { 
    balance, 
    loading: passesLoading, 
    refreshBalance,
    addTransaction,
  } = usePasses();

  const { stats: trackingStats, loadingStats, trackAction, formatTime } = useTracking();
  const { stats: exerciseStats, loading: exerciseStatsLoading } = useExerciseStats();

  // Données mockées pour les graphiques (fallback)
  const MOCK_WEEKLY = useMemo(() =>
    DAYS.map((day) => ({
      day,
      count: Math.floor(Math.random() * 5) + (day === "Dim" ? 2 : 0),
    })),
    []
  );

  // Chargement des données
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const coursesList = await coursesService.getMyCourses();
      
      // Filtrer les doublons
      const uniqueCourses = coursesList.filter((course, index, self) => 
        index === self.findIndex((c) => c.id === course.id)
      );
      
      setCourses(uniqueCourses);
      await refreshBalance();
      console.log('📚 Cours chargés:', uniqueCourses.length);
    } catch (err) {
      const apiError = err as ApiError;
      const msg = apiError.message || "Impossible de charger les données";
      setError(msg);
      toast({ 
        title: "Erreur de chargement", 
        description: msg, 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  }, [toast, refreshBalance]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Gestionnaires d'événements
  const handleScanSuccess = (courseId: string) => {
    fetchData();
    toast({
      title: "✅ Scan terminé",
      description: "Les photos ont été ajoutées à vos cours",
    });
  };

  const handleUploaded = (course: Course) => {
    setCourses((prev) => {
      // Éviter les doublons
      const exists = prev.some(c => c.id === course.id);
      if (exists) return prev;
      return [course, ...prev];
    });
    toast({
      title: "✅ Cours ajouté",
      description: `"${course.title}" a été importé avec succès`,
    });
    setShowUploadModal(false);
  };

  const handleQuickAction = (id: string) => {
    switch (id) {
      case "upload":
        setShowUploadModal(true);
        break;
      case "chat":
        navigate('/chat?new=true');
        break;
      case "courses":
        navigate('/courses');
        break;
      case "revisions":
        navigate('/revision');
        break;
      case "progress":
        navigate('/diagnostic');
        break;
      default:
        toast({ 
          title: "🚧 Bientôt disponible", 
          description: "Cette fonctionnalité arrive très prochainement !" 
        });
    }
  };

  const handlePurchase = (tx: PassTransaction) => {
    addTransaction(tx);
    toast({
      title: '✅ Achat réussi',
      description: `${tx.amount} passes ont été ajoutés à ton compte`,
    });
  };

  // Calcul des données pour l'affichage
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredCourses = courses.filter((c) => 
    !normalizedQuery || 
    c.title.toLowerCase().includes(normalizedQuery)
  );

  const categoryCounts = COURSE_CATEGORIES
    .map((cat) => ({
      ...cat,
      count: courses.filter((c) => c.subject === cat.value).length,
    }))
    .filter(cat => cat.count > 0);

  const readyCourses = courses.filter((c) => c.status === "ready").length;
  
  const totalTasksCompleted = tasks.filter((t) => t.completed).length;
  
  const quizAvgScore = results.length > 0
    ? Math.round(results.reduce((a, r) => a + (r.score / r.total) * 100, 0) / results.length)
    : 0;

  const today = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter(task => task.scheduledDate === today);
  const completedTodayTasks = todayTasks.filter(task => task.completed).length;

  const subjectProgress = getProgressBySubject();
  
  const firstName = user?.firstName || user?.phoneNumber || "Bienvenue";

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Background blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-[300px] sm:h-[500px] w-[300px] sm:w-[500px] rounded-full bg-purple-500/5 blur-3xl animate-pulse-slow" />
        <div
          className="absolute top-1/2 -left-40 h-[300px] sm:h-[400px] w-[300px] sm:w-[400px] rounded-full bg-pink-500/5 blur-3xl animate-pulse-slow"
          style={{ animationDelay: "2s" }}
        />
      </div>

    
      
      {/* Main Content */}
      <main className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="pt-5 md:pt-5 pb-20 md:pb-6 space-y-4 sm:space-y-6 lg:space-y-8">
          
          {/* Welcome + Pass */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="animate-fade-in w-full sm:w-auto">
              <h1 className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
                Salut {firstName} ! 👋
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                {courses.length > 0 
                  ? `Tu as ${courses.length} cours et ${tasks.length} révisions. Continue comme ça !` 
                  : "Prêt à réviser ? Commence par importer un cours."}
              </p>
            </div>
            <div className="w-full sm:w-auto sm:shrink-0">
              <PassBadge
                balance={balance}
                loading={passesLoading}
                onBuyClick={() => navigate('/pricing')}
                showProgress={true}
                maxPass={100}
              />
            </div>
          </div>

          {/* Boutons d'action rapide */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              onClick={() => setShowUploadModal(true)}
              className="gap-2 h-9 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-md hover:shadow-lg transition-all"
              size="sm"
            >
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">Importer</span>
            </Button>
            <Button
              onClick={() => setShowScanModal(true)}
              variant="outline"
              size="sm"
              className="gap-2 h-9 rounded-xl border-purple-500/30 hover:bg-purple-500/10 hover:text-purple-500 transition-all"
            >
              <Camera className="h-4 w-4" />
              <span className="hidden sm:inline">Scanner</span>
            </Button>
          </div>
          
          {/* Quick Actions */}
          <QuickActions onAction={handleQuickAction} />

         

          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            
            {/* Left column - Matières & Charts */}
            <div className="lg:col-span-1 space-y-4 sm:space-y-6">
              
              {/* Activity Stats */}
             <div className="glass-card p-4">
  <ActivityStats />
</div>
            
              
             

              {/* Matières Section */}
              {categoryCounts.length > 0 && (
                <section className="glass-card p-4">
                  <h2 className="flex items-center gap-2 font-display font-bold text-foreground mb-3 text-base sm:text-lg">
                    <BookOpen className="h-4 w-4 text-primary" />
                    Mes matières
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-1 gap-2 sm:gap-3">
                    {categoryCounts.map((cat) => (
                      <SubjectCard
                        key={cat.value}
                        category={cat}
                        count={cat.count}
                        onClick={() =>
                          toast({
                            title: cat.emoji + " " + cat.label,
                            description: `${cat.count} cours dans cette matière`,
                          })
                        }
                      />
                    ))}
                  </div>
                </section>
              )}

             {/* Recent Courses Section - Version compacte */}
 <section className="glass-card p-4">
  <div className="flex items-center justify-between mb-3">
    <h2 className="font-display font-bold text-foreground text-sm">
      Cours récents
    </h2>
    <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
      {courses.length}
    </span>
  </div>

  {/* Version simplifiée pour colonne étroite */}
  {!loading && filteredCourses.length > 0 ? (
    <div className="space-y-2">
      {filteredCourses.slice(0, 4).map((course) => (
        <div
          key={course.id}
          className="group relative w-full"
        >
          {/* Lien principal vers le cours */}
          <button
            onClick={() => navigate(getCourseRoute(course))}
            className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors text-left pr-10"
          >
            <BookOpen className="h-4 w-4 text-primary shrink-0" />
            <span className="text-xs font-medium truncate flex-1">
              {course.title}
            </span>
            <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
          </button>

          {/* Bouton Chat - apparaît au survol */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/chat?course=${course.id}`);
            }}
            aria-label={`Chat avec l'IA pour ${course.title}`}
            title="Chat avec l'IA"
            className={cn(
              // Positionnement
              'absolute right-2 top-1/2 -translate-y-1/2',
              // Taille & forme
              'flex h-6 w-6 items-center justify-center rounded-md',
              // Couleurs - invisible au repos
              'bg-transparent text-transparent',
              // Transitions
              'transition-all duration-200',
              // Apparaît au survol de la ligne
              'group-hover:bg-primary/10 group-hover:text-primary',
              // Feedback au survol direct
              'hover:!bg-primary hover:!text-white',
              // Focus
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50'
            )}
          >
            <MessageSquare className="h-3 w-3" aria-hidden="true" />
          </button>
        </div>
      ))}
      
      {filteredCourses.length > 4 && (
        <button
          onClick={() => navigate("/courses")}
          className="w-full text-center text-xs text-purple-500 hover:text-purple-600 py-1 mt-1"
        >
          Voir tous ({filteredCourses.length})
        </button>
      )}
    </div>
  ) : (
    <p className="text-xs text-muted-foreground text-center py-4">
      Aucun cours disponible
    </p>
  )}
</section>
            </div>

            {/* Right column - Objectifs & Cours */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              
              {/* Daily Goals */}
           <div className="glass-card p-4">
  <DailyGoals 
    todayTasks={todayTasks}
    completedTasks={completedTodayTasks}
    totalTasks={todayTasks.length}
  />
</div>
 {/* Score Evolution */}
             <div className="glass-card p-4">
  <ScoreEvolutionChart />
</div>
              
             

            </div>
          </div>
          
          {/* Footer stats */}
          {courses.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border/50 text-center">
              <p className="text-xs text-muted-foreground">
                📊 {readyCourses} cours prêts • {courses.length - readyCourses} en traitement
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <MultiImageScanner
        open={showScanModal}
        onOpenChange={setShowScanModal}
        onSuccess={handleScanSuccess}
      />

      <UploadModal
        open={showUploadModal}
        onOpenChange={setShowUploadModal}
        onUploaded={handleUploaded}
      />
    </div>
  );
}