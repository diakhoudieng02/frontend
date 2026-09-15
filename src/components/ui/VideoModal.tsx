// components/ui/VideoModal.tsx
import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
}

export default function VideoModal({ isOpen, onClose, videoUrl }: VideoModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!isOpen && videoRef.current) {
      videoRef.current.pause();
    }
  }, [isOpen]);

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
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
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
              <Dialog.Panel className="w-full max-w-5xl transform overflow-hidden rounded-2xl bg-black shadow-2xl transition-all">
                {/* Header avec titre et bouton fermer */}
                <div className="flex items-center justify-between px-6 py-4 bg-black/90 border-b border-white/10">
                  <Dialog.Title className="text-lg font-semibold text-white">
                    Démonstration Etooblo AI
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-white/60 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Conteneur vidéo avec ratio 16:9 */}
                <div className="relative aspect-video bg-black">
                  <video
                    ref={videoRef}
                    controls
                    autoPlay
                    className="absolute inset-0 w-full h-full"
                    controlsList="nodownload"
                  >
                    <source src={videoUrl} type="video/mp4" />
                    Votre navigateur ne supporte pas la lecture de vidéos.
                  </video>
                </div>

                {/* Footer avec actions supplémentaires (optionnel) */}
                <div className="flex justify-end gap-3 px-6 py-4 bg-black/90 border-t border-white/10">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="text-white/70 hover:text-white"
                  >
                    Fermer
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      onClose();
                      // Appeler onGetStarted si vous voulez rediriger vers l'inscription
                    }}
                    className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                  >
                    Essayer gratuitement
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