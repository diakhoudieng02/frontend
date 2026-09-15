import { ArrowLeft, FileText, MoreVertical, Download, Trash2, Settings, Minimize2, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';

interface CourseHeaderProps {
  title: string;
  subject: string;
  category?: { emoji: string; label: string };
  status: 'processing' | 'ready' | 'error';
  hasSummary: boolean;
  focusMode: boolean;
  onBack: () => void;
  onToggleFocus: () => void;
  onDownloadPdf: () => void;
  onDeleteClick: () => void;
  onInfoClick?: () => void;
  pdfLoading?: boolean;
}

export function CourseHeader({
  title,
  subject,
  category,
  status,
  hasSummary,
  focusMode,
  onBack,
  onToggleFocus,
  onDownloadPdf,
  onDeleteClick,
  onInfoClick,
  pdfLoading
}: CourseHeaderProps) {
  return (
    <header className={cn(
      "sticky top-16 z-40 bg-background/95 backdrop-blur-lg border-b border-border",
      focusMode && "bg-background"
    )}>
      <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 sm:py-4">
        <button
          onClick={onBack}
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors shrink-0"
          aria-label="Retour"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
        </button>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-display font-semibold text-foreground truncate text-sm sm:text-base md:text-lg">
              {title}
            </h1>
            {status === 'processing' && (
              <span className="px-2 py-0.5 text-[10px] sm:text-xs font-medium bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-full animate-pulse whitespace-nowrap">
                Traitement...
              </span>
            )}
            {hasSummary && (
              <span className="px-2 py-0.5 text-[10px] sm:text-xs font-medium bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full whitespace-nowrap">
                Résumé
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground truncate">
            {category?.emoji} {category?.label || subject}
          </p>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={onDownloadPdf}
            className="hidden xs:inline-flex h-8 w-8 sm:h-10 sm:w-10"
            title="Télécharger le PDF"
            disabled={pdfLoading}
          >
            <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10">
                <MoreVertical className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onInfoClick}>
                <Settings className="h-4 w-4 mr-2" />
                Voir les infos
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDownloadPdf}>
                <Download className="h-4 w-4 mr-2" />
                Télécharger le PDF
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={onDeleteClick}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleFocus}
            className="hidden lg:inline-flex h-8 w-8 sm:h-10 sm:w-10"
            title={focusMode ? "Quitter le mode focus" : "Mode focus"}
          >
            {focusMode ? <Minimize2 className="h-4 w-4 sm:h-5 sm:w-5" /> : <Maximize2 className="h-4 w-4 sm:h-5 sm:w-5" />}
          </Button>
        </div>
      </div>
    </header>
  );
}