import { Home, BookOpen, PenTool, User } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/dashboard', icon: Home, label: 'Accueil' },
  { path: '/courses', icon: BookOpen, label: 'Cours' },
  { path: '/exercises', icon: PenTool, label: 'Exercices' },
  { path: '/profile', icon: User, label: 'Profil' },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="bottom-nav md:hidden"> {/* Seulement sur mobile */}
      <div className="flex justify-around items-center">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname.startsWith(path);
          
          return (
            <NavLink
              key={path}
              to={path}
              className={cn(
                'nav-item flex-1',
                isActive && 'nav-item-active'
              )}
            >
              <Icon className={cn('w-6 h-6', isActive && 'text-primary')} />
              <span className={cn(
                'text-xs font-medium',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}>
                {label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}