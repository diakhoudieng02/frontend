import { SummaryView } from './SummaryView';
import { SummaryGenerator } from './SummaryGenerator';
import { KeyTakeaways } from './KeyTakeaways';
import { FlashcardCarousel } from '@/components/flashcards/FlashcardCarousel';
import { Brain, Target } from 'lucide-react';
import type { CourseWithOutputs, CourseOutputs, CourseSection } from '@/types/api';

interface SummaryTabProps {
  course: CourseWithOutputs;
  summary: any | null;
  outputs: CourseOutputs | null;
  courseStatus: 'processing' | 'ready' | 'error';
  generating: boolean;
  onGenerateSummary: () => void;
  flashcards: any[];
  onFlashcardMastered: (id: string) => void;
  navigationSections: CourseSection[];
}

export function SummaryTab({
  course,
  summary,
  outputs,
  courseStatus,
  generating,
  onGenerateSummary,
  flashcards,
  onFlashcardMastered,
  navigationSections
}: SummaryTabProps) {
  const hasSummary = !!(summary?.markdownBody || outputs?.summary);

  if (!hasSummary) {
    return (
      <SummaryGenerator
        status={courseStatus}
        generating={generating}
        onGenerate={onGenerateSummary}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 mt-4">
      {/* Zone 1 : Points clés */}
      <div className="lg:col-span-3 order-1 lg:order-1 space-y-4 sm:space-y-6">
        {(summary?.keyTakeaways && summary.keyTakeaways.length > 0) && (
          <div className="lg:sticky lg:top-40">
            <KeyTakeaways
              takeaways={summary.keyTakeaways}
              variant="cards"
            />
          </div>
        )}

        {!summary?.keyTakeaways && outputs?.keyConcepts && outputs.keyConcepts.length > 0 && (
          <div className="lg:sticky lg:top-40">
            <KeyTakeaways
              takeaways={outputs.keyConcepts.map((c: string) => ({ statement: c }))}
            />
          </div>
        )}
      </div>

      {/* Zone 2 : Résumé principal */}
      <div className="lg:col-span-6 order-2 lg:order-2">
        {summary?.markdownBody ? (
          <SummaryView content={summary.markdownBody} title={course.title} />
        ) : (
          typeof outputs?.summary === 'string' && (
            <SummaryView content={outputs.summary} title={course.title} />
          )
        )}
      </div>

      {/* Zone 3 : Flashcards */}
      <div className="lg:col-span-3 order-3 lg:order-3">
        <div className="lg:sticky lg:top-40 space-y-4">
          <h3 className="font-display font-semibold text-base sm:text-lg flex items-center gap-2">
            <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            Flashcards
          </h3>

          {flashcards.length > 0 ? (
            <div className="glass-card p-3 sm:p-4 rounded-xl">
              <FlashcardCarousel
                flashcards={flashcards}
                onMastered={onFlashcardMastered}
              />
            </div>
          ) : (
            <div className="glass-card p-4 sm:p-6 text-center">
              <p className="text-xs sm:text-sm text-muted-foreground">
                Aucune flashcard disponible
              </p>
            </div>
          )}

          {/* Sujets suggérés */}
          {summary?.suggestedTopics && summary.suggestedTopics.length > 0 && (
            <div className="mt-4 p-4 bg-accent/5 rounded-xl">
              <h4 className="text-xs font-semibold text-accent mb-2 flex items-center gap-1">
                <Target className="h-3 w-3" />
                Pour approfondir
              </h4>
              <div className="space-y-2">
                {summary.suggestedTopics.map((topic: any, index: number) => (
                  <div
                    key={`suggested-topic-${index}-${topic.title}`}
                    className="text-xs"
                  >
                    <span className="font-medium text-foreground">{topic.title}</span>
                    <p className="text-muted-foreground text-[10px]">{topic.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
