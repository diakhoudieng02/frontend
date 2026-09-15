// src/components/course/MultiImageScanner.tsx
import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ImageCompression from 'browser-image-compression';
import { Camera, Upload, Image as ImageIcon, AlertCircle, Loader2, Trash2, X, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { coursesService } from '@/services/courses.service';
import { CameraCapture } from './CameraCapture';
import { createPortal } from 'react-dom';

interface ImageFile {
  file: File;
  preview: string;
  id: string;
  name: string;
  size: number;
}

interface MultiImageScannerProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: (courseId: string) => void;
}

const MAX_FILES = 5;
const MAX_TOTAL_SIZE = 15 * 1024 * 1024; // 15MB en bytes
const MIN_RESOLUTION = 1000; // 1000x1000px minimum
const SUPPORTED_FORMATS = ['image/jpeg', 'image/png', 'image/webp'];

export function MultiImageScanner({ open = false, onOpenChange, onSuccess }: MultiImageScannerProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<ImageFile[]>([]);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalSize, setTotalSize] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showCamera, setShowCamera] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  // État pour l'alerte intégrée
  const [inlineAlert, setInlineAlert] = useState<{type: 'success' | 'error' | 'warning', title: string, message: string} | null>(null);

  // Calculer la taille totale
  const calculateTotalSize = useCallback((files: ImageFile[]) => {
    const total = files.reduce((sum, img) => sum + img.size, 0);
    setTotalSize(total);
    return total;
  }, []);

  // Valider une image
  const validateImage = async (file: File): Promise<string | null> => {
    if (!SUPPORTED_FORMATS.includes(file.type)) {
      return `Format non supporté: ${file.type}. Utilisez JPEG, PNG ou WebP.`;
    }

    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        if (img.width < MIN_RESOLUTION || img.height < MIN_RESOLUTION) {
          resolve(`Image trop petite: ${img.width}x${img.height}px. Minimum requis: ${MIN_RESOLUTION}x${MIN_RESOLUTION}px.`);
        } else {
          resolve(null);
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve('Impossible de lire l\'image');
      };
      img.src = url;
    });
  };

  // Formater la taille en Mo
  const formatSize = (bytes: number): string => {
    return (bytes / (1024 * 1024)).toFixed(2) + ' Mo';
  };

  // Vérifier si la taille totale est valide
  const isTotalSizeValid = totalSize <= MAX_TOTAL_SIZE;

  // Compresser une image si nécessaire
  const compressImage = async (file: File): Promise<File> => {
    const options = {
      maxSizeMB: 3,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      fileType: 'image/jpeg' as const
    };

    try {
      const compressedFile = await ImageCompression(file, options);
      console.log(`✅ Compression: ${(file.size / 1024 / 1024).toFixed(2)}Mo → ${(compressedFile.size / 1024 / 1024).toFixed(2)}Mo`);
      return compressedFile;
    } catch (error) {
      console.error('❌ Erreur compression:', error);
      return file;
    }
  };

  // Fonction pour afficher l'alerte intégrée
  const showInlineAlert = (type: 'success' | 'error' | 'warning', title: string, message: string, duration = 5000) => {
    setInlineAlert({ type, title, message });
    
    // Auto-fermeture après duration
    setTimeout(() => {
      setInlineAlert(null);
    }, duration);
  };

  // Gérer la sélection de fichiers
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setError(null);
    setValidationErrors([]);

    if (images.length + files.length > MAX_FILES) {
      showInlineAlert(
        'error',
        'Trop de fichiers',
        `Vous ne pouvez sélectionner que ${MAX_FILES} images maximum`
      );
      return;
    }

    const errors: string[] = [];
    const newImages: ImageFile[] = [];
    let hasSmallImage = false;

    for (const file of files) {
      const validationError = await validateImage(file);
      if (validationError) {
        errors.push(`${file.name}: ${validationError}`);
        
        // Vérifier si c'est une erreur de taille trop petite
        if (validationError.includes('trop petite')) {
          hasSmallImage = true;
        }
        continue;
      }

      const compressedFile = await compressImage(file);
      
      newImages.push({
        file: compressedFile,
        preview: URL.createObjectURL(compressedFile),
        id: `${compressedFile.name}-${Date.now()}-${Math.random()}`,
        name: compressedFile.name,
        size: compressedFile.size
      });
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      
      // Alerte spécifique pour les images trop petites
      if (hasSmallImage) {
        showInlineAlert(
          'warning',
          '⚠️ Image(s) trop petite(s)',
          `Résolution minimum requise: ${MIN_RESOLUTION}x${MIN_RESOLUTION}px`,
          6000
        );
      }
    }

    const updatedImages = [...images, ...newImages];
    setImages(updatedImages);
    calculateTotalSize(updatedImages);

    if (updatedImages.length > images.length) {
      showInlineAlert(
        'success',
        '✅ Images ajoutées',
        `${newImages.length} image(s) ajoutée(s) avec succès`
      );
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Gérer la capture depuis la caméra
  const handleCameraCapture = (imageSrc: string) => {
    fetch(imageSrc)
      .then(res => res.blob())
      .then(async (blob) => {
        const file = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' });
        
        const validationError = await validateImage(file);
        if (validationError) {
          // Alerte spécifique pour image caméra trop petite
          if (validationError.includes('trop petite')) {
            showInlineAlert(
              'warning',
              '📸 Image trop petite',
              `Résolution minimum requise: ${MIN_RESOLUTION}x${MIN_RESOLUTION}px. Ajustez la distance ou la qualité de votre appareil.`,
              6000
            );
          } else {
            showInlineAlert(
              'error',
              'Image invalide',
              validationError
            );
          }
          return;
        }

        const compressedFile = await compressImage(file);
        
        const newImage: ImageFile = {
          file: compressedFile,
          preview: imageSrc,
          id: `camera-${Date.now()}`,
          name: `camera-${Date.now()}.jpg`,
          size: compressedFile.size
        };

        if (images.length >= MAX_FILES) {
          showInlineAlert(
            'error',
            'Trop d\'images',
            `Vous avez déjà ${MAX_FILES} images`
          );
          return;
        }

        const updatedImages = [...images, newImage];
        setImages(updatedImages);
        calculateTotalSize(updatedImages);
        
        showInlineAlert(
          'success',
          '✅ Photo ajoutée',
          `${updatedImages.length}/${MAX_FILES} images`
        );
      })
      .catch(err => {
        console.error('❌ Erreur traitement image caméra:', err);
        showInlineAlert(
          'error',
          'Erreur',
          'Impossible de traiter l\'image'
        );
      });
  };

  // Supprimer une image
  const handleRemoveImage = (id: string) => {
    setImages(prev => {
      const imageToRemove = prev.find(img => img.id === id);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      const newImages = prev.filter(img => img.id !== id);
      calculateTotalSize(newImages);
      return newImages;
    });
    
    showInlineAlert(
      'success',
      '✅ Image supprimée',
      'L\'image a été retirée'
    );
  };

  // Supprimer toutes les images
  const handleClearAll = () => {
    images.forEach(img => URL.revokeObjectURL(img.preview));
    setImages([]);
    setTotalSize(0);
    setValidationErrors([]);
    
    showInlineAlert(
      'success',
      '✅ Toutes les images supprimées',
      'La sélection a été vidée'
    );
  };

  // Fermer le modal
  const handleClose = () => {
    // Nettoyer les previews
    images.forEach(img => URL.revokeObjectURL(img.preview));
    setImages([]);
    setTitle('');
    setSubject('');
    setError(null);
    setValidationErrors([]);
    setTotalSize(0);
    setUploadProgress(0);
    setInlineAlert(null); // Fermer l'alerte
    onOpenChange?.(false);
  };

  // Ouvrir la caméra
  const handleOpenCamera = () => {
    setShowCamera(true);
    setInlineAlert(null); // Fermer l'alerte quand on ouvre la caméra
  };

  // Fermer la caméra
  const handleCloseCamera = () => {
    setShowCamera(false);
  };

  // Nettoyer les previews au démontage
  useEffect(() => {
    return () => {
      images.forEach(img => URL.revokeObjectURL(img.preview));
    };
  }, [images]);

  // Uploader les images
  const handleUpload = async () => {
    if (images.length === 0) {
      showInlineAlert(
        'error',
        'Aucune image',
        'Veuillez sélectionner au moins une image'
      );
      return;
    }

    if (!isTotalSizeValid) {
      showInlineAlert(
        'error',
        'Taille totale excessive',
        `La taille totale (${formatSize(totalSize)}) dépasse la limite de 15MB`
      );
      return;
    }

    if (!title.trim()) {
      showInlineAlert(
        'error',
        'Titre requis',
        'Veuillez donner un titre à ce cours'
      );
      return;
    }

    if (!subject) {
      showInlineAlert(
        'error',
        'Matière requise',
        'Veuillez sélectionner une matière'
      );
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError(null);
    setInlineAlert(null);

    try {
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return prev;
          }
          return prev + 5;
        });
      }, 100);

      const result = await coursesService.scanUpload({
        title,
        subject,
        images: images.map(img => img.file)
      });

      clearInterval(interval);
      setUploadProgress(100);
      setProcessing(true);

      showInlineAlert(
        'success',
        '✅ Scan réussi',
        `${result.totalImages} image(s) traitées. ${result.extractedTextLength} caractères extraits.`
      );

      setTimeout(() => {
        setProcessing(false);
        onSuccess?.(result.courseId);
        navigate(`/course/${result.courseId}`);
        handleClose();
      }, 1500);

    } catch (err: any) {
      console.error('❌ Erreur upload:', err);
      setError(err.message || 'Erreur lors de l\'upload');
      showInlineAlert(
        'error',
        'Erreur',
        err.message || 'Impossible d\'envoyer les images'
      );
    } finally {
      setUploading(false);
    }
  };

  // Ne rien rendre si le modal est fermé
  if (!open) return null;

  // Rendu du modal principal
  return (
    <>
      {createPortal(
        <AnimatePresence mode="wait">
          {open && !showCamera && (
            <>
              {/* Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm"
                onClick={handleClose}
              />
              
              {/* Modal */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-[10000] flex items-center justify-center p-4 overflow-y-auto"
                style={{ pointerEvents: 'none' }}
              >
                <div 
                  className="w-full max-w-3xl bg-card rounded-2xl shadow-2xl overflow-hidden max-h-[calc(100vh-2rem)] flex flex-col"
                  style={{ pointerEvents: 'auto' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Zone d'en-tête avec alerte intégrée */}
                  <div className="sticky top-0 z-20">
                    {/* En-tête principal */}
                    <div className="flex items-center justify-between p-4 border-b bg-card">
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={handleClose} 
                          className="h-8 w-8 rounded-full text-muted-foreground hover:text-white hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 transition-all duration-200"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <h2 className="font-display font-semibold text-lg">Scanner des images</h2>
                      </div>
                      <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
                        {images.length}/{MAX_FILES}
                      </span>
                    </div>

                    {/* Alerte intégrée (bannière) */}
                    <AnimatePresence>
                      {inlineAlert && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className={cn(
                            "overflow-hidden border-b",
                            inlineAlert.type === 'success' && "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800",
                            inlineAlert.type === 'error' && "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800",
                            inlineAlert.type === 'warning' && "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800"
                          )}
                        >
                          <div className="p-4 flex items-start gap-3">
                            {inlineAlert.type === 'success' && <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />}
                            {inlineAlert.type === 'error' && <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />}
                            {inlineAlert.type === 'warning' && <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />}
                            
                            <div className="flex-1">
                              <p className={cn(
                                "font-semibold text-sm",
                                inlineAlert.type === 'success' && "text-green-800 dark:text-green-300",
                                inlineAlert.type === 'error' && "text-red-800 dark:text-red-300",
                                inlineAlert.type === 'warning' && "text-yellow-800 dark:text-yellow-300"
                              )}>
                                {inlineAlert.title}
                              </p>
                              <p className={cn(
                                "text-xs mt-1",
                                inlineAlert.type === 'success' && "text-green-700 dark:text-green-400",
                                inlineAlert.type === 'error' && "text-red-700 dark:text-red-400",
                                inlineAlert.type === 'warning' && "text-yellow-700 dark:text-yellow-400"
                              )}>
                                {inlineAlert.message}
                              </p>
                            </div>
                            
                            <button
                              onClick={() => setInlineAlert(null)}
                              className="shrink-0 text-muted-foreground hover:text-foreground"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Barre de progression taille */}
                  <div className="px-4 py-2 bg-muted/20 border-b">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Taille totale</span>
                      <span className={cn(
                        "font-medium",
                        isTotalSizeValid ? "text-primary" : "text-destructive"
                      )}>
                        {formatSize(totalSize)} / 15 Mo
                      </span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <motion.div 
                        className={cn(
                          "h-full",
                          isTotalSizeValid ? "bg-primary" : "bg-destructive"
                        )}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((totalSize / MAX_TOTAL_SIZE) * 100, 100)}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>

                  {/* Zone de preview des images */}
                  <div className="flex-1 overflow-y-auto p-4">
                    {images.length === 0 ? (
                      <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-8">
                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                          <ImageIcon className="h-10 w-10 text-primary/60" />
                        </div>
                        <h3 className="font-display font-semibold text-base mb-2">
                          Aucune image sélectionnée
                        </h3>
                        <p className="text-sm text-muted-foreground max-w-xs">
                          Sélectionnez jusqu'à 5 photos ou utilisez l'appareil photo de votre mobile
                        </p>
                        <p className="text-xs text-muted-foreground mt-4">
                          Formats: JPEG, PNG, WebP • Min: 1000x1000px
                        </p>
                      </div>
                    ) : (
                      <>
                        {validationErrors.length > 0 && (
                          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-xs text-destructive">
                            <p className="font-semibold mb-1">Images ignorées :</p>
                            <ul className="list-disc list-inside">
                              {validationErrors.map((err, i) => (
                                <li key={i}>{err}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          <AnimatePresence>
                            {images.map((img, index) => (
                              <motion.div
                                key={img.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="relative group aspect-square rounded-lg overflow-hidden border border-border bg-muted"
                              >
                                <img
                                  src={img.preview}
                                  alt={`Preview ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                                
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <Button
                                    variant="destructive"
                                    size="icon"
                                    className="h-8 w-8 rounded-full"
                                    onClick={() => handleRemoveImage(img.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>

                                <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">
                                  {(img.size / 1024).toFixed(0)} Ko
                                </div>

                                <div className="absolute top-1 left-1 bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                                  {index + 1}
                                </div>
                              </motion.div>
                            ))}
                          </AnimatePresence>

                          {images.length < MAX_FILES && (
                            <motion.button
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              onClick={() => fileInputRef.current?.click()}
                              className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-colors flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary"
                            >
                              <Camera className="h-6 w-6" />
                              <span className="text-xs">Ajouter</span>
                            </motion.button>
                          )}
                        </div>

                        {images.length > 0 && (
                          <div className="flex justify-end mt-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleClearAll}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1 h-8 text-xs"
                            >
                              <Trash2 className="h-3 w-3" />
                              Tout supprimer
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Formulaire infos cours */}
                  <div className="p-4 border-t bg-card space-y-4 sticky bottom-0">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-sm font-medium">
                        Titre du cours <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="title"
                        placeholder="Ex: Cours de mathématiques - Chapitre 5"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        disabled={uploading || processing}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject" className="text-sm font-medium">
                        Matière <span className="text-destructive">*</span>
                      </Label>
                      <select
                        id="subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        disabled={uploading || processing}
                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <option value="">Sélectionner une matière</option>
                        <option value="math">📐 Mathématiques</option>
                        <option value="languages">🗣️ Langues</option>
                      </select>
                    </div>

                    {error && (
                      <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-xs text-destructive flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <p>{error}</p>
                      </div>
                    )}

                    {processing && (
                      <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg text-xs text-primary flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                        <p>Extraction du texte en cours... Cela peut prendre quelques instants.</p>
                      </div>
                    )}

                    {/* Boutons avec couleurs corrigées */}
                    <div className="flex gap-2 pt-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      
                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading || processing || images.length >= MAX_FILES}
                        className={cn(
                          "flex-1 gap-2 transition-all duration-200",
                          "hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500",
                          "hover:text-white hover:border-transparent",
                          "disabled:hover:bg-transparent disabled:hover:text-muted-foreground",
                          "border-purple-200 dark:border-purple-800",
                          "text-purple-700 dark:text-purple-300",
                          "bg-white dark:bg-transparent",
                          "hover:border-transparent",
                          "focus:ring-purple-500 focus:ring-offset-2"
                        )}
                      >
                        <Upload className="h-4 w-4" />
                        Choisir
                      </Button>

                      <Button
                        variant="outline"
                        onClick={handleOpenCamera}
                        disabled={uploading || processing || images.length >= MAX_FILES}
                        className={cn(
                          "flex-1 gap-2 transition-all duration-200",
                          "hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500",
                          "hover:text-white hover:border-transparent",
                          "disabled:hover:bg-transparent disabled:hover:text-muted-foreground",
                          "border-purple-200 dark:border-purple-800",
                          "text-purple-700 dark:text-purple-300",
                          "bg-white dark:bg-transparent",
                          "hover:border-transparent",
                          "focus:ring-purple-500 focus:ring-offset-2"
                        )}
                      >
                        <Camera className="h-4 w-4" />
                        Caméra
                      </Button>
                    </div>

                    <Button
                      onClick={handleUpload}
                      disabled={uploading || processing || images.length === 0 || !isTotalSizeValid || !title || !subject}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 h-11 gap-2"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Upload en cours... {uploadProgress}%
                        </>
                      ) : processing ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Traitement OCR en cours...
                        </>
                      ) : (
                        <>
                          <Camera className="h-4 w-4" />
                          Scanner les images
                        </>
                      )}
                    </Button>

                    <p className="text-[10px] text-muted-foreground text-center">
                      ℹ️ 1 Pass sera débité pour l'analyse IA
                    </p>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Modal caméra séparé */}
      {showCamera && createPortal(
        <CameraCapture
          onClose={handleCloseCamera}
          onCapture={handleCameraCapture}
        />,
        document.body
      )}
    </>
  );
}