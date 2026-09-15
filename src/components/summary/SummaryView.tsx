// components/summary/SummaryView.tsx
import { useRef } from 'react';
import { BookOpen, Copy, Download, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { useToast } from '@/hooks/use-toast';
import 'katex/dist/katex.min.css';

interface SummaryViewProps {
  content: string;
  title: string;
}

export function SummaryView({ content, title }: SummaryViewProps) {
  const { toast } = useToast();
  const summaryRef = useRef<HTMLDivElement>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: 'Copié !',
        description: 'Le résumé a été copié dans le presse-papiers',
      });
    } catch (err) {
      toast({
        title: 'Erreur',
        description: 'Impossible de copier le contenu',
        variant: 'destructive',
      });
    }
  };

  const handleDownload = () => {
    if (!content || content.trim() === '') {
      toast({
        title: 'Erreur',
        description: 'Le contenu à télécharger est vide',
        variant: 'destructive',
      });
      return;
    }

    const sanitizedTitle = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const fileName = `${sanitizedTitle || 'resume'}.md`;
    
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.style.display = 'none';
    
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);

    toast({
      title: 'Téléchargé !',
      description: `"${fileName}" sauvegardé`,
    });
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex flex-col xs:flex-row xs:items-center justify-between sticky top-0 bg-background/95 backdrop-blur-sm py-2 z-10 gap-2">
        <h2 className="font-display font-semibold text-base sm:text-lg flex items-center gap-2">
          <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          Résumé du cours
        </h2>
        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="gap-1 sm:gap-1.5 h-8 sm:h-9 px-2 sm:px-3"
          >
            <Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline text-xs sm:text-sm">Copier</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            className="gap-1 sm:gap-1.5 h-8 sm:h-9 px-2 sm:px-3"
          >
            <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline text-xs sm:text-sm">Télécharger</span>
          </Button>
        </div>
      </div>

      <div 
        ref={summaryRef}
        className="prose prose-sm dark:prose-invert max-w-none 
          prose-headings:font-display prose-headings:text-foreground 
          prose-h1:text-xl sm:prose-h1:text-2xl prose-h1:font-bold prose-h1:mb-3 sm:prose-h1:mb-4
          prose-h2:text-lg sm:prose-h2:text-xl prose-h2:font-semibold prose-h2:mb-2 sm:prose-h2:mb-3
          prose-h3:text-base sm:prose-h3:text-lg prose-h3:font-medium prose-h3:mb-1 sm:prose-h3:mb-2
          prose-p:text-sm sm:prose-p:text-base prose-p:text-foreground/90 prose-p:leading-relaxed
          prose-strong:text-foreground prose-strong:font-semibold
          prose-ul:my-2 prose-li:my-0.5 prose-li:text-sm sm:prose-li:text-base
          prose-code:text-primary prose-code:bg-muted/50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs sm:prose-code:text-sm
          prose-blockquote:border-l-4 prose-blockquote:border-primary/30 prose-blockquote:pl-3 sm:prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-sm sm:prose-blockquote:text-base
          prose-img:rounded-xl prose-img:shadow-md prose-img:max-w-full
          prose-table:border-collapse prose-table:border prose-table:border-border
          prose-th:bg-muted/50 prose-th:p-2 prose-th:text-left
          prose-td:p-2 prose-td:border prose-td:border-border
          
          /* Styles spécifiques pour KaTeX */
          .katex { 
            font-size: 1.1em;
            color: hsl(var(--primary));
          }
          .katex-display {
            margin: 1.5rem 0;
            overflow-x: auto;
            overflow-y: hidden;
            padding: 0.5rem 0;
            background: hsl(var(--muted) / 0.3);
            border-radius: 0.5rem;
          }
          .katex-display > .katex {
            display: inline-block;
            white-space: nowrap;
            max-width: 100%;
          }
          .katex-error {
            color: hsl(var(--destructive));
            background: hsl(var(--destructive) / 0.1);
            padding: 0.2rem 0.4rem;
            border-radius: 0.25rem;
            font-family: monospace;
          }
          
          /* Support des accents français */
          .latex-french {
            font-style: normal;
          }"
      >
        <ReactMarkdown 
          remarkPlugins={[remarkMath]} 
          rehypePlugins={[rehypeKatex]}
          components={{
            // Gestion personnalisée des erreurs LaTeX
            span: ({ node, className, children, ...props }) => {
              if (className?.includes('katex-error')) {
                return (
                  <span className="inline-flex items-center gap-1 text-destructive" {...props}>
                    <AlertCircle className="h-3 w-3" />
                    <span className="font-mono text-xs">{children}</span>
                  </span>
                );
              }
              return <span className={className} {...props}>{children}</span>;
            },
            // Support des paragraphes avec contenu mixte
            p: ({ children }) => {
              return <p className="mb-2 last:mb-0">{children}</p>;
            }
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}