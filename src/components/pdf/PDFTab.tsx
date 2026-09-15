// components/pdf/PDFTab.tsx
import { FileText, Loader2, ImageIcon, AlertCircle } from 'lucide-react';
import { PDFViewer } from '@/components/course/PDFViewer';

interface PDFTabProps {
  pdfUrl: string;
  pdfLoading: boolean;
  pdfError?: string | null;
  courseTitle: string;
  isScanCourse?: boolean;
  onDownload: () => void;
}

export function PDFTab({ 
  pdfUrl, 
  pdfLoading, 
  pdfError,
  courseTitle, 
  isScanCourse,
  onDownload 
}: PDFTabProps) {
  return (
    <div className="glass-card overflow-hidden rounded-xl sm:rounded-2xl h-[85vh]">
      {pdfLoading ? (
        <div className="h-full flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : isScanCourse ? (
        <div className="h-full flex items-center justify-center">
          <div className="text-center max-w-md p-6">
            <ImageIcon className="h-16 w-16 text-primary/40 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Cours créé par scan</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Ce cours a été créé à partir de photos. Il n'y a pas de fichier PDF à afficher.
              Vous pouvez consulter le résumé et les exercices dans les autres onglets.
            </p>
            <div className="flex gap-2 justify-center text-xs text-muted-foreground">
              <span>📸 Photos scannées</span>
              <span>•</span>
              <span>📝 Texte extrait par OCR</span>
            </div>
          </div>
        </div>
      ) : pdfError ? (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-sm text-destructive mb-2">Erreur</p>
            <p className="text-sm text-muted-foreground">{pdfError}</p>
          </div>
        </div>
      ) : pdfUrl ? (
        <PDFViewer 
          url={pdfUrl} 
          fileName={courseTitle}
          onDownload={onDownload}
        />
      ) : (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              PDF non disponible
            </p>
          </div>
        </div>
      )}
    </div>
  );
}