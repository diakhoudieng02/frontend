import { useState } from 'react';
import { Search, Loader2, Brain, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface MicroSummarySearchProps {
  onSearch: (notion: string) => Promise<void>;
  loading: boolean;
}

export function MicroSummarySearch({ onSearch, loading }: MicroSummarySearchProps) {
  const [searchNotion, setSearchNotion] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchNotion.trim()) {
      onSearch(searchNotion);
    }
  };

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-lg flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Révision intelligente
        </h3>
        <Badge variant="outline" className="gap-1">
          <Zap className="h-3 w-3 text-primary" />
          Micro-synthèses
        </Badge>
      </div>
      
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          placeholder="Rechercher une notion à réviser (ex: dérivées, fonctions...)"
          value={searchNotion}
          onChange={(e) => setSearchNotion(e.target.value)}
          className="flex-1"
        />
        <Button 
          type="submit"
          disabled={loading || !searchNotion.trim()}
          className="gap-2"
          size="sm"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          Rechercher
        </Button>
      </form>
    </div>
  );
}