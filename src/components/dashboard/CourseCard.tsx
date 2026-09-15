// src/components/dashboard/CourseCard.tsx
import { useNavigate } from 'react-router-dom';
import { MessageSquare, BookOpen, ChevronRight, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Course } from '@/types/api';

// ✅ Import centralisé — badge et icône colorés selon la matière
import { getSubjectLabel, getSubjectBadgeClass, getSubjectIconClass } from '@/config/subjects.config';

interface CourseCardProps {
  course: Course;
  className?: string;
  
}

export function CourseCard({ course, className }: CourseCardProps) {
  const navigate = useNavigate();

  const isEpreuve = course.type === 'EPREUVE';

  const handleChatClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/chat?course=${course.id}`);
  };

  const handleCardClick = () => {
    navigate(isEpreuve ? `/correction/${course.id}` : `/course/${course.id}`);
  };

  // ✅ Couleurs de l'icône matière issues de la config — plus de switch/if en dur
  const subjectIconClass = getSubjectIconClass(course.subject);
  const subjectBadgeClass = getSubjectBadgeClass(course.subject);

  return (
    <div className={cn('group relative glass-card rounded-2xl p-4 transition-all duration-200 hover:shadow-md hover:border-primary/20 cursor-pointer', className)}>

      <div className="flex items-center gap-3 pr-10" onClick={handleCardClick}
        role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && handleCardClick()}
        aria-label={`Ouvrir : ${course.title}`}>

        {/* Icône type de document (Cours vs Épreuve) */}
        <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
          isEpreuve ? 'bg-violet-100 text-violet-600' : 'bg-primary/10 text-primary')}>
          {isEpreuve
            ? <GraduationCap className="h-5 w-5" aria-hidden="true" />
            : <BookOpen className="h-5 w-5" aria-hidden="true" />}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground leading-tight">{course.title}</p>

          {/* ✅ Libellé matière via helper — s'adapte automatiquement */}
          {course.subject && (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {getSubjectLabel(course.subject)}
            </p>
          )}

          {/* Badge type document */}
          <span className={cn('mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium',
            isEpreuve ? 'bg-violet-100 text-violet-700' : 'bg-blue-100 text-blue-700')}>
            {isEpreuve
              ? <><GraduationCap className="h-3 w-3" />Épreuve</>
              : <><BookOpen className="h-3 w-3" />Cours</>}
          </span>
        </div>

        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/40 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-primary/50" aria-hidden="true" />
      </div>

      {/* Bouton Chat */}
      <button onClick={handleChatClick} aria-label={`Chat IA : ${course.title}`}
        className={cn('absolute right-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-lg',
          'bg-transparent text-transparent transition-all duration-200',
          'group-hover:bg-primary/10 group-hover:text-primary',
          'hover:!bg-primary hover:!text-white',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50')}>
        <MessageSquare className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}

export default CourseCard;