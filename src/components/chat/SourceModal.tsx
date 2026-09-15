// src/components/chat/SourceModal.tsx
import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { 
  X, 
  FileText, 
  BookOpen, 
  ExternalLink,
  Copy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface SourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  source: {
    content: string;
    courseTitle: string;
    page?: number;
    section?: string;
  } | null;
}

export function SourceModal({ isOpen, onClose, source }: SourceModalProps) {
  const { toast } = useToast();
  const navigate = useNavigate();

  if (!source) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(source.content);
    toast({
      description: 'Extrait copié dans le presse-papiers',
      duration: 2000,
    });
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-card border border-border shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <Dialog.Title className="text-lg font-semibold text-foreground">
                        Extrait source
                      </Dialog.Title>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {source.courseTitle}
                        </span>
                        {source.page && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                            <span className="text-xs text-muted-foreground">
                              Page {source.page}
                            </span>
                          </>
                        )}
                        {source.section && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                            <span className="text-xs text-muted-foreground">
                              {source.section}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-muted transition-colors"
                  >
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="bg-muted/30 rounded-xl p-4 border border-border">
                    <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
                      "{source.content}"
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between gap-3 p-6 border-t border-border bg-muted/20">
                  <Button
                    variant="outline"
                    onClick={handleCopy}
                    className="gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Copier l'extrait
                  </Button>
                  
                  <Button
                    onClick={onClose}
                    className="btn-primary-gradient gap-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    Fermer
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}