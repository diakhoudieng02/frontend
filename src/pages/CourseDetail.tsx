// src/pages/CourseDetail.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Loader2, MessageCircle } from 'lucide-react';

// Hooks
import { useCourse }     from '@/hooks/useCourse';
import { useFlashcards } from '@/hooks/useFlashcards';
import { usePdf }        from '@/hooks/usePdf';

// Composants
import { CourseHeader }       from '@/components/course/CourseHeader';
import { CourseTabs }         from '@/components/course/CourseTabs';
import { CourseInfo }         from '@/components/course/CourseInfo';
import { CourseDeleteDialog } from '@/components/course/CourseDeleteDialog';
import { ErrorState }         from '@/components/course/ErrorState';
import { SummaryTab }         from '@/components/summary/SummaryTab';
import { RevisionTab }        from '@/components/revision/RevisionTab';
import { ExercisesTab }       from '@/components/exercises/ExercisesTab';
import { FlashcardsTab }      from '@/components/flashcards/FlashcardsTab';
import { PDFTab }             from '@/components/pdf/PDFTab';
import { Button }             from '@/components/ui/button';

// Constantes
import { COURSE_CATEGORIES } from '@/types/course.types';

// Onglets valides — utilisés pour valider le paramètre URL ?tab=
const VALID_TABS = ['summary', 'revision', 'exercises', 'flashcards', 'chat', 'pdf', 'info'] as const;
type TabValue = typeof VALID_TABS[number];

function isValidTab(value: string | null): value is TabValue {
  return VALID_TABS.includes(value as TabValue);
}

export default function CourseDetail() {
  const { id }                    = useParams<{ id: string }>();
  const navigate                  = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // ✅ Lire l'onglet depuis l'URL (?tab=chat) — fallback sur 'summary'
  const tabFromUrl = searchParams.get('tab');
  const initialTab: TabValue = isValidTab(tabFromUrl) ? tabFromUrl : 'summary';

  const [activeTab,        setActiveTab]        = useState<TabValue>(initialTab);
  const [focusMode,        setFocusMode]        = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // ✅ Synchroniser l'onglet actif avec l'URL quand elle change (ex: retour navigateur)
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (isValidTab(tab) && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // ✅ Mettre à jour l'URL quand l'onglet change (via les boutons internes)
  const handleTabChange = (tab: string) => {
    if (!isValidTab(tab)) return;
    setActiveTab(tab);
    // Mettre à jour le paramètre ?tab= sans recharger la page
    setSearchParams(tab === 'summary' ? {} : { tab }, { replace: true });
  };

  // Hooks personnalisés
  const {
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
  } = useCourse(id);

  const { flashcards, handleFlashcardMastered } = useFlashcards(id, summary, outputs);
  const { pdfUrl, pdfLoading, pdfError, isScanCourse, handleDownloadPdf } = usePdf(course);

  // ✅ Navigue vers l'onglet chat EN INTERNE — plus de redirection externe
  const handleOpenChat = () => {
    handleTabChange('chat');
  };

  // Gestionnaires d'événements
  const handleBack = () => {
    if (focusMode) {
      setFocusMode(false);
    } else {
      navigate(-1);
    }
  };

  const handleInfoClick = () => handleTabChange('info');

  // ── États de chargement ──────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center px-4">
          <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-primary mx-auto mb-3 sm:mb-4" />
          <p className="text-sm sm:text-base text-muted-foreground">Chargement du cours…</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <ErrorState error={error} onBack={() => navigate('/courses')} />
      </div>
    );
  }

  const category = COURSE_CATEGORIES.find(c => c.value === course.subject);

  return (
    <div className="min-h-screen bg-background">
      {/* Background blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-[300px] sm:h-[500px] w-[300px] sm:w-[500px] rounded-full bg-primary/5 blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 -left-40 h-[300px] sm:h-[400px] w-[300px] sm:w-[400px] rounded-full bg-accent/5 blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      <div className={`flex flex-col relative z-10 ${focusMode ? 'fixed inset-0 z-50 bg-background' : ''}`}>
        <CourseHeader
          title={course.title}
          subject={course.subject}
          category={category}
          status={courseStatus}
          hasSummary={!!(summary?.markdownBody || outputs?.summary)}
          focusMode={focusMode}
          onBack={handleBack}
          onToggleFocus={() => setFocusMode(!focusMode)}
          onDownloadPdf={handleDownloadPdf}
          onDeleteClick={() => setShowDeleteDialog(true)}
          onInfoClick={handleInfoClick}
          pdfLoading={pdfLoading}
        />

        <CourseTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          exercisesCount={outputs?.exercises?.length || 0}
          flashcardsCount={flashcards.length}
          courseId={course.id}
        />

        <main className="flex-1">
          <div className={focusMode ? 'p-0' : 'container mx-auto px-3 sm:px-4 pt-6 sm:pt-8 pb-20 sm:pb-6'}>
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">

              {/* ── Résumé ── */}
              <TabsContent value="summary" className="mt-0">
                <SummaryTab
                  course={course}
                  summary={summary}
                  outputs={outputs}
                  courseStatus={courseStatus}
                  generating={generating}
                  onGenerateSummary={handleGenerateSummary}
                  flashcards={flashcards}
                  onFlashcardMastered={handleFlashcardMastered}
                  navigationSections={navigationSections}
                />
              </TabsContent>

              {/* ── Révision ── */}
              <TabsContent value="revision" className="mt-0">
                <RevisionTab courseId={id!} outputs={outputs} />
              </TabsContent>

              {/* ── Exercices ── */}
              <TabsContent value="exercises" className="mt-0">
                <ExercisesTab courseId={id!} />
              </TabsContent>

              {/* ── Flashcards ── */}
              <TabsContent value="flashcards" className="mt-0">
                <FlashcardsTab
                  flashcards={flashcards}
                  courseStatus={courseStatus}
                  hasSummary={!!(summary?.markdownBody || outputs?.summary)}
                  onGenerateSummary={handleGenerateSummary}
                  generating={generating}
                  onFlashcardMastered={handleFlashcardMastered}
                />
              </TabsContent>

              {/* ── Chat — bouton direct vers /chat?course=:id ── */}
              <TabsContent value="chat" className="mt-0">
                <div className="flex flex-col items-center justify-center h-[calc(100vh-250px)] sm:h-[calc(100vh-200px)]">
                  <div className="text-center max-w-md p-6">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                      <MessageCircle className="h-10 w-10 text-primary" aria-hidden="true" />
                    </div>
                    <h2 className="font-display font-semibold text-xl mb-3">
                      Discuter avec l'IA
                    </h2>
                    <p className="text-muted-foreground mb-6">
                      Posez des questions sur ce cours et obtenez des réponses basées uniquement sur son contenu.
                    </p>
                    {/* ✅ Navigation directe avec le vrai ID du cours */}
                    <Button
                      size="lg"
                      className="gap-2 px-6"
                      onClick={() => navigate(`/chat?course=${course.id}`)}
                    >
                      <MessageCircle className="h-5 w-5" aria-hidden="true" />
                      Commencer à discuter avec l'IA
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* ── PDF ── */}
              <TabsContent value="pdf" className="mt-0">
                <PDFTab
                  pdfUrl={pdfUrl}
                  pdfLoading={pdfLoading}
                  pdfError={pdfError}
                  courseTitle={course.title}
                  isScanCourse={isScanCourse}
                  onDownload={handleDownloadPdf}
                />
              </TabsContent>

              {/* ── Info ── */}
              <TabsContent value="info" className="mt-0">
                <CourseInfo
                  course={course}
                  category={category}
                  courseStatus={courseStatus}
                  summary={summary}
                  outputs={outputs}
                  exercisesCount={outputs?.exercises?.length || 0}
                  flashcardsCount={flashcards.length}
                  onDeleteClick={() => setShowDeleteDialog(true)}
                />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      <CourseDeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        course={course}
        onConfirm={handleDeleteCourse}
        exercisesCount={outputs?.exercises?.length || 0}
        flashcardsCount={flashcards.length}
        quizCount={outputs?.quiz?.length || 0}
      />
    </div>
  );
}