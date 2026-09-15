// pages/TicketDetail.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  Ticket,
  Clock,
  Mail,
  User,
  MessageSquare,
  Loader2,
  AlertCircle
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supportService } from '@/services/support.service';
import type { SupportTicket } from '@/types/support.types';

const statusConfig: Record<string, { label: string; color: string }> = {
  PENDING: { 
    label: 'En attente', 
    color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
  },
  PROCESSING: { 
    label: 'En cours', 
    color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' 
  },
  RESOLVED: { 
    label: 'Résolu', 
    color: 'bg-green-500/10 text-green-500 border-green-500/20' 
  },
  ARCHIVED: { 
    label: 'Archivé', 
    color: 'bg-gray-500/10 text-gray-500 border-gray-500/20' 
  },
};

export default function TicketDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      navigate('/support/my-tickets');
      return;
    }

    const loadTicket = async () => {
      try {
        const data = await supportService.getTicketById(id);
        setTicket(data);
      } catch (error) {
        console.error('❌ Erreur chargement ticket:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger le ticket',
          variant: 'destructive',
        });
        navigate('/support/my-tickets');
      } finally {
        setLoading(false);
      }
    };

    loadTicket();
  }, [id, navigate, toast]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
       
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement du ticket...</p>
        </div>
      </div>
    );
  }

  if (!ticket) return null;

  return (
    <div className="min-h-screen bg-background">
    
      
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        {/* Bouton retour */}
        <Button
          variant="ghost"
          onClick={() => navigate('/support/my-tickets')}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à la liste
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-8">
            {/* En-tête */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-2xl font-display font-bold mb-2 flex items-center gap-2">
                  <Ticket className="h-6 w-6 text-primary" />
                  Ticket {ticket.ticketNumber}
                </h1>
                <Badge 
                  variant="outline"
                  className={statusConfig[ticket.status]?.color}
                >
                  {statusConfig[ticket.status]?.label}
                </Badge>
              </div>
            </div>

            {/* Informations */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{ticket.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{ticket.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Créé le {formatDate(ticket.createdAt)}</span>
              </div>
            </div>

            {/* Message */}
            <div>
              <h2 className="font-semibold mb-3 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                Message
              </h2>
              <div className="bg-muted/30 p-4 rounded-lg whitespace-pre-wrap">
                {ticket.message}
              </div>
            </div>

            {/* Note */}
            <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <p className="text-xs text-amber-600 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Vous serez notifié par email dès que ce ticket sera traité.
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}