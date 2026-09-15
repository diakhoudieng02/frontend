import { FileText, Clock, ChevronRight, Target, CheckCircle2, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface RecentCourseCardProps {
  courseId: string;
  title: string;
  subject: string;
  createdAt: Date;
  progress?: number;
  exercisesCompleted?: number;
  totalExercises?: number;
  masteryLevel?: 'beginner' | 'intermediate' | 'advanced';
  onClick?: () => void;
}

export function RecentCourseCard({ 
  courseId,
  title, 
  subject, 
  createdAt, 
  progress = 0,
  exercisesCompleted = 0,
  totalExercises = 10,
  masteryLevel = 'beginner',
  onClick 
}: RecentCourseCardProps) {
  const navigate = useNavigate();
  const timeAgo = formatDistanceToNow(createdAt, { addSuffix: true, locale: fr });
  
  const masteryColors = {
    beginner:     'from-blue-500 to-cyan-500',
    intermediate: 'from-purple-500 to-pink-500',
    advanced:     'from-emerald-500 to-teal-500',
  };

  const masteryLabels = {
    beginner:     'Débutant',
    intermediate: 'Intermédiaire',
    advanced:     'Avancé',
  };

  // ✅ Navigation directe vers le chat du cours — bypasse l'onglet intermédiaire
  const handleChatClick = (e: React.MouseEvent) => {
    e.preventDefault();       // empêche la navigation par défaut
    e.stopPropagation();      // empêche la propagation vers la carte parente
    navigate(`/chat?course=${courseId}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="group relative w-full"
    >
      {/* ── Zone principale cliquable (résumé) ── */}
      <div
        className="relative p-5 rounded-2xl bg-card border border-border hover:border-primary/20 hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden"
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
        aria-label={`Ouvrir le cours : ${title}`}
      >
        {/* Fond gradient décoratif */}
        <div className={`absolute top-0 right-0 w-24 h-24 opacity-10 bg-gradient-to-br ${masteryColors[masteryLevel]} rounded-full -translate-y-8 translate-x-8 pointer-events-none`} />

        <div className="relative z-10 flex items-start gap-4">
          {/* Icône + badge progression circulaire */}
          <div className="relative shrink-0">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white border-2 border-card flex items-center justify-center">
              <div className="relative w-6 h-6">
                <svg className="w-6 h-6 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeDasharray={`${progress}, 100`}
                    className="text-primary/30"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                  {progress}%
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-display font-semibold text-foreground truncate group-hover:text-primary transition-colors pr-8">
                {title}
              </h4>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
            </div>
            
            <div className="flex items-center gap-2 mb-3">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${masteryColors[masteryLevel]} text-white`}>
                {subject}
              </span>
              <span className={cn(
                'px-2 py-1 rounded-full text-xs font-medium',
                masteryLevel === 'beginner'     ? 'bg-blue-100 text-blue-700' :
                masteryLevel === 'intermediate' ? 'bg-purple-100 text-purple-700' :
                                                 'bg-emerald-100 text-emerald-700'
              )}>
                {masteryLabels[masteryLevel]}
              </span>
            </div>
            
            {/* Barre de progression */}
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Progression</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className={`h-full rounded-full bg-gradient-to-r ${masteryColors[masteryLevel]}`}
                />
              </div>
            </div>
            
            {/* Stats */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-3">
                <span className="flex items-center text-muted-foreground">
                  <Clock className="w-3 h-3 mr-1" />
                  {timeAgo}
                </span>
                <span className="flex items-center text-muted-foreground">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  {exercisesCompleted}/{totalExercises} exos
                </span>
              </div>

              {progress === 100 && (
                <div className="flex items-center gap-1 text-emerald-600 font-semibold">
                  <Target className="w-3 h-3" />
                  <span className="text-xs">Maîtrisé</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── ✅ Bouton Chat — overlay au survol (comme CourseCard) ── */}
      <button
        onClick={handleChatClick}
        aria-label={`Ouvrir le chat IA pour : ${title}`}
        title="Chat avec l'IA"
        className={cn(
          // Positionnement absolu en haut à droite
          'absolute right-4 top-4',
          // Taille & forme
          'flex h-9 w-9 items-center justify-center rounded-xl',
          // Couleurs de base — invisible au repos, visible au survol de la carte
          'bg-transparent text-transparent',
          // Transitions
          'transition-all duration-200',
          // ✅ Apparaît au survol de la carte (group-hover)
          'group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20',
          // ✅ Feedback au survol direct du bouton
          'hover:!bg-primary hover:!text-white hover:scale-110',
          // Bordures et ombres pour meilleure visibilité au survol
          'group-hover:border group-hover:border-primary/20',
          'group-hover:shadow-md',
          // Focus accessible
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
        )}
      >
        <MessageSquare className="h-4 w-4" aria-hidden="true" />
      </button>
    </motion.div>
  );
}