// components/course/RevisionTab.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRevision } from '@/hooks/useRevision';
import { MethodCardView } from '@/components/revision/MethodCardView';
import { RevisionHistory } from '@/components/revision/RevisionHistory';
import { Loader2, Search, FileText, CheckCircle, XCircle } from 'lucide-react';

interface RevisionTabProps {
  courseId: string;
}

export function RevisionTab({ courseId }: RevisionTabProps) {
  const {
    searchNotion,
    setSearchNotion,
    microSummary,
    loadingMicroSummary,
    methodCard,
    loadingMethod,
    passage,
    setPassage,
    feedback,
    handleSearchMicroSummary,
    handleGenerateMethodCard,
    handleValidateNotion,
    handleCopyMicroSummary,
    handleDownloadMethodCard,
    microSummaryHistory,
    methodCardHistory,
    diagnosticHistory,
    loadMicroSummaryFromHistory,
    loadMethodCardFromHistory,
    clearHistory,
    removeHistoryItem,
  } = useRevision(courseId);

  const [activeTab, setActiveTab] = useState('micro');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="micro">Micro-synthèses</TabsTrigger>
            <TabsTrigger value="method">Fiches méthode</TabsTrigger>
          </TabsList>

          {/* Onglet Micro-synthèses */}
          <TabsContent value="micro" className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Rechercher une notion (ex: dérivées)"
                value={searchNotion}
                onChange={(e) => setSearchNotion(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearchMicroSummary(searchNotion)}
              />
              <Button 
                onClick={() => handleSearchMicroSummary(searchNotion)}
                disabled={loadingMicroSummary || !searchNotion.trim()}
              >
                {loadingMicroSummary ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>

            {microSummary && (
              <div className="space-y-4">
                <div className="bg-card p-6 rounded-xl border">
                  <h3 className="text-lg font-semibold mb-2">{microSummary.notion}</h3>
                  <p className="text-muted-foreground mb-4">{microSummary.microSummary}</p>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleCopyMicroSummary(microSummary.microSummary)}
                    >
                      Copier
                    </Button>
                    
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant={feedback === 'correct' ? 'default' : 'outline'}
                        className={feedback === 'correct' ? 'bg-green-600' : ''}
                        onClick={() => handleValidateNotion(microSummary.notion, true)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Maîtrisé
                      </Button>
                      <Button
                        size="sm"
                        variant={feedback === 'incorrect' ? 'default' : 'outline'}
                        className={feedback === 'incorrect' ? 'bg-red-600' : ''}
                        onClick={() => handleValidateNotion(microSummary.notion, false)}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        À revoir
                      </Button>
                    </div>
                  </div>
                </div>

                {microSummary.relatedChunks.length > 0 && (
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Extraits du cours :</h4>
                    {microSummary.relatedChunks.map((chunk) => (
                      <div key={chunk.chunkId} className="mb-3 p-3 bg-background rounded border">
                        <p className="text-sm">{chunk.content}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Page {chunk.pageNumber} • Pertinence: {Math.round(chunk.relevanceScore * 100)}%
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* Onglet Fiches méthode */}
          <TabsContent value="method" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Passage du cours à transformer en méthode
              </label>
              <Textarea
                placeholder="Collez ici un passage du cours que vous souhaitez transformer en méthode pas-à-pas..."
                value={passage}
                onChange={(e) => setPassage(e.target.value)}
                rows={6}
              />
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">
                  {passage.length}/50 caractères minimum
                </span>
                <Button
                  onClick={handleGenerateMethodCard}
                  disabled={loadingMethod || passage.length < 50}
                  className="gap-2"
                >
                  {loadingMethod ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Génération...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4" />
                      Générer la fiche méthode
                    </>
                  )}
                </Button>
              </div>
            </div>

            <MethodCardView
              methodCard={methodCard}
              loading={loadingMethod}
              onDownload={handleDownloadMethodCard}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Historique */}
      <div className="lg:col-span-1">
        <RevisionHistory
          microSummaries={microSummaryHistory}
          methodCards={methodCardHistory}
          diagnostics={diagnosticHistory}
          onLoadMicroSummary={loadMicroSummaryFromHistory}
          onLoadMethodCard={loadMethodCardFromHistory}
          onClearHistory={clearHistory}
          onRemoveItem={removeHistoryItem}
          onCopyMicroSummary={handleCopyMicroSummary}
          onDownloadMethodCard={() => {}}
        />
      </div>
    </div>
  );
}