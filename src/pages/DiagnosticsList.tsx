// pages/DiagnosticsList.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from "@/components/layout/Navbar";
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Stethoscope,
  Search,
  BookOpen,
  Trophy,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RefreshCw,
  Loader2,
  ChevronRight,
  GraduationCap,
  FileQuestion,
  BarChart3,
  PlayCircle,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { diagnosticService } from '@/services/diagnostic.service';
import type { CourseWithDiagnosticStatus } from '@/services/diagnostic.service';

export default function DiagnosticsListPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<CourseWithDiagnosticStatus[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    loadCoursesWithStatus();
  }, []);

  const loadCoursesWithStatus = async () => {
    setLoading(true);
    try {
      const coursesWithStatus = await diagnosticService.getAllCoursesWithDiagnosticStatus();
      setCourses(coursesWithStatus);
      
      const withDiagnostic = coursesWithStatus.filter(c => c.hasDiagnostic).length;
      toast({
        title: "✅ Chargement terminé",
        description: `${coursesWithStatus.length} cours chargés, ${withDiagnostic} avec diagnostic`,
      });
    } catch (error: any) {
      console.error('❌ Erreur chargement:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les cours",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCoursesWithStatus();
    setRefreshing(false);
  };

  const filteredCourses = courses.filter(course => {
    // Filtre par recherche
    const matchesSearch = course.courseName.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtre par onglet
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'available') return matchesSearch && course.hasDiagnostic;
    if (activeTab === 'unavailable') return matchesSearch && !course.hasDiagnostic;
    
    return matchesSearch;
  });

  const getScoreColor = (score?: number) => {
    if (!score) return 'text-gray-400';
    if (score >= 70) return 'text-green-600 dark:text-green-400';
    if (score >= 40) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBg = (score?: number) => {
    if (!score) return 'bg-gray-100 dark:bg-gray-800';
    if (score >= 70) return 'bg-green-100 dark:bg-green-900/30';
    if (score >= 40) return 'bg-amber-100 dark:bg-amber-900/30';
    return 'bg-red-100 dark:bg-red-900/30';
  };

  const getStatusBadge = (course: CourseWithDiagnosticStatus) => {
    if (course.hasDiagnostic) {
      return (
        <Badge className="bg-green-500 hover:bg-green-600">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Diagnostic disponible
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="text-muted-foreground">
          <FileQuestion className="h-3 w-3 mr-1" />
          Aucun diagnostic
        </Badge>
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={i} className="h-48 w-full rounded-xl" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
              <Stethoscope className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Diagnostics
              </h1>
              <p className="text-muted-foreground">
                {courses.filter(c => c.hasDiagnostic).length} cours avec diagnostic sur {courses.length} cours
              </p>
            </div>
          </div>
          
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total cours</p>
                <p className="text-2xl font-bold">{courses.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avec diagnostic</p>
                <p className="text-2xl font-bold">{courses.filter(c => c.hasDiagnostic).length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-800 dark:to-slate-800">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gray-500/20 flex items-center justify-center">
                <FileQuestion className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sans diagnostic</p>
                <p className="text-2xl font-bold">{courses.filter(c => !c.hasDiagnostic).length}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Recherche et filtres */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un cours..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">Tous ({courses.length})</TabsTrigger>
            <TabsTrigger value="available">Disponibles ({courses.filter(c => c.hasDiagnostic).length})</TabsTrigger>
            <TabsTrigger value="unavailable">Non disponibles ({courses.filter(c => !c.hasDiagnostic).length})</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Liste des cours */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <div className="h-24 w-24 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <Search className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Aucun cours trouvé</h3>
            <p className="text-muted-foreground">
              {searchTerm ? "Aucun résultat ne correspond à votre recherche" : "Aucun cours disponible"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <Card
                key={course.courseId}
                className={cn(
                  "group hover:shadow-lg transition-all duration-300 overflow-hidden",
                  course.hasDiagnostic ? "cursor-pointer" : "opacity-80"
                )}
                onClick={() => {
                  if (course.hasDiagnostic) {
                    navigate(`/diagnostic/${course.courseId}`);
                  } else {
                    navigate(`/course/${course.courseId}`);
                  }
                }}
              >
                <div className="p-6">
                  {/* En-tête */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                        {course.courseName}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {course.courseSubject}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          Niv. {course.courseLevel}
                        </Badge>
                      </div>
                      {getStatusBadge(course)}
                    </div>
                    
                    {course.hasDiagnostic && course.overallScore !== undefined && (
                      <div className={cn(
                        "h-16 w-16 rounded-full flex items-center justify-center font-bold text-lg",
                        getScoreBg(course.overallScore),
                        getScoreColor(course.overallScore)
                      )}>
                        {course.overallScore}%
                      </div>
                    )}
                  </div>

                  {/* Contenu selon disponibilité */}
                  {course.hasDiagnostic ? (
                    <>
                      {/* Stats du diagnostic */}
                      <div className="flex items-center justify-between text-sm mb-4">
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span>{course.strengthsCount || 0} point{course.strengthsCount !== 1 ? 's' : ''} fort{course.strengthsCount !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                          <span>{course.skillsToReviewCount || 0} à réviser</span>
                        </div>
                      </div>

                      {/* Date et action */}
                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {course.lastUpdated ? new Date(course.lastUpdated).toLocaleDateString('fr-FR') : 'Date inconnue'}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-blue-600 dark:text-blue-400">Voir le diagnostic</span>
                          <ChevronRight className="h-4 w-4 text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Message pour cours sans diagnostic */}
                      <div className="py-4 text-center text-muted-foreground">
                        <FileQuestion className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm mb-2">Aucun diagnostic disponible</p>
                        <p className="text-xs">Faites des exercices pour générer un diagnostic</p>
                      </div>

                      {/* Bouton pour aller au cours */}
                      <div className="pt-4 border-t border-border">
                        <Button 
                          variant="outline" 
                          className="w-full gap-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/course/${course.courseId}`);
                          }}
                        >
                          <PlayCircle className="h-4 w-4" />
                          Commencer les exercices
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}