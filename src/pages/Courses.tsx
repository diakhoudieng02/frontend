// src/pages/Courses.tsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import { CourseCard } from '@/components/dashboard/CourseCard';
import { UploadModal } from '@/components/course/UploadModal';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import type { Course, ApiError } from '@/types/api';
import { PassBadge } from "@/components/pass/PassBadge";
import { usePasses } from "@/hooks/usePasses";
import {
  BookOpen, Search, X, Filter, Upload, Camera, ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { coursesService } from '@/services/courses.service';
import { CameraCapture } from '@/components/course/CameraCapture';
import { motion, AnimatePresence } from 'framer-motion';
import { MultiImageScanner } from '@/components/course/MultiImageScanner';
import { UPLOAD_LIMITS, validateFileSize, validateFiles, extractErrorMessage } from '@/services/api';

// ✅ Import centralisé — plus de liste en dur ici
import { SUBJECTS, type CourseSubject } from '@/config/subjects.config';

type CourseFilter = CourseSubject | 'all';
type SubjectType = CourseSubject;

const INITIAL_DISPLAY = 12;
const LOAD_MORE_COUNT  = 12;

const getBase64Size = (base64: string): number => {
  const len = base64.length - 'data:image/jpeg;base64,'.length;
  return (4 * Math.ceil(len / 3) * 0.5624896334383812) / (1024 * 1024);
};
const getFileSizeMB = (file: File): number => file.size / (1024 * 1024);
const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.readAsDataURL(file);
    r.onload  = () => resolve(r.result as string);
    r.onerror = reject;
  });

export default function Courses() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [courses,           setCourses]           = useState<Course[]>([]);
  const [loading,           setLoading]           = useState(true);
  const [error,             setError]             = useState('');
  const [searchQuery,       setSearchQuery]       = useState('');
  const [activeFilter,      setActiveFilter]      = useState<CourseFilter>('all');
  const [showUploadModal,   setShowUploadModal]   = useState(false);
  const [showCourseForm,    setShowCourseForm]    = useState(false);
  const [showCameraCapture, setShowCameraCapture] = useState(false);
  const [capturedImages,    setCapturedImages]    = useState<string[]>([]);
  const [imageSizes,        setImageSizes]        = useState<number[]>([]);
  const [showScanModal,     setShowScanModal]     = useState(false);
  const [displayCount,      setDisplayCount]      = useState(INITIAL_DISPLAY);
  const [formData,          setFormData]          = useState({ title: '', subject: SUBJECTS[0].value as SubjectType });
  const [uploading,         setUploading]         = useState(false);

  const { balance, loading: passesLoading } = usePasses();

  const maxImages  = UPLOAD_LIMITS.MAX_FILES;
  const maxTotalMB = UPLOAD_LIMITS.MAX_SIZE_MB;
  const totalSize  = imageSizes.reduce((acc, s) => acc + s, 0);
  const imagesLeft = maxImages - capturedImages.length;
  const sizeLeft   = maxTotalMB - totalSize;

  const handleCameraCapture = (image: string) => {
    const imgMB = getBase64Size(image);
    if (capturedImages.length >= maxImages) {
      toast({ title: "Limite atteinte", description: `Maximum ${maxImages} photos.`, variant: "destructive" });
      setShowCameraCapture(false);
      setTimeout(() => setShowCourseForm(true), 100);
      return;
    }
    if (totalSize + imgMB > maxTotalMB) {
      toast({ title: "Taille dépassée", description: `Espace restant : ${sizeLeft.toFixed(1)} Mo.`, variant: "destructive" });
      setShowCameraCapture(false);
      setTimeout(() => setShowCourseForm(true), 100);
      return;
    }
    setCapturedImages(prev => [...prev, image]);
    setImageSizes(prev => [...prev, imgMB]);
    setShowCameraCapture(false);
    setTimeout(() => setShowCourseForm(true), 100);
  };

  const handleCancelCamera = () => {
    setShowCameraCapture(false);
    setTimeout(() => setShowCourseForm(true), 100);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    if (capturedImages.length >= maxImages) {
      toast({ title: "Limite atteinte", description: `Vous avez déjà ${maxImages} photos.`, variant: "destructive" });
      resetFileInput();
      return;
    }
    const filesToProcess = files.slice(0, imagesLeft);
    if (files.length > imagesLeft)
      toast({ title: "Trop de fichiers", description: `Seulement ${imagesLeft} fichier(s) traités.` });

    const validationError = validateFiles(filesToProcess);
    if (validationError) {
      toast({ title: "Fichier(s) refusé(s)", description: validationError, variant: "destructive" });
      resetFileInput();
      return;
    }
    const addedMB = filesToProcess.reduce((sum, f) => sum + getFileSizeMB(f), 0);
    if (totalSize + addedMB > maxTotalMB) {
      toast({ title: "Taille totale dépassée", description: `Espace restant : ${sizeLeft.toFixed(1)} Mo.`, variant: "destructive" });
      resetFileInput();
      return;
    }
    try {
      const newImages: string[] = [];
      const newSizes: number[] = [];
      for (const file of filesToProcess) {
        if (capturedImages.length + newImages.length >= maxImages) break;
        newImages.push(await fileToBase64(file));
        newSizes.push(getFileSizeMB(file));
      }
      setCapturedImages(prev => [...prev, ...newImages]);
      setImageSizes(prev => [...prev, ...newSizes]);
      toast({ title: "Images ajoutées", description: `${newImages.length} image(s) ajoutée(s).` });
    } catch {
      toast({ title: "Erreur de lecture", description: "Impossible de lire les fichiers.", variant: "destructive" });
    } finally {
      resetFileInput();
    }
  };

  const resetFileInput = () => { if (fileInputRef.current) fileInputRef.current.value = ''; };

  const removeImage = (index: number) => {
    setCapturedImages(prev => prev.filter((_, i) => i !== index));
    setImageSizes(prev => prev.filter((_, i) => i !== index));
  };

  const handleCloseForm = () => {
    setShowCourseForm(false);
    setCapturedImages([]);
    setImageSizes([]);
    setFormData({ title: '', subject: SUBJECTS[0].value });
  };

  const handleSubmitCourse = async () => {
    if (!formData.title.trim()) {
      toast({ title: "Titre requis", variant: "destructive" }); return;
    }
    if (!capturedImages.length) {
      toast({ title: "Image requise", variant: "destructive" }); return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('title', formData.title);
      fd.append('subject', formData.subject);
      for (let i = 0; i < capturedImages.length; i++) {
        const blob = await fetch(capturedImages[i]).then(r => r.blob());
        const blobFile = new File([blob], `capture-${i}.jpg`, { type: 'image/jpeg' });
        const sizeErr = validateFileSize(blobFile);
        if (sizeErr) { toast({ title: "Fichier trop lourd", description: sizeErr, variant: "destructive" }); return; }
        fd.append('files', blob, `capture-${i}.jpg`);
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({ title: "Cours créé !", description: `"${formData.title}" créé.` });
      handleCloseForm();
      fetchCourses();
    } catch (err: unknown) {
      toast({ title: "Erreur", description: extractErrorMessage(err), variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError('');
    setDisplayCount(INITIAL_DISPLAY);
    try {
      const list = await coursesService.getMyCourses();
      const map = new Map<string, Course>();
      list.forEach(c => { if (!map.has(c.id)) map.set(c.id, c); });
      setCourses(Array.from(map.values()));
    } catch (err: unknown) {
      const msg = extractErrorMessage(err);
      setError(msg);
      toast({ title: 'Erreur de chargement', description: msg, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const handleUploaded = (course: Course) => {
    setCourses(prev => {
      if (prev.some(c => c.id === course.id)) return prev;
      return [course, ...prev];
    });
    setShowUploadModal(false);
  };

  useEffect(() => { fetchCourses(); }, [fetchCourses]);
  useEffect(() => { setDisplayCount(INITIAL_DISPLAY); }, [searchQuery, activeFilter]);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredCourses = courses.filter(c =>
    (!normalizedQuery || c.title.toLowerCase().includes(normalizedQuery)) &&
    (activeFilter === 'all' || c.subject === activeFilter)
  );
  const visibleCourses = filteredCourses.slice(0, displayCount);
  const hasMore        = displayCount < filteredCourses.length;
  const remainingCount = filteredCourses.length - displayCount;

  // ✅ Compteurs par matière générés depuis SUBJECTS — pas de liste en dur
  const categoryCounts = SUBJECTS.map(subject => ({
    ...subject,
    count: courses.filter(c => c.subject === subject.value).length,
  }));

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-6">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 -left-40 h-[400px] w-[400px] rounded-full bg-accent/5 blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      <main className="relative mx-auto max-w-6xl px-4 pt-5 pb-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" aria-hidden="true" />
              Mes cours
            </h1>
            <p className="text-sm text-muted-foreground mt-1">{courses.length} cours au total</p>
          </div>
          <div className="flex gap-2">
            <div className="w-full sm:w-auto sm:shrink-0">
              <PassBadge balance={balance} loading={passesLoading} onBuyClick={() => navigate('/pricing')} showProgress maxPass={100} />
            </div>
            <Button onClick={() => setShowUploadModal(true)} className="gap-2 h-11 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0">
              <Upload className="h-5 w-5" aria-hidden="true" />
              <span className="hidden sm:inline">Importer un PDF</span>
            </Button>
            <Button onClick={() => setShowScanModal(true)} variant="outline" className="gap-2 h-11 rounded-xl" aria-label="Scanner des documents">
              <Camera className="h-5 w-5" aria-hidden="true" />
              Scanner
            </Button>
          </div>
        </div>

        <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileSelect} aria-hidden="true" />

        <UploadModal open={showUploadModal} onOpenChange={setShowUploadModal} onUploaded={handleUploaded} />
        <MultiImageScanner open={showScanModal} onOpenChange={setShowScanModal} onSuccess={() => fetchCourses()} />

        <AnimatePresence>
          {showCameraCapture && <CameraCapture onClose={handleCancelCamera} onCapture={handleCameraCapture} />}
        </AnimatePresence>

        {/* Recherche */}
        <div className="relative animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Rechercher un cours..."
            className="w-full h-12 pl-10 pr-10 rounded-xl glass-card border-0 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* ✅ Filtres générés depuis SUBJECTS — s'adapte automatiquement */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 animate-fade-in" style={{ animationDelay: '0.15s' }}>
          <button onClick={() => setActiveFilter('all')} aria-pressed={activeFilter === 'all'}
            className={cn('flex items-center gap-1.5 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200',
              activeFilter === 'all' ? 'bg-primary/10 text-primary shadow-sm' : 'glass-card text-muted-foreground hover:text-foreground')}>
            <Filter className="h-3.5 w-3.5" />
            Tous ({courses.length})
          </button>

          {/* ✅ Une seule boucle sur SUBJECTS — plus rien à toucher ici */}
          {categoryCounts.map(cat => (
            <button key={cat.value} onClick={() => setActiveFilter(cat.value)} aria-pressed={activeFilter === cat.value}
              className={cn('flex items-center gap-1.5 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200',
                activeFilter === cat.value
                  ? `bg-gradient-to-r ${cat.filterGradient} text-white shadow-sm`
                  : 'glass-card text-muted-foreground hover:text-foreground')}>
              <span aria-hidden="true">{cat.emoji}</span>{cat.label} ({cat.count})
            </button>
          ))}
        </div>

        {/* Liste */}
        <section aria-label="Liste des cours">
          {error && (
            <div role="alert" className="glass-card border-destructive/20 bg-destructive/5 p-4 text-center text-sm text-destructive">
              {error}<button onClick={fetchCourses} className="ml-2 font-semibold underline">Réessayer</button>
            </div>
          )}
          {loading ? (
            <div className="space-y-3" aria-busy="true">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-[76px] w-full rounded-2xl" />)}
            </div>
          ) : filteredCourses.length === 0 ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card border-dashed border-2 border-primary/15 p-8 text-center">
              <p className="text-muted-foreground text-sm">Aucun cours trouvé.</p>
            </motion.div>
          ) : (
            <>
              <div className={cn("overflow-y-auto pr-1 max-h-[calc(100vh-360px)]", "scrollbar-thin scrollbar-thumb-border/60 scrollbar-track-transparent hover:scrollbar-thumb-primary/30")}>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 pb-2">
                  {visibleCourses.map((course, i) => (
                    <motion.div key={course.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.04, 0.3) }}>
                      <CourseCard course={course} />
                    </motion.div>
                  ))}
                </div>
              </div>
              <div className="mt-4 flex flex-col items-center gap-2 border-t border-border/40 pt-4">
                <p className="text-xs text-muted-foreground">{visibleCourses.length} / {filteredCourses.length} cours affichés</p>
                {hasMore && (
                  <Button variant="outline" size="sm" className="gap-2 rounded-xl text-xs h-8" onClick={() => setDisplayCount(prev => prev + LOAD_MORE_COUNT)}>
                    <ChevronDown className="h-3.5 w-3.5" />
                    Voir {Math.min(remainingCount, LOAD_MORE_COUNT)} cours de plus
                  </Button>
                )}
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}