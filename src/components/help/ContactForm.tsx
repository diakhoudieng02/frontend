// components/help/ContactForm.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supportService } from '@/services/support.service';
import { Loader2, Send, Ticket } from 'lucide-react';
import { cn } from '@/lib/utils';
export function ContactForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validations
    if (!formData.name.trim() || formData.name.length < 2) {
      toast({
        title: 'Nom invalide',
        description: 'Le nom doit contenir au moins 2 caractères',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.email.trim() || !formData.email.includes('@')) {
      toast({
        title: 'Email invalide',
        description: 'Veuillez entrer une adresse email valide',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.message.trim() || formData.message.length > 1000) {
      toast({
        title: 'Message invalide',
        description: 'Le message doit contenir entre 1 et 1000 caractères',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const response = await supportService.createTicket(formData);
      
      toast({
        title: '✅ Message envoyé',
        description: response.message,
      });
      
      // Option 1: Rediriger vers la liste des tickets
      navigate('/support/my-tickets');
      
      // Option 2: Ou réinitialiser le formulaire et afficher un message
      // setFormData({ name: '', email: '', message: '' });
      
    } catch (error: any) {
      console.error('❌ Erreur envoi message:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible d\'envoyer le message',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input
          name="name"
          placeholder="Votre nom"
          value={formData.name}
          onChange={handleChange}
          disabled={loading}
          required
        />
      </div>
      <div>
        <Input
          name="email"
          type="email"
          placeholder="Votre email"
          value={formData.email}
          onChange={handleChange}
          disabled={loading}
          required
        />
      </div>
      <div>
        <Textarea
          name="message"
          placeholder="Votre message..."
          value={formData.message}
          onChange={handleChange}
          disabled={loading}
          required
          maxLength={1000}
          rows={4}
        />
        <div className="flex justify-end mt-1">
          <span className={cn(
            "text-xs",
            formData.message.length > 900 ? "text-amber-500" : "text-muted-foreground"
          )}>
            {formData.message.length}/1000
          </span>
        </div>
      </div>
      <Button 
        type="submit" 
        className="w-full gap-2"
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        Envoyer
      </Button>

      {/* Lien vers l'historique des tickets */}
      <Button
        type="button"
        variant="link"
        className="w-full text-xs"
        onClick={() => navigate('/support/my-tickets')}
      >
        <Ticket className="h-3 w-3 mr-1" />
        Voir mes tickets
      </Button>
    </form>
  );
}