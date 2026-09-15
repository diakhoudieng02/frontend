// components/layout/AppLayout.tsx
import { ReactNode } from 'react';
import { TopBar } from './TopBar';
import { BottomNav } from './BottomNav';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'react-router-dom';

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  hideNav?: boolean;
  variant?: 'app' | 'marketing';
}

export function AppLayout({ 
  children, 
  title, 
  hideNav,
  variant = 'app'
}: AppLayoutProps) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Si nous sommes sur la page d'accueil et l'utilisateur est connecté, 
  // nous ne devrions pas être ici car il est redirigé vers /dashboard
  // Mais gardons cette logique au cas où
  const effectiveVariant = isAuthenticated ? 'app' : variant;

  // Cacher TopBar sur certaines pages si nécessaire
  const shouldShowTopBar = !(location.pathname === '/' && !isAuthenticated);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Afficher TopBar seulement si nécessaire */}
      {shouldShowTopBar && <TopBar title={title} variant={effectiveVariant} />}
      
      {/* Contenu principal */}
      <main className="flex-1">
        {children}
      </main>
      
      {/* BottomNav seulement pour l'app sur mobile */}
      {!hideNav && isAuthenticated && (
        <div className="md:hidden">
          <BottomNav />
        </div>
      )}
    </div>
  );
}