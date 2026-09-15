// pages/MyTickets.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Ticket, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  RefreshCw,
  MessageSquare,
  ChevronRight,
  ArrowLeft  // ✅ AJOUTER
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supportService } from '@/services/support.service';
import { cn } from '@/lib/utils';
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

export default function MyTickets() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadTickets = async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true);
    }

    try {
      const data = await supportService.getMyTickets();
      setTickets(data);
    } catch (error) {
      console.error('❌ Erreur chargement tickets:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger vos tickets',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

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
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Chargement de vos tickets...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      
      
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* ✅ Bouton de retour */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-4"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/help')}
            className="gap-2 hover:bg-transparent hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au centre d'aide
          </Button>
        </motion.div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold mb-2 flex items-center gap-2">
              <Ticket className="h-8 w-8 text-primary" />
              Mes tickets de support
            </h1>
            <p className="text-muted-foreground">
              {tickets.length} ticket{tickets.length > 1 ? 's' : ''} trouvé{tickets.length > 1 ? 's' : ''}
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => loadTickets(true)}
              disabled={refreshing}
              className="gap-2"
            >
              <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
              Actualiser
            </Button>
            
            <Button
              onClick={() => navigate('/support/contact')}
              className="gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              Nouveau ticket
            </Button>
          </div>
        </div>

        {/* Liste des tickets */}
        {tickets.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Ticket className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-display font-semibold text-lg mb-2">
              Aucun ticket pour le moment
            </h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Vous n'avez pas encore créé de ticket de support. 
              N'hésitez pas à nous contacter si vous avez des questions.
            </p>
            <Button onClick={() => navigate('/support/contact')}>
              Contacter le support
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket, index) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card 
                  className="p-6 hover:shadow-lg transition-all cursor-pointer group"
                  onClick={() => navigate(`/support/ticket/${ticket.id}`)}
                >
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono text-xs sm:text-sm text-muted-foreground">
                          {ticket.ticketNumber}
                        </span>
                        <Badge 
                          variant="outline"
                          className={statusConfig[ticket.status]?.color}
                        >
                          {statusConfig[ticket.status]?.label}
                        </Badge>
                      </div>
                      
                      <h3 className="font-semibold text-base sm:text-lg mb-2">
                        {ticket.message.length > 80 
                          ? ticket.message.substring(0, 80) + '...' 
                          : ticket.message}
                      </h3>
                      
                      <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-muted-foreground">
                        <span>{ticket.name}</span>
                        <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                        <span>{ticket.email}</span>
                        <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(ticket.createdAt)}
                        </span>
                      </div>
                    </div>
                    
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}