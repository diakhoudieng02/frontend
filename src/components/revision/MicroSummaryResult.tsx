import { motion } from 'framer-motion';
import { Sparkles, Clock, Copy, Check, ThumbsUp, ThumbsDown, Award, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MicroSummaryResultProps {
  microSummary: any;
  copied: boolean;
  feedback: 'correct' | 'incorrect' | null;
  onCopy: (text: string) => void;
  onValidate: (notion: string, isCorrect: boolean) => Promise<void>;
}

export function MicroSummaryResult({
  microSummary,
  copied,
  feedback,
  onCopy,
  onValidate
}: MicroSummaryResultProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-4"
    >
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="h-4 w-4 text-primary" />
                {microSummary.microSummary.notion}
              </CardTitle>
              <CardDescription className="text-xs">
                {microSummary.fromCache ? '📦 Depuis le cache' : '✨ Nouvelle génération'}
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-[10px]">
              <Clock className="h-3 w-3 mr-1" />
              {new Date(microSummary.microSummary.generatedAt).toLocaleTimeString()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Micro-synthèse */}
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
            <p className="text-sm text-foreground leading-relaxed">
              {microSummary.microSummary.microSummary}
            </p>
          </div>

          {/* Extraits du cours */}
          {microSummary.chunks.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold mb-2 flex items-center gap-1">
                <span>📚 Extraits du cours</span>
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {microSummary.chunks.map((chunk: any, index: number) => (
                  <div 
                    key={`chunk-${chunk.chunkId || index}`} 
                    className="p-2 bg-muted/50 rounded text-xs"
                  >
                    <p className="text-foreground/90 line-clamp-2">{chunk.content}</p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                      <span>Page {chunk.pageNumber}</span>
                      <span>•</span>
                      <span>Pertinence: {(chunk.relevanceScore * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex items-center gap-2 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCopy(microSummary.microSummary.microSummary)}
              className="h-8 px-2 text-xs gap-1"
            >
              {copied ? (
                <Check className="h-3 w-3 text-emerald-500" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
              Copier
            </Button>
            
            <div className="flex-1" />
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onValidate(microSummary.microSummary.notion, true)}
              className="h-8 px-2 text-xs gap-1 text-emerald-500"
            >
              <ThumbsUp className="h-3 w-3" />
              Maîtrisé
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onValidate(microSummary.microSummary.notion, false)}
              className="h-8 px-2 text-xs gap-1 text-amber-500"
            >
              <ThumbsDown className="h-3 w-3" />
              À revoir
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Feedback */}
      {feedback && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={cn(
            "p-3 rounded-lg text-center text-sm",
            feedback === 'correct' 
              ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-500" 
              : "bg-amber-500/10 border border-amber-500/20 text-amber-500"
          )}
        >
          {feedback === 'correct' ? (
            <div className="flex items-center justify-center gap-2">
              <Award className="h-4 w-4" />
              <span>Bravo ! Notion maîtrisée</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>Continue à réviser, tu y es presque !</span>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

MicroSummaryResult.Loading = function Loading() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex items-center justify-center p-8"
    >
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </motion.div>
  );
};