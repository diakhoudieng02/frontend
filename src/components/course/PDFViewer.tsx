// src/components/course/PDFViewer.tsx
import { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut,
  RotateCw,
  Download,
  Loader2,
  ArrowUp,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';

// Configuration du worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

interface PDFViewerProps {
  url: string;
  fileName: string;
  onDownload?: () => void;
}

export function PDFViewer({ url, fileName, onDownload }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showBottomNav, setShowBottomNav] = useState(false);
  
  const pageRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setLoading(false);
    console.log('✅ PDF chargé avec', numPages, 'pages');
  }

  function onDocumentLoadError(error: Error) {
    console.error('❌ Erreur chargement PDF:', error);
    setLoading(false);
  }

  const handlePreviousPage = () => {
    setPageNumber(prev => Math.max(1, prev - 1));
    // Scroll en haut de la page
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextPage = () => {
    setPageNumber(prev => Math.min(numPages || 1, prev + 1));
    // Scroll en haut de la page
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(2.5, prev + 0.25));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(0.5, prev - 0.25));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  // Détecter le scroll pour afficher les boutons en bas de page
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      // Afficher les boutons quand on est proche du bas (moins de 100px)
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;
      setShowBottomNav(isNearBottom);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const progress = numPages ? (pageNumber / numPages) * 100 : 0;

  return (
    <div className="flex flex-col h-full bg-muted/10 rounded-lg overflow-hidden">
      {/* Barre d'outils supérieure */}
      <div className="flex items-center justify-between p-2 bg-background border-b">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePreviousPage}
            disabled={pageNumber <= 1}
            className="h-8 w-8"
            title="Page précédente"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <span className="text-sm font-medium min-w-[100px] text-center">
            Page {pageNumber} / {numPages || '?'}
          </span>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNextPage}
            disabled={pageNumber >= (numPages || 1)}
            className="h-8 w-8"
            title="Page suivante"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomOut}
            disabled={scale <= 0.5}
            className="h-8 w-8"
            title="Zoom arrière"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          
          <span className="text-xs min-w-[60px] text-center">
            {Math.round(scale * 100)}%
          </span>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomIn}
            disabled={scale >= 2.5}
            className="h-8 w-8"
            title="Zoom avant"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRotate}
            className="h-8 w-8"
            title="Rotation"
          >
            <RotateCw className="h-4 w-4" />
          </Button>
          
          {onDownload && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onDownload}
              className="h-8 w-8"
              title="Télécharger"
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Barre de progression */}
      <div className="h-1 bg-muted">
        <motion.div 
          className="h-full bg-gradient-to-r from-primary to-accent"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Pourcentage */}
      <div className="px-3 py-1 text-right text-[10px] text-muted-foreground">
        Progression: {Math.round(progress)}%
      </div>

      {/* Zone de lecture avec scroll */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-auto p-4 flex flex-col items-center bg-muted/5 relative"
      >
        {loading && (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        
        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={<div className="text-center p-4">Chargement du PDF...</div>}
          error={<div className="text-center p-4 text-destructive">Erreur de chargement</div>}
        >
          {/* Page actuelle */}
          <div ref={pageRef} className="mb-8">
            <Page
              pageNumber={pageNumber}
              scale={scale}
              rotate={rotation}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              className="shadow-xl rounded-lg overflow-hidden mx-auto"
              loading={<div className="p-4">Chargement de la page...</div>}
            />
          </div>
        </Document>

        {/* ✅ BOUTONS DE NAVIGATION EN BAS DE PAGE (apparaissent au scroll) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: showBottomNav ? 1 : 0,
            y: showBottomNav ? 0 : 20,
          }}
          transition={{ duration: 0.3 }}
          className="sticky bottom-4 flex justify-center gap-3 z-10 pointer-events-none"
        >
          <div className="flex gap-2 bg-background/80 backdrop-blur-sm p-2 rounded-full shadow-lg border border-border pointer-events-auto">
            {/* Bouton précédent */}
            <Button
              variant="outline"
              size="icon"
              onClick={handlePreviousPage}
              disabled={pageNumber <= 1}
              className="rounded-full h-10 w-10"
              title="Page précédente"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>

            {/* Indicateur de page */}
            <div className="flex items-center px-3 text-sm font-medium">
              {pageNumber} / {numPages}
            </div>

            {/* Bouton suivant */}
            <Button
              variant="outline"
              size="icon"
              onClick={handleNextPage}
              disabled={pageNumber >= (numPages || 1)}
              className="rounded-full h-10 w-10"
              title="Page suivante"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>

        {/* Message de fin */}
        {pageNumber === numPages && numPages && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center p-8 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl border border-primary/20 my-8 w-full max-w-md"
          >
            <h3 className="font-display font-semibold text-lg mb-2">
              🎉 Félicitations !
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Vous avez terminé la lecture de ce document.
            </p>
            <Button
              variant="outline"
              onClick={() => setPageNumber(1)}
              className="gap-2"
            >
              <ArrowUp className="h-4 w-4" />
              Revenir au début
            </Button>
          </motion.div>
        )}
      </div>

      {/* Slider de navigation */}
      {numPages && numPages > 1 && (
        <div className="p-3 border-t bg-background">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground min-w-[40px]">
              {Math.round(progress)}%
            </span>
            <Slider
              value={[pageNumber]}
              onValueChange={(value) => setPageNumber(value[0])}
              max={numPages}
              min={1}
              step={1}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground">
              {pageNumber} / {numPages}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}