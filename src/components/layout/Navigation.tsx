import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  GraduationCap,
  LogIn,
  UserPlus,
  BookOpen,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavigationProps {
  isHomePage?: boolean;
}

export default function Navigation({ isHomePage = true }: NavigationProps) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '#features', label: 'Fonctionnalités' },
    { href: '#how-it-works', label: 'Comment ça marche' },
    { href: '#benefits', label: 'Avantages' },
  ];

  // Dans Navigation.tsx, modifiez les handlers d'authentification :
const handleAuthAction = (type: 'login' | 'register' | 'dashboard') => {
  switch (type) {
    case 'login':
      navigate('/login'); // Au lieu de /auth?tab=login
      break;
    case 'register':
      navigate('/register'); // Au lieu de /auth?tab=signup
      break;
    case 'dashboard':
      navigate('/dashboard');
      break;
  }
  setMobileMenuOpen(false);
};

  return (
    <nav className="sticky top-0 z-50 glass-strong border-b border-border safe-area-pt">
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate('/')}
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center shadow-md group-hover:shadow-glow transition-shadow">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div className="hidden sm:block leading-none">
              <span className="font-display font-bold text-xl text-foreground">
                ETOOBLO AI
              </span>
              <p className="text-xs text-muted-foreground">L'intelligence pour réussir</p>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {isHomePage && navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-foreground hover:text-primary transition-colors font-medium"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Auth Buttons - Desktop */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden md:flex items-center gap-3"
          >
            {!isAuthenticated ? (
              <>
                <Button
                  onClick={() => handleAuthAction('login')}
                  variant="ghost"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Connexion
                </Button>
                <Button
                  onClick={() => handleAuthAction('register')}
                  className="btn-primary-gradient"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Inscription
                </Button>
              </>
            ) : (
              <Button
                onClick={() => handleAuthAction('dashboard')}
                className="btn-primary-gradient"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Mon Espace
              </Button>
            )}
          </motion.div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            {!isAuthenticated && (
              <Button
                onClick={() => handleAuthAction('register')}
                size="sm"
                className="btn-primary-gradient"
              >
                <UserPlus className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden mt-4 py-4 border-t border-border"
          >
            <div className="flex flex-col gap-4">
              {isHomePage && navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-foreground hover:text-primary transition-colors font-medium py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              {!isAuthenticated && (
                <div className="flex flex-col gap-3 pt-4 border-t border-border">
                  <Button
                    onClick={() => handleAuthAction('register')}
                    className="btn-primary-gradient w-full"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Inscription
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
}