import { FileText, Sparkles, Award, AlertCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { CourseWithOutputs, CourseOutputs } from '@/types/api';

interface CourseInfoProps {
  course: CourseWithOutputs;
  category?: { emoji: string; label: string };
  courseStatus: 'processing' | 'ready' | 'error';
  summary: any | null;
  outputs: CourseOutputs | null;
  exercisesCount: number;
  flashcardsCount: number;
  onDeleteClick: () => void;
}

export function CourseInfo({
  course,
  category,
  courseStatus,
  summary,
  outputs,
  exercisesCount,
  flashcardsCount,
  onDeleteClick
}: CourseInfoProps) {
  return (
    <div className="space-y-4">
      {/* En-tête */}
      <div className="glass-card p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl">
            {category?.emoji || '📄'}
          </div>
          <div className="flex-1">
            <h2 className="font-display font-semibold text-lg text-foreground">
              {course.title}
            </h2>
            <p className="text-sm text-muted-foreground">
              {category?.label || course.subject}
            </p>
          </div>
        </div>
      </div>

      {/* Détails du cours */}
      <div className="glass-card p-5 space-y-4">
        <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          Détails du document
        </h3>
        
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center py-2 border-b border-border/50">
            <span className="text-muted-foreground">Titre</span>
            <span className="font-medium text-foreground">{course.title}</span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-border/50">
            <span className="text-muted-foreground">Matière</span>
            <span className="font-medium text-foreground">{category?.label || course.subject}</span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-border/50">
            <span className="text-muted-foreground">Date d'ajout</span>
            <span className="font-medium text-foreground">
              {new Date(course.createdAt).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </span>
          </div>
          
          <div className="flex justify-between items-center py-2">
            <span className="text-muted-foreground">Statut</span>
            <span className={cn(
              "px-2 py-0.5 rounded-full text-xs font-medium",
              courseStatus === 'ready' ? "bg-emerald-500/10 text-emerald-500" :
              courseStatus === 'processing' ? "bg-amber-500/10 text-amber-500" :
              "bg-destructive/10 text-destructive"
            )}>
              {courseStatus === 'ready' ? 'Prêt' :
               courseStatus === 'processing' ? 'Traitement en cours' :
               'Erreur'}
            </span>
          </div>
        </div>
      </div>

      {/* Métadonnées du résumé */}
      {summary?.metadata && (
        <div className="glass-card p-5 space-y-4">
          <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Informations de génération
          </h3>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-muted-foreground">Généré le</span>
              <span className="font-medium">
                {new Date(summary.metadata.generatedAt).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-muted-foreground">Modèle IA</span>
              <span className="font-medium">{summary.metadata.model}</span>
            </div>
            
            <div className="flex justify-between items-center py-2">
              <span className="text-muted-foreground">Niveau cible</span>
              <span className="font-medium">{summary.metadata.targetLevel}</span>
            </div>
          </div>
        </div>
      )}

      {/* Statistiques */}
      <div className="glass-card p-5 space-y-4">
        <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
          <Award className="h-4 w-4 text-primary" />
          Contenu généré
        </h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="text-center p-3 rounded-xl bg-primary/5">
            <div className="text-2xl font-bold text-primary">{flashcardsCount}</div>
            <div className="text-xs text-muted-foreground mt-1">Flashcards</div>
          </div>
          
          <div className="text-center p-3 rounded-xl bg-accent/5">
            <div className="text-2xl font-bold text-accent">{summary?.keyTakeaways?.length || outputs?.keyConcepts?.length || 0}</div>
            <div className="text-xs text-muted-foreground mt-1">Points clés</div>
          </div>
          
          <div className="text-center p-3 rounded-xl bg-emerald-500/5">
            <div className="text-2xl font-bold text-emerald-500">{summary?.suggestedTopics?.length || 0}</div>
            <div className="text-xs text-muted-foreground mt-1">Sujets</div>
          </div>
          
          <div className="text-center p-3 rounded-xl bg-amber-500/5">
            <div className="text-2xl font-bold text-amber-500">{exercisesCount}</div>
            <div className="text-xs text-muted-foreground mt-1">Exercices</div>
          </div>
        </div>
      </div>

      {/* Zone de danger */}
      <div className="glass-card p-5 space-y-4 border-destructive/20 bg-destructive/5">
        <h3 className="font-display font-semibold text-destructive flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          Zone de danger
        </h3>
        
        <p className="text-sm text-muted-foreground">
          Une fois supprimé, ce cours et tout son contenu seront définitivement effacés.
        </p>
        
        <Button
          variant="destructive"
          className="w-full gap-2"
          onClick={onDeleteClick}
        >
          <Trash2 className="h-4 w-4" />
          Supprimer ce cours
        </Button>
      </div>
    </div>
  );
}