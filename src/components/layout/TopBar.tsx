// components/layout/TopBar.tsx
import { usePasses } from '@/hooks/usePasses';
import { Sparkles, Bell, GraduationCap, LogIn, UserPlus, User, Home, BookOpen, PenTool, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TopBarProps {
  title?: string;
  variant?: 'app' | 'marketing';
}

// Onglets pour l'app (quand l'utilisateur est connecté)
const appTabs = [
  { path: '/dashboard', icon: Home, label: 'Accueil' },
  { path: '/courses', icon: BookOpen, label: 'Cours' },
  { path: '/exercises', icon: PenTool, label: 'Exercices' },
  { path: '/chat', icon: MessageSquare, label: 'Chat' },
];

// Interface pour les données utilisateur
interface AuthUser {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  avatarUrl?: string; // Renommé de 'avatar' à 'avatarUrl'
  createdAt?: Date;
}

export function TopBar({ title = 'DocuSage', variant = 'app' }: TopBarProps) {
  const { balance } = usePasses();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogin = () => {
    navigate('/auth?tab=login');
  };

  const handleSignUp = () => {
    navigate('/auth?tab=signup');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Si l'utilisateur est connecté, on utilise la navbar avec onglets
  if (isAuthenticated) {
    // Cast user vers notre interface
    const authUser = user as AuthUser | null;
    
    // Générer des initiales à partir du nom
    const getUserInitials = () => {
      if (authUser?.name) {
        const names = authUser.name.split(' ');
        if (names.length >= 2) {
          return `${names[0][0]}${names[1][0]}`.toUpperCase();
        }
        return names[0][0].toUpperCase();
      }
      return 'U';
    };

    // Couleur basée sur l'ID utilisateur
    const getAvatarColor = () => {
      const colors = [
        'bg-gradient-to-br from-blue-500 to-blue-600',
        'bg-gradient-to-br from-purple-500 to-purple-600',
        'bg-gradient-to-br from-green-500 to-green-600',
        'bg-gradient-to-br from-orange-500 to-orange-600',
        'bg-gradient-to-br from-pink-500 to-pink-600',
      ];
      
      if (authUser?.id) {
        const hash = Array.from(authUser.id).reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return colors[hash % colors.length];
      }
      return 'bg-gradient-to-br from-primary to-primary/80';
    };

    return (
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-border safe-area-pt">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer flex-shrink-0" onClick={() => navigate('/dashboard')}>
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="hidden lg:block">
                <span className="font-display font-bold text-xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  DocuSage AI
                </span>
                <p className="text-xs text-muted-foreground">L'intelligence pour réussir</p>
              </div>
            </div>

            {/* Navigation - Prend l'espace disponible */}
            <div className="hidden md:flex items-center flex-1 justify-center max-w-2xl mx-4">
              <div className="flex items-center w-full">
                {appTabs.map(({ path, icon: Icon, label }) => {
                  const isActive = location.pathname.startsWith(path);
                  
                  return (
                    <button
                      key={path}
                      onClick={() => navigate(path)}
                      className={cn(
                        'flex items-center justify-center gap-2 px-4 py-3 flex-1 transition-all relative',
                        isActive 
                          ? 'text-primary border-b-2 border-primary' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Badges et actions utilisateur */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <button 
                className="pass-badge animate-bounce-subtle hover:scale-105 transition-transform"
                onClick={() => navigate('/passes')}
              >
                <Sparkles className="w-4 h-4" />
                <span>{balance}</span>
              </button>

              <button 
                className="relative p-2 rounded-full hover:bg-muted transition-colors"
                onClick={() => navigate('/notifications')}
              >
                <Bell className="w-5 h-5 text-muted-foreground" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
              </button>

              {/* Menu déroulant utilisateur */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button 
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center hover:opacity-90 transition-opacity hover:scale-105 transition-transform",
                      authUser?.avatarUrl ? '' : getAvatarColor()
                    )}
                  >
                    {authUser?.avatarUrl ? (
                      <img 
                        src={authUser.avatarUrl} 
                        alt={authUser.name || 'Utilisateur'} 
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-semibold text-sm">
                        {getUserInitials()}
                      </span>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {authUser?.name || 'Utilisateur'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {authUser?.email || authUser?.phone || 'Non défini'}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="w-4 h-4 mr-2" />
                    Mon profil
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Paramètres
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem onClick={() => navigate('/help')}>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Aide & Support
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Navigation mobile */}
          <div className="md:hidden mt-3 border-t border-border pt-3">
            <div className="flex justify-between">
              {appTabs.map(({ path, icon: Icon, label }) => {
                const isActive = location.pathname.startsWith(path);
                
                return (
                  <button
                    key={path}
                    onClick={() => navigate(path)}
                    className={cn(
                      'flex flex-col items-center px-2 py-2 transition-colors flex-1 relative',
                      isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <Icon className="w-5 h-5 mb-1" />
                    <span className="text-xs font-medium">{label}</span>
                    {isActive && (
                      <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-2/3 h-0.5 bg-primary rounded-full" />
                    )}
                  </button>
                );
              })}
              
              {/* Bouton profil pour mobile */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={cn(
                      'flex flex-col items-center px-2 py-2 transition-colors flex-1 relative',
                      location.pathname.startsWith('/profile') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <User className="w-5 h-5 mb-1" />
                    <span className="text-xs font-medium">Profil</span>
                    {location.pathname.startsWith('/profile') && (
                      <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-2/3 h-0.5 bg-primary rounded-full" />
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-48">
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="w-4 h-4 mr-2" />
                    Mon profil
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    Paramètres
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // Version pour les visiteurs non connectés (marketing)
  return (
    <header className="sticky top-0 z-50 glass-effect safe-area-pt">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className="hidden sm:block">
            <h1 className="font-display font-bold text-xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              DocuSage AI
            </h1>
            <p className="text-xs text-muted-foreground">Ton assistant de révision intelligent</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLogin}
            className="hidden sm:flex items-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            Connexion
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            onClick={handleSignUp}
            className="flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Inscription
          </Button>
        </div>
      </div>
    </header>
  );
}