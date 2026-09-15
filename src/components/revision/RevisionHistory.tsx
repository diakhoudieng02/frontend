// components/revision/RevisionHistory.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  History, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  BookOpen,
  FileText,
  Trash2,
  Copy,
  Download,
  X,
  AlertCircle,
  CheckCircle,
  TrendingUp
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { MicroSummaryHistoryItem, MethodCardHistoryItem, DiagnosticHistoryItem } from '@/hooks/useRevision';

interface RevisionHistoryProps {
  microSummaries: MicroSummaryHistoryItem[];
  methodCards: MethodCardHistoryItem[];
  diagnostics: DiagnosticHistoryItem[];
  onLoadMicroSummary: (item: MicroSummaryHistoryItem) => void;
  onLoadMethodCard: (item: MethodCardHistoryItem) => void;
  onClearHistory: () => void;
  onRemoveItem: (type: 'micro' | 'method' | 'diagnostic', id: string) => void;
  onCopyMicroSummary?: (text: string) => void;
  onDownloadMethodCard?: (item: MethodCardHistoryItem) => void;
}

export function RevisionHistory({
  microSummaries,
  methodCards,
  diagnostics,
  onLoadMicroSummary,
  onLoadMethodCard,
  onClearHistory,
  onRemoveItem,
  onCopyMicroSummary,
  onDownloadMethodCard
}: RevisionHistoryProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'micro' | 'method' | 'diagnostic'>('all');

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true,
        locale: fr 
      });
    } catch {
      return 'Date inconnue';
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleCopy = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCopyMicroSummary) {
      onCopyMicroSummary(text);
    }
  };

  const handleRemove = (type: 'micro' | 'method' | 'diagnostic', id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onRemoveItem(type, id);
  };

  const totalItems = microSummaries.length + methodCards.length + diagnostics.length;

  const filteredMicro = activeTab === 'all' ? microSummaries : 
                        activeTab === 'micro' ? microSummaries : [];
  const filteredMethod = activeTab === 'all' ? methodCards : 
                         activeTab === 'method' ? methodCards : [];
  const filteredDiagnostic = activeTab === 'all' ? diagnostics : 
                             activeTab === 'diagnostic' ? diagnostics : [];

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Historique</h3>
          {totalItems > 0 && (
            <Badge variant="secondary" className="ml-2">
              {totalItems}
            </Badge>
          )}
        </div>
        {totalItems > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearHistory}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Tout effacer
          </Button>
        )}
      </div>

      {/* Filtres */}
      <div className="flex gap-1 mb-4">
        <Button
          variant={activeTab === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('all')}
          className="flex-1"
        >
          Tout
        </Button>
        <Button
          variant={activeTab === 'micro' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('micro')}
          className="flex-1"
        >
          Micro
        </Button>
        <Button
          variant={activeTab === 'method' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('method')}
          className="flex-1"
        >
          Fiches
        </Button>
        <Button
          variant={activeTab === 'diagnostic' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('diagnostic')}
          className="flex-1"
        >
          Tests
        </Button>
      </div>

      <ScrollArea className="h-[500px] pr-4">
        {totalItems === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Aucun historique</p>
            <p className="text-xs mt-1">Générez des révisions pour commencer</p>
          </div>
        ) : (
          <div className="space-y-4">
            
            {/* Micro-synthèses */}
            {filteredMicro.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Micro-synthèses ({filteredMicro.length})
                </h4>
                <div className="space-y-2">
                  {filteredMicro.map((item) => (
                    <HistoryItem
                      key={item.id}
                      item={item}
                      type="micro"
                      expandedId={expandedId}
                      onToggle={toggleExpand}
                      onLoad={() => onLoadMicroSummary(item)}
                      onRemove={(e) => handleRemove('micro', item.id, e)}
                      onCopy={onCopyMicroSummary ? (e) => handleCopy(item.microSummary, e) : undefined}
                      formatDate={formatDate}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Séparateur */}
            {filteredMicro.length > 0 && filteredMethod.length > 0 && (
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
              </div>
            )}

            {/* Fiches méthode */}
            {filteredMethod.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Fiches méthode ({filteredMethod.length})
                </h4>
                <div className="space-y-2">
                  {filteredMethod.map((item) => (
                    <HistoryItem
                      key={item.id}
                      item={item}
                      type="method"
                      expandedId={expandedId}
                      onToggle={toggleExpand}
                      onLoad={() => onLoadMethodCard(item)}
                      onRemove={(e) => handleRemove('method', item.id, e)}
                      onDownload={onDownloadMethodCard ? () => onDownloadMethodCard(item) : undefined}
                      formatDate={formatDate}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Séparateur */}
            {filteredMethod.length > 0 && filteredDiagnostic.length > 0 && (
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
              </div>
            )}

            {/* Diagnostics */}
            {filteredDiagnostic.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Tests ({filteredDiagnostic.length})
                </h4>
                <div className="space-y-2">
                  {filteredDiagnostic.map((item) => (
                    <DiagnosticItem
                      key={item.id}
                      item={item}
                      expandedId={expandedId}
                      onToggle={toggleExpand}
                      onRemove={(e) => handleRemove('diagnostic', item.id, e)}
                      formatDate={formatDate}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>
    </Card>
  );
}

// Composant pour un élément d'historique (micro ou méthode)
function HistoryItem({ 
  item, 
  type, 
  expandedId, 
  onToggle, 
  onLoad, 
  onRemove, 
  onCopy, 
  onDownload,
  formatDate 
}: any) {
  const isExpanded = expandedId === item.id;
  
  return (
    <div className="border rounded-lg hover:bg-accent/50 transition-colors">
      <div className="p-3 cursor-pointer flex items-start justify-between" onClick={onLoad}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {type === 'micro' ? (
              <BookOpen className="h-4 w-4 text-primary shrink-0" />
            ) : (
              <FileText className="h-4 w-4 text-primary shrink-0" />
            )}
            <span className="font-medium truncate">
              {type === 'micro' ? item.notion : item.title}
            </span>
            {type === 'micro' && item.fromCache && (
              <Badge variant="outline" className="text-xs">Cache</Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{formatDate(item.generatedAt)}</span>
            {type === 'method' && (
              <>
                <span>•</span>
                <span>{item.steps.length} étapes</span>
              </>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-1 shrink-0">
          {onRemove && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={onRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={(e) => {
              e.stopPropagation();
              onToggle(item.id);
            }}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="px-3 pb-3 pt-1 border-t">
          <div className="bg-muted/30 p-3 rounded-lg">
            {type === 'micro' ? (
              // Contenu micro-synthèse
              <>
                <p className="text-sm whitespace-pre-wrap">{item.microSummary}</p>
                {item.relatedChunks && item.relatedChunks.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-medium mb-2">Extraits :</p>
                    {item.relatedChunks.slice(0, 2).map((chunk: any, idx: number) => (
                      <div key={idx} className="text-xs bg-background p-2 rounded mb-2">
                        <p className="line-clamp-2">{chunk.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              // Contenu fiche méthode
              <div className="space-y-3">
                <p className="text-sm">{item.context}</p>
                <div>
                  <p className="text-xs font-medium mb-1">Étapes :</p>
                  {item.steps.map((step: any) => (
                    <div key={step.stepNumber} className="text-xs mb-2">
                      <span className="font-medium">{step.stepNumber}. {step.title}</span>
                      <p className="text-muted-foreground">{step.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex justify-end gap-2 mt-2">
              {onCopy && (
                <Button variant="ghost" size="sm" className="h-8" onClick={onCopy}>
                  <Copy className="h-3 w-3 mr-1" />
                  Copier
                </Button>
              )}
              {onDownload && (
                <Button variant="ghost" size="sm" className="h-8" onClick={onDownload}>
                  <Download className="h-3 w-3 mr-1" />
                  Télécharger
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Composant pour un diagnostic
function DiagnosticItem({ item, expandedId, onToggle, onRemove, formatDate }: any) {
  const isExpanded = expandedId === item.id;
  
  return (
    <div className="border rounded-lg hover:bg-accent/50 transition-colors">
      <div className="p-3 flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {item.isCorrect ? (
              <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
            )}
            <span className="font-medium truncate">{item.notion}</span>
            <Badge variant={item.isCorrect ? "default" : "destructive"} className="text-xs">
              {item.isCorrect ? 'Maîtrisé' : 'À revoir'}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{formatDate(item.timestamp)}</span>
            <span>•</span>
            <span>Progression: {item.progressPercentage}%</span>
          </div>
        </div>
        
        <div className="flex items-center gap-1 shrink-0">
          {onRemove && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={onRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={(e) => {
              e.stopPropagation();
              onToggle(item.id);
            }}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="px-3 pb-3 pt-1 border-t">
          <div className="bg-muted/30 p-3 rounded-lg">
            <p className="text-xs mb-2">
              <span className="font-medium">Notion :</span> {item.notion}
            </p>
            <p className="text-xs mb-2">
              <span className="font-medium">Résultat :</span>{' '}
              {item.isCorrect ? '✅ Maîtrisé' : '📝 À revoir'}
            </p>
            <p className="text-xs mb-2">
              <span className="font-medium">Progression :</span> {item.progressPercentage}%
            </p>
            {item.remainingSkills.length > 0 && (
              <div>
                <p className="text-xs font-medium mb-1">Compétences restantes :</p>
                <ul className="list-disc list-inside">
                  {item.remainingSkills.map((skill: string, idx: number) => (
                    <li key={idx} className="text-xs">{skill}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}