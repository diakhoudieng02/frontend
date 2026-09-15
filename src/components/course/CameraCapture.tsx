// src/components/course/CameraCapture.tsx
import { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Button } from '@/components/ui/button';
import { Camera, RotateCw, X, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface CameraCaptureProps {
  onClose: () => void;
  onCapture: (image: string) => void;
}

// Détection mobile
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

export function CameraCapture({ onClose, onCapture }: CameraCaptureProps) {
  const webcamRef = useRef<Webcam>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const { toast } = useToast();

  const videoConstraints = {
    width: isMobile ? { ideal: 720 } : { ideal: 1280 },
    height: isMobile ? { ideal: 1280 } : { ideal: 720 },
    facingMode: facingMode,
    aspectRatio: isMobile ? 9/16 : 16/9
  };

  const capture = useCallback(() => {
    if (!webcamRef.current) return;

    try {
      setLoading(true);
      const imageSrc = webcamRef.current.getScreenshot();
      
      if (imageSrc) {
        onCapture(imageSrc);
        onClose();
        
        toast({
          title: "📸 Photo prise",
          description: "Image ajoutée au formulaire",
        });
      }
    } catch (err) {
      console.error('❌ Erreur capture:', err);
      toast({
        title: "❌ Erreur",
        description: "Impossible de prendre la photo",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [webcamRef, onCapture, onClose, toast]);

  const switchCamera = useCallback(() => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  }, []);

  const handleUserMediaError = (err: string | DOMException) => {
    console.error('❌ Erreur caméra:', err);
    
    let errorMessage = "Impossible d'accéder à la caméra.";
    
    if (err === 'NotAllowedError' || (err as DOMException).name === 'NotAllowedError') {
      errorMessage = isMobile 
        ? "Autorisez l'accès à la caméra dans les réglages de votre téléphone"
        : "Autorisez l'accès à la caméra dans les paramètres de votre navigateur";
    } else if (err === 'NotFoundError' || (err as DOMException).name === 'NotFoundError') {
      errorMessage = "Aucune caméra trouvée sur cet appareil";
    } else if (err === 'NotReadableError' || (err as DOMException).name === 'NotReadableError') {
      errorMessage = "La caméra est déjà utilisée par une autre application";
    }
    
    setError(errorMessage);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-background w-full max-w-2xl rounded-2xl overflow-hidden"
      >
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" />
            Prendre une photo
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-4">
          {error ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-3" />
              <p className="text-destructive mb-2">{error}</p>
              <p className="text-sm text-muted-foreground mb-4">
                {isMobile ? "Vérifiez les permissions dans les réglages" : "Vérifiez les permissions du navigateur"}
              </p>
              <Button onClick={onClose}>Fermer</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative rounded-xl overflow-hidden bg-black/5 aspect-video">
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  videoConstraints={videoConstraints}
                  onUserMediaError={handleUserMediaError}
                  className="w-full h-full object-cover"
                  mirrored={facingMode === 'user'}
                />
                
                {loading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                  </div>
                )}
              </div>

              <div className="flex justify-center gap-3">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={switchCamera}
                  className="rounded-full w-12 h-12"
                  title="Changer de caméra"
                >
                  <RotateCw className="h-5 w-5" />
                </Button>
                <Button
                  size="icon"
                  onClick={capture}
                  disabled={loading}
                  className="rounded-full w-16 h-16 bg-primary hover:bg-primary/90"
                  title="Prendre une photo"
                >
                  <Camera className="h-6 w-6" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}