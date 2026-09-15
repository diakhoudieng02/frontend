import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, FileText, Check, AlertCircle } from 'lucide-react';
import { coursesService } from '@/services/courses.service';
import { toast } from 'sonner';
import type { Course } from '@/types/api';

interface CourseUploadFormProps {
  onClose: () => void;
  onSuccess: (course: Course) => void;
}

// Options disponibles
const SUBJECTS = [
  { value: 'math', label: 'Mathématiques' },
  { value: 'Langues', label: 'Langues' },
];

const LEVELS = [
  { value: 'Seconde', label: '2nde' },
  { value: 'Premiere', label: '1ère' },
  { value: 'Terminale', label: 'Terminale' },
];

export function CourseUploadForm({ onClose, onSuccess }: CourseUploadFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    subject: '' as 'math' | 'Langues' | '',
    level: '',
    file: null as File | null
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  /**
   * Validation du formulaire
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est requis';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Le titre doit contenir au moins 3 caractères';
    }

    if (!formData.subject) {
      newErrors.subject = 'La matière est requise';
    }

    if (!formData.file) {
      newErrors.file = 'Veuillez sélectionner un fichier';
    } else {
      // Vérifier le type de fichier (PDF uniquement pour le backend)
      const allowedTypes = ['application/pdf'];
      if (!allowedTypes.includes(formData.file.type)) {
        newErrors.file = 'Format non supporté. Utilisez PDF uniquement';
      }
      // Vérifier la taille (max 15MB)
      const maxSize = 15 * 1024 * 1024; // 15MB
      if (formData.file.size > maxSize) {
        newErrors.file = 'Le fichier est trop volumineux (max 15MB)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Gestion du fichier sélectionné
   */
  const handleFileChange = (file: File | null) => {
    if (file) {
      setFormData(prev => ({ ...prev, file }));
      // Effacer l'erreur du fichier si présente
      if (errors.file) {
        setErrors(prev => ({ ...prev, file: '' }));
      }
    }
  };

  /**
   * Gestion du drag & drop
   */
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  /**
   * Soumission du formulaire
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Veuillez corriger les erreurs du formulaire');
      return;
    }

    if (!formData.subject || !formData.file) {
      toast.error('Données manquantes');
      return;
    }

    setLoading(true);

    try {
      // Utiliser le service courses
      const course = await coursesService.upload(
        formData.title.trim(),
        formData.subject as 'math' | 'Langues',
        formData.file
      );

      console.log('✅ Cours uploadé avec succès:', course);

      toast.success('Cours ajouté avec succès !', {
        description: 'Votre cours a été ajouté à votre bibliothèque',
      });

      // Appeler le callback de succès
      onSuccess(course);
      onClose();

    } catch (err) {
      const error = err as Error;
      const errorMessage = error.message || 'Erreur lors de l\'upload du cours';

      console.error('❌ Erreur upload:', error);

      toast.error('Échec de l\'upload', {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-background rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-background border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Ajouter un cours</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Uploadez vos documents PDF
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Titre du cours */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-foreground">
              Titre du cours *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => {
                setFormData({ ...formData, title: e.target.value });
                if (errors.title) setErrors({ ...errors, title: '' });
              }}
              placeholder="Ex: Les fonctions dérivées"
              className={`w-full px-4 py-3 bg-muted rounded-xl border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                errors.title ? 'border-red-500' : 'border-transparent'
              }`}
              disabled={loading}
            />
            {errors.title && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.title}
              </p>
            )}
          </div>

          {/* Matière */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-foreground">
              Matière *
            </label>
            <select
              value={formData.subject}
              onChange={(e) => {
                setFormData({ ...formData, subject: e.target.value as 'math' | 'Langues' });
                if (errors.subject) setErrors({ ...errors, subject: '' });
              }}
              className={`w-full px-4 py-3 bg-muted rounded-xl border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                errors.subject ? 'border-red-500' : 'border-transparent'
              }`}
              disabled={loading}
            >
              <option value="">Sélectionner une matière</option>
              {SUBJECTS.map((subject) => (
                <option key={subject.value} value={subject.value}>
                  {subject.label}
                </option>
              ))}
            </select>
            {errors.subject && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.subject}
              </p>
            )}
          </div>

          {/* Upload de fichier */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-foreground">
              Fichier du cours *
            </label>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 transition-all ${
                dragActive
                  ? 'border-primary bg-primary/5'
                  : errors.file
                  ? 'border-red-500'
                  : 'border-muted-foreground/30 hover:border-primary/50'
              }`}
            >
              {formData.file ? (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{formData.file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(formData.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleFileChange(null)}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                    disabled={loading}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="font-medium mb-1">
                    Glissez-déposez votre fichier ici
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    ou cliquez pour parcourir
                  </p>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                    className="hidden"
                    id="file-upload"
                    disabled={loading}
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-block px-6 py-2 bg-primary text-primary-foreground rounded-lg cursor-pointer hover:bg-primary/90 transition-colors"
                  >
                    Parcourir les fichiers
                  </label>
                  <p className="text-xs text-muted-foreground mt-4">
                    PDF uniquement (max 15MB)
                  </p>
                </div>
              )}
            </div>
            {errors.file && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.file}
              </p>
            )}
          </div>

          {/* Boutons d'action */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-muted hover:bg-muted/80 rounded-xl font-medium transition-colors"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Upload className="w-5 h-5" />
                  </motion.div>
                  Upload en cours...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Ajouter le cours
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}