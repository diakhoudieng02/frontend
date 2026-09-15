// src/components/course/UploadModal.tsx
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, X, Loader2, BookOpen, GraduationCap } from 'lucide-react';
import { coursesService } from '@/services/courses.service';
import type { Course, DocumentType, ApiError } from '@/types/api';
import { useToast } from '@/hooks/use-toast';
import { useTracking } from '@/hooks/useTracking';
import { cn } from '@/lib/utils';

// ✅ Import centralisé
import { SUBJECTS, type CourseSubject } from '@/config/subjects.config';

interface UploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploaded: (course: Course) => void;
}

const DOCUMENT_TYPES: {
  value: DocumentType;
  label: string;
  description: string;
  icon: React.ReactNode;
  activeClass: string;
}[] = [
  {
    value: 'COURS',
    label: 'Cours',
    description: 'Résumé & flashcards',
    icon: <BookOpen className="h-4 w-4" />,
    activeClass: 'border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-200',
  },
  {
    value: 'EPREUVE',
    label: 'Épreuve',
    description: 'Corrigé interactif',
    icon: <GraduationCap className="h-4 w-4" />,
    activeClass: 'border-violet-500 bg-violet-50 text-violet-700 ring-2 ring-violet-200',
  },
];

const ACCEPTED = '.pdf';

export function UploadModal({ open, onOpenChange, onUploaded }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CourseSubject | ''>('');
  const [docType, setDocType] = useState<DocumentType>('COURS');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { trackAction } = useTracking();

  useEffect(() => { if (!open) reset(); }, [open]);

  const reset = () => {
    setFile(null);
    setTitle('');
    setCategory('');
    setDocType('COURS');
    setProgress(0);
    setError('');
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type !== 'application/pdf') { setError('Seuls les fichiers PDF sont acceptés'); return; }
    setFile(f);
    setError('');
    if (!title) setTitle(f.name.replace(/\.[^/.]+$/, ''));
  };

  const handleUpload = async () => {
    if (!file || !title.trim() || !category) return;
    setError('');
    setUploading(true);
    setProgress(10);
    try {
      const interval = setInterval(() => setProgress(p => Math.min(p + 15, 90)), 300);
      const course = await coursesService.upload(title.trim(), category as CourseSubject, file, docType);
      clearInterval(interval);
      setProgress(100);
      await trackAction('analyses', true);
      toast({ title: '✅ Document uploadé !', description: `"${course.title}" ajouté en tant que ${docType === 'COURS' ? 'cours' : 'épreuve'}` });
      onUploaded(course);
      setTimeout(() => onOpenChange(false), 700);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || "Erreur lors de l'upload");
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md rounded-2xl p-0 overflow-hidden">
        <div className="max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="font-display text-lg sm:text-xl">Uploader un document</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 sm:space-y-5 pt-2">
            {error && <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive break-words">{error}</p>}

            {/* Type de document */}
            <div className="space-y-2 w-full">
              <Label className="text-sm sm:text-base block">Type de document</Label>
              <div className="grid grid-cols-2 gap-2">
                {DOCUMENT_TYPES.map((dt) => (
                  <button key={dt.value} type="button" onClick={() => setDocType(dt.value)}
                    className={cn('flex flex-col items-start gap-1 rounded-xl border-2 p-3 text-left transition-all duration-200',
                      docType === dt.value ? dt.activeClass : 'border-border bg-background hover:border-muted-foreground/30 text-foreground')}>
                    <span className="flex items-center gap-1.5 font-semibold text-sm">{dt.icon}{dt.label}</span>
                    <span className="text-xs text-muted-foreground leading-tight">{dt.description}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Titre */}
            <div className="space-y-2 w-full">
              <Label htmlFor="course-title" className="text-sm sm:text-base block">Titre</Label>
              <Input id="course-title" className="w-full rounded-xl" value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder={docType === 'COURS' ? 'Ex: Suites numériques' : 'Ex: Bac Mathématiques 2024'} maxLength={100} />
            </div>

            {/* ✅ Matière — générée depuis SUBJECTS, rien à modifier ici */}
            <div className="space-y-2 w-full">
              <Label className="text-sm sm:text-base block">Matière</Label>
              <Select onValueChange={(v) => setCategory(v as CourseSubject)} value={category}>
                <SelectTrigger className="w-full rounded-xl">
                  <SelectValue placeholder="Choisir la matière" />
                </SelectTrigger>
                <SelectContent className="max-w-[90vw]">
                  {SUBJECTS.map(subject => (
                    <SelectItem key={subject.value} value={subject.value} className="text-sm py-2">
                      <span className="flex items-center gap-2">
                        <span className="text-base shrink-0">{subject.emoji}</span>
                        <span className="truncate">{subject.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Zone fichier */}
            {file ? (
              <div className="flex items-center gap-2 rounded-xl border bg-sage-blue-50 p-3 sm:p-4 w-full">
                <FileText className="h-5 w-5 shrink-0 text-primary" />
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{file.name}</span>
                <button onClick={() => { setFile(null); if (inputRef.current) inputRef.current.value = ''; }}
                  className="text-muted-foreground hover:text-destructive transition-colors p-1 shrink-0">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button onClick={() => inputRef.current?.click()} type="button"
                className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-primary/20 p-4 sm:p-6 text-muted-foreground transition-all hover:border-primary/50 hover:text-primary hover:bg-sage-blue-50">
                <Upload className="h-8 w-8 shrink-0" />
                <span className="text-sm font-medium text-center">Cliquez pour choisir un fichier</span>
                <span className="text-xs text-center">PDF uniquement (max 15 MB)</span>
              </button>
            )}

            <input ref={inputRef} type="file" accept={ACCEPTED} onChange={handleFile} className="hidden" />

            {uploading && <Progress value={progress} className="h-2 rounded-full w-full" />}

            <Button onClick={handleUpload} disabled={!file || !title.trim() || !category || uploading}
              className="w-full rounded-xl btn-primary-gradient border-0 relative overflow-hidden">
              <span className={cn('inline-flex items-center text-sm transition-opacity', uploading ? 'opacity-0' : 'opacity-100')}>
                Envoyer
              </span>
              {uploading && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-white" />
                </span>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}