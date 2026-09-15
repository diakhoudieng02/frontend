import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SectionProps {
  id?: string;
  children: ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function Section({ 
  id, 
  children, 
  className = "", 
  padding = 'lg' 
}: SectionProps) {
  const paddingClasses = {
    sm: 'py-12',
    md: 'py-16',
    lg: 'py-20',
    xl: 'py-24',
  };

  return (
    <section 
      id={id} 
      className={cn(
        paddingClasses[padding],
        className
      )}
    >
      <div className="container mx-auto px-4 sm:px-6">
        {children}
      </div>
    </section>
  );
}