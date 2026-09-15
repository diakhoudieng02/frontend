import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  FileText, 
  Image, 
  Loader2, 
  CheckCircle2,
  Sparkles,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

type UploadState = 'idle' | 'uploading' | 'analyzing' | 'complete' | 'error';

interface UploadZoneProps {
  onUploadComplete?: (file: File) => void;
}

export function UploadZone({ onUploadComplete }: UploadZoneProps) {
  const [state, setState] = useState<UploadState>('idle');
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState('');

  const simulateUpload = useCallback(async (file: File) => {
    setFileName(file.name);
    setState('uploading');
    
    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      setProgress(i);
    }
    
    setState('analyzing');
    setProgress(0);
    
    // Simulate AI analysis
    for (let i = 0; i <= 100; i += 5) {
      await new Promise(resolve => setTimeout(resolve, 80));
      setProgress(i);
    }
    
    setState('complete');
    onUploadComplete?.(file);
  }, [onUploadComplete]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'application/pdf' || file.type.startsWith('image/'))) {
      simulateUpload(file);
    }
  }, [simulateUpload]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      simulateUpload(file);
    }
  }, [simulateUpload]);

  const reset = () => {
    setState('idle');
    setProgress(0);
    setFileName('');
  };

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {state === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <label
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`
                block cursor-pointer rounded-3xl border-2 border-dashed p-8 transition-all
                ${dragOver 
                  ? 'border-primary bg-primary/5 scale-[1.02]' 
                  : 'border-border bg-muted/50 hover:border-primary/50 hover:bg-muted'
                }
              `}
            >
              <input
                type="file"
                accept=".pdf,image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <div className="flex flex-col items-center gap-4">
                <motion.div
                  animate={dragOver ? { scale: 1.1, y: -5 } : { scale: 1, y: 0 }}
                  className="w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center"
                >
                  <Upload className="w-10 h-10 text-primary" />
                </motion.div>
                
                <div className="text-center">
                  <p className="font-semibold text-foreground text-lg">
                    Dépose ton cours ici
                  </p>
                  <p className="text-muted-foreground mt-1">
                    PDF ou photo • Max 10 Mo
                  </p>
                </div>

                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <FileText className="w-4 h-4" />
                    PDF
                  </div>
                  <span className="text-muted-foreground">•</span>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Image className="w-4 h-4" />
                    Images
                  </div>
                </div>
              </div>
            </label>
          </motion.div>
        )}

        {(state === 'uploading' || state === 'analyzing') && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="card-elevated rounded-3xl p-8"
          >
            <div className="flex flex-col items-center gap-6">
              <div className="relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="w-20 h-20 rounded-full border-4 border-primary/20"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  {state === 'uploading' ? (
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  ) : (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <Sparkles className="w-8 h-8 text-accent" />
                    </motion.div>
                  )}
                </div>
              </div>

              <div className="text-center">
                <p className="font-semibold text-foreground text-lg">
                  {state === 'uploading' ? 'Upload en cours...' : 'IA en analyse...'}
                </p>
                <p className="text-muted-foreground text-sm mt-1 truncate max-w-[200px]">
                  {fileName}
                </p>
              </div>

              <div className="w-full max-w-xs">
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-muted-foreground text-center mt-2">
                  {progress}%
                </p>
              </div>

              {state === 'analyzing' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-wrap justify-center gap-2"
                >
                  {['Extraction du texte...', 'Analyse des concepts...', 'Création du sommaire...'].map((step, i) => (
                    <motion.span
                      key={step}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: progress > (i + 1) * 30 ? 1 : 0.5, y: 0 }}
                      transition={{ delay: i * 0.2 }}
                      className="text-xs bg-muted px-3 py-1 rounded-full text-muted-foreground"
                    >
                      {step}
                    </motion.span>
                  ))}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {state === 'complete' && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="card-elevated rounded-3xl p-8"
          >
            <div className="flex flex-col items-center gap-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', bounce: 0.5 }}
                className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center"
              >
                <CheckCircle2 className="w-10 h-10 text-accent" />
              </motion.div>

              <div className="text-center">
                <p className="font-semibold text-foreground text-lg">
                  Cours analysé ! 🎉
                </p>
                <p className="text-muted-foreground text-sm mt-1">
                  Ton assistant est prêt
                </p>
              </div>

              <Button
                onClick={reset}
                variant="outline"
                size="sm"
                className="mt-2"
              >
                <X className="w-4 h-4 mr-2" />
                Ajouter un autre cours
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
