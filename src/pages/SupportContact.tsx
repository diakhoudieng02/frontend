// pages/SupportContact.tsx
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom'; // ✅ AJOUTER
import { HelpCircle, Mail, Clock, MessageSquare, ArrowLeft } from 'lucide-react'; // ✅ AJOUTER ArrowLeft
import { Navbar } from '@/components/layout/Navbar';
import { ContactForm } from '@/components/help/ContactForm';
import { Button } from '@/components/ui/button'; // ✅ AJOUTER

export default function SupportContact() {
  const navigate = useNavigate(); // ✅ AJOUTER

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-6">
      {/* Background blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 -left-40 h-[400px] w-[400px] rounded-full bg-accent/5 blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

     
      
      <main className="relative mx-auto max-w-2xl px-4 py-6 space-y-6">
        {/* ✅ Bouton de retour */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/help')}
            className="gap-2 hover:bg-transparent hover:text-primary -ml-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au centre d'aide
          </Button>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="font-display text-2xl font-bold text-foreground flex items-center justify-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            Contacter le support
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Une question ? Un problème ? Notre équipe est là pour vous aider.
          </p>
        </motion.div>

        {/* Informations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <div className="glass-card p-4 rounded-xl text-center">
            <Clock className="h-5 w-5 text-primary mx-auto mb-2" />
            <p className="text-xs font-medium">Délai de réponse</p>
            <p className="text-lg font-bold text-primary">48h</p>
          </div>
          <div className="glass-card p-4 rounded-xl text-center">
            <Mail className="h-5 w-5 text-primary mx-auto mb-2" />
            <p className="text-xs font-medium">Notification</p>
            <p className="text-lg font-bold text-primary">Par email</p>
          </div>
        </motion.div>

        {/* Formulaire */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-5 rounded-2xl"
        >
          <div className="flex items-center gap-2.5 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
              <MessageSquare className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h2 className="font-display text-base font-bold text-foreground">
                Formulaire de contact
              </h2>
              <p className="text-xs text-muted-foreground">
                Tous les champs sont obligatoires
              </p>
            </div>
          </div>

          <ContactForm />
        </motion.div>
      </main>
    </div>
  );
}