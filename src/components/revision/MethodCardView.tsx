// components/revision/MethodCardView.tsx
import { Button } from '@/components/ui/button';
import { Loader2, Download } from 'lucide-react';
import type { MethodCard } from '@/hooks/useRevision';

interface MethodCardViewProps {
  methodCard: MethodCard | null;
  loading: boolean;
  onDownload: () => void;
}

export function MethodCardView({ methodCard, loading, onDownload }: MethodCardViewProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Génération de la fiche méthode en cours...</p>
      </div>
    );
  }

  if (!methodCard) {
    return null;
  }

  return (
    <div className="space-y-6 p-6 bg-card rounded-xl border">
      {/* En-tête avec titre et bouton téléchargement */}
      <div className="flex justify-between items-center border-b pb-4">
        <h2 className="text-2xl font-bold text-foreground">{methodCard.title}</h2>
        <Button onClick={onDownload} variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          Télécharger
        </Button>
      </div>

      {/* Contexte */}
      <div className="bg-muted/30 p-4 rounded-lg border">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <span className="text-primary">📋</span> Contexte
        </h3>
        <p className="text-foreground/80">{methodCard.context}</p>
      </div>

      {/* Étapes */}
      <div>
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <span className="text-primary">📝</span> Étapes à suivre
        </h3>
        <div className="space-y-4">
          {methodCard.steps.map((step) => (
            <div key={step.stepNumber} className="border-l-4 border-primary pl-4 py-1">
              <div className="font-medium text-lg">
                {step.stepNumber}. {step.title}
              </div>
              <p className="text-muted-foreground mt-1">{step.description}</p>
              {step.warning && (
                <div className="mt-2 flex items-start gap-2 text-amber-600 bg-amber-50 p-2 rounded">
                  <span>⚠️</span>
                  <span className="text-sm">{step.warning}</span>
                </div>
              )}
              {step.formula && (
                <div className="mt-2 bg-primary/5 p-3 rounded-lg font-mono text-sm border border-primary/20">
                  <span className="text-primary">📐</span> {step.formula}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Exemples */}
      {methodCard.examples.length > 0 && (
        <div>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <span className="text-primary">✨</span> Exemples d'application
          </h3>
          <div className="space-y-4">
            {methodCard.examples.map((example, index) => (
              <div key={index} className="bg-card p-4 rounded-lg border hover:shadow-md transition-shadow">
                <div className="font-medium mb-2 flex items-start gap-2">
                  <span className="text-primary">📌</span>
                  <span>{example.problem}</span>
                </div>
                <div className="text-primary mb-2 pl-6 flex items-start gap-2">
                  <span className="text-green-600">✅</span>
                  <span className="font-medium">{example.solution}</span>
                </div>
                <div className="text-sm text-muted-foreground pl-6 flex items-start gap-2">
                  <span className="text-blue-600">💡</span>
                  <span>{example.explanation}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Astuces */}
      {methodCard.tips.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <span className="text-primary">💡</span> Astuces et conseils
          </h3>
          <ul className="space-y-2 bg-accent/10 p-4 rounded-lg">
            {methodCard.tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span className="text-sm">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Date de génération */}
      <div className="text-xs text-muted-foreground text-right border-t pt-4">
        Généré le {new Date(methodCard.generatedAt).toLocaleString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
      </div>
    </div>
  );
}