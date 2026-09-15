import { AlertCircle, Trash2, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import type { CourseWithOutputs } from '@/types/api';

interface CourseDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: CourseWithOutputs | null;
  onConfirm: () => Promise<void>;
  exercisesCount: number;
  flashcardsCount: number;
  quizCount: number;
}

export function CourseDeleteDialog({
  open,
  onOpenChange,
  course,
  onConfirm,
  exercisesCount,
  flashcardsCount,
  quizCount
}: CourseDeleteDialogProps) {
  const [deleting, setDeleting] = useState(false);

  const handleConfirm = async () => {
    setDeleting(true);
    try {
      await onConfirm();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Confirmer la suppression
          </DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer <span className="font-semibold">"{course?.title}"</span> ?
            Cette action est irréversible.
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-muted/50 p-3 rounded-lg text-sm space-y-1">
          <p className="font-medium">Ce cours contient :</p>
          <ul className="list-disc list-inside text-muted-foreground">
            <li>Le fichier PDF original</li>
            {flashcardsCount > 0 && (
              <li>{flashcardsCount} flashcard(s)</li>
            )}
            {exercisesCount > 0 && (
              <li>{exercisesCount} exercice(s)</li>
            )}
            {quizCount > 0 && (
              <li>{quizCount} quiz</li>
            )}
          </ul>
        </div>
        
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleting}
          >
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={deleting}
            className="gap-2"
          >
            {deleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Supprimer définitivement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}