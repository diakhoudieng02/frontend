import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Home, 
  BookOpen, 
  Brain, 
  MessageSquare, 
  User, 
  FlaskConical,
  Menu, 
  X,
  Sun,
  Moon,
  ChevronRight,
  GraduationCap,
  Settings,
  LogOut,
  HelpCircle,
  LifeBuoy,
  FileText,
  Headphones,
  CreditCard,
  Zap,
  Sparkles  // Gardé pour l'icône
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/hooks/use-theme";

// ✅ Ajout de l'onglet Pricing dans NAV_ITEMS
const NAV_ITEMS = [
  { to: "/", label: "Accueil", icon: Home },
  { to: "/courses", label: "Cours", icon: BookOpen },
  { to: "/diagnostic", label: "Diagnostique", icon: FlaskConical },
  { to: "/chat", label: "Chat", icon: MessageSquare },
  { to: "/pricing", label: "Forfaits", icon: Sparkles }, // ✅ Nouvel onglet
  { to: "/help", label: "Aide", icon: HelpCircle },
];

export function Navbar() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { theme, setTheme } = useTheme();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  // ✅ Fonction supprimée car plus utilisée pour les badges

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleLogout = () => {
    setShowLogoutDialog(true);
    setShowProfileMenu(false);
  };

  const confirmLogout = () => {
    logout();
    navigate("/login");
    setMobileOpen(false);
    setShowProfileMenu(false);
    setShowLogoutDialog(false);
  };

  const getUserInitial = () => {
    if (user?.firstName) {
      return user.firstName[0].toUpperCase();
    }
    if (user?.lastName) {
      return user.lastName[0].toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    if (user?.phoneNumber) {
      return user.phoneNumber[0].toUpperCase();
    }
    return 'U';
  };

  const getDisplayName = () => {
    if (user?.firstName) {
      return user.firstName;
    }
    if (user?.lastName) {
      return user.lastName;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    if (user?.phoneNumber) {
      return user.phoneNumber;
    }
    return 'Utilisateur';
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex sticky top-0 left-0 right-0 z-50 h-20 px-4 lg:px-6 xl:px-8 items-center justify-between bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        {/* Logo avec slogan - Version compacte */}
        <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0">
          <Link to="/dashboard" className="flex items-center gap-2 lg:gap-3">
            <div className="h-10 w-10 lg:h-12 lg:w-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-md">
              <GraduationCap className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <h1 className="text-lg lg:text-xl xl:text-2xl font-bold text-gray-900 dark:text-white whitespace-nowrap">
                  ETOOBLO <span className="text-blue-600 dark:text-blue-400">IA</span>
                </h1>
                <div className="h-1 w-1 rounded-full bg-blue-500" />
              </div>
              <p className="text-[10px] lg:text-xs text-gray-600 dark:text-gray-400 mt-0.5 whitespace-nowrap">
                L'intelligence pour réussir
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation centrale - Version compacte AVEC PRICING (même couleur) */}
        <div className="flex items-center gap-1 md:gap-2 lg:gap-3 xl:gap-4 px-3 lg:px-4 xl:px-6 py-2.5 bg-gray-50 dark:bg-gray-800/50 rounded-full flex-shrink">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.to || 
                          (item.to === "/" && pathname === "/dashboard");
            
            return (
              <Link
                key={item.to}
                to={item.to === "/" ? "/dashboard" : item.to}
                className={cn(
                  "flex items-center gap-1.5 lg:gap-2 px-2.5 lg:px-3 xl:px-4 py-2 rounded-full text-xs lg:text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-sm border border-gray-200 dark:border-gray-700"
                    : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/50 dark:hover:bg-gray-800/50"
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="hidden lg:inline xl:inline whitespace-nowrap">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Actions droite */}
        <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0">
          {/* Toggle thème */}
          <button
            onClick={toggleTheme}
            className="p-1.5 lg:p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label={theme === "dark" ? "Activer mode clair" : "Activer mode sombre"}
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 lg:h-5 lg:w-5" />
            ) : (
              <Moon className="h-4 w-4 lg:h-5 lg:w-5" />
            )}
          </button>

          {/* Badge CLASSE - SUPPRIMÉ */}

          {/* Profil utilisateur avec menu déroulant */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-1.5 lg:gap-2 px-2 lg:px-3 py-1.5 lg:py-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="h-7 w-7 lg:h-8 lg:w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-semibold text-xs lg:text-sm">
                    {getUserInitial()}
                  </span>
                </div>
                <span className="text-xs lg:text-sm font-medium text-gray-700 dark:text-gray-300 hidden xl:inline max-w-[100px] truncate">
                  {getDisplayName()}
                </span>
                <ChevronRight className={cn(
                  "h-3.5 w-3.5 lg:h-4 lg:w-4 text-gray-400 transition-transform hidden xl:inline flex-shrink-0",
                  showProfileMenu && "rotate-90"
                )} />
              </button>

              {/* Menu déroulant du profil */}
              {showProfileMenu && (
                <>
                  {/* Backdrop pour fermer le menu en cliquant en dehors */}
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowProfileMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {getDisplayName()}
                      </p>
                      {user?.schoolLevel && (
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Niveau :
                          </span>
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                            {user.schoolLevel}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={() => {
                        navigate("/profile");
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <User className="h-4 w-4" />
                      Mon profil
                    </button>

                    

                    <button
                      onClick={() => {
                        navigate("/settings");
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Settings className="h-4 w-4" />
                      Paramètres
                    </button>

                    <button
                      onClick={() => {
                        navigate("/help");
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <LifeBuoy className="h-4 w-4" />
                      Centre d'aide
                    </button>
                    
                    <div className="border-t border-gray-100 dark:border-gray-700 pt-2">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Se déconnecter
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 lg:gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/login")}
                className="text-gray-700 dark:text-gray-300 hidden lg:flex text-xs lg:text-sm px-2 lg:px-3"
              >
                Connexion
              </Button>
              <Button
                size="sm"
                onClick={() => navigate("/register")}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xs lg:text-sm px-3 lg:px-4"
              >
                Inscription
              </Button>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Header */}
      <nav className="md:hidden sticky top-0 left-0 right-0 z-50 h-16 px-4 flex items-center justify-between bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        {/* Menu burger */}
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label="Ouvrir le menu"
        >
          <Menu className="h-5 w-5 text-gray-700 dark:text-gray-300" />
        </button>
        
        {/* Logo mobile */}
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-md">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-gray-900 dark:text-white text-sm leading-tight">
              ETOOBLO <span className="text-blue-600 dark:text-blue-400">IA</span>
            </span>
            <span className="text-[10px] text-gray-600 dark:text-gray-400 leading-tight">
              L'intelligence pour réussir
            </span>
          </div>
        </Link>

        {/* Actions mobiles */}
        <div className="flex items-center gap-2">
          {/* Badge classe sur mobile - SUPPRIMÉ */}

          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label={theme === "dark" ? "Activer mode clair" : "Activer mode sombre"}
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 text-gray-700 dark:text-gray-300" />
            ) : (
              <Moon className="h-4 w-4 text-gray-700 dark:text-gray-300" />
            )}
          </button>
          
          {user ? (
            <button
              onClick={() => navigate("/profile")}
              className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-sm"
              aria-label="Mon profil"
            >
              <span className="text-white font-semibold text-xs">
                {getUserInitial()}
              </span>
            </button>
          ) : (
            <Button 
              size="sm" 
              onClick={() => navigate("/login")}
              className="h-8 px-3 text-xs bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Connexion
            </Button>
          )}
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
            onClick={() => setMobileOpen(false)}
          />
          
          {/* Menu Panel */}
          <div className="absolute inset-y-0 left-0 w-80 max-w-[85vw] bg-white dark:bg-gray-900 shadow-xl flex flex-col">
            <div className="flex-1 overflow-y-auto p-6">
              {/* Header menu */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-md">
                    <GraduationCap className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900 dark:text-white text-lg">
                      ETOOBLO <span className="text-blue-600 dark:text-blue-400">IA</span>
                    </h2>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      L'intelligence pour réussir
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Fermer le menu"
                >
                  <X className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                </button>
              </div>

              {/* User Info avec badge classe */}
              {user && (
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-800/50 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-md">
                      <span className="text-white font-semibold text-lg">
                        {getUserInitial()}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{getDisplayName()}</p>
                      {user?.schoolLevel && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <GraduationCap className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                          <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                            {user.schoolLevel}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-3 text-gray-700 dark:text-gray-300"
                    onClick={() => {
                      navigate("/profile");
                      setMobileOpen(false);
                    }}
                  >
                    <User className="h-4 w-4" />
                    Mon profil
                  </Button>
                </div>
              )}

              {/* Navigation AVEC PRICING (même couleur) */}
              <div className="space-y-1 mb-6">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3 mb-2">
                  Navigation
                </p>
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.to || 
                                (item.to === "/" && pathname === "/dashboard");
                  
                  return (
                    <Link
                      key={item.to}
                      to={item.to === "/" ? "/dashboard" : item.to}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-xl text-sm font-medium transition-all",
                        active
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5" />
                        {item.label}
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                    </Link>
                  );
                })}
              </div>

              {/* Theme Toggle in menu */}
              <div className="mb-6">
                <button
                  onClick={toggleTheme}
                  className="flex items-center justify-between w-full p-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                >
                  <div className="flex items-center gap-3">
                    {theme === "dark" ? (
                      <Sun className="h-5 w-5" />
                    ) : (
                      <Moon className="h-5 w-5" />
                    )}
                    <span>Mode {theme === "dark" ? "Clair" : "Sombre"}</span>
                  </div>
                  <div className="h-6 w-11 rounded-full bg-gray-200 dark:bg-gray-700 relative">
                    <div className={cn(
                      "absolute top-1 h-4 w-4 rounded-full transition-all duration-200",
                      theme === "dark" 
                        ? "left-6 bg-blue-500" 
                        : "left-1 bg-gray-400"
                    )} />
                  </div>
                </button>
              </div>

              {/* Auth Buttons */}
              {user ? (
                <div className="pt-6 border-t border-gray-200 dark:border-gray-800 space-y-2">
                 
                  <Button
                    onClick={() => {
                      navigate("/settings");
                      setMobileOpen(false);
                    }}
                    variant="outline"
                    className="w-full justify-start gap-3 text-gray-700 dark:text-gray-300"
                  >
                    <Settings className="h-4 w-4" />
                    Paramètres
                  </Button>
                  <Button
                    onClick={() => {
                      navigate("/help");
                      setMobileOpen(false);
                    }}
                    variant="outline"
                    className="w-full justify-start gap-3 text-blue-600 dark:text-blue-400"
                  >
                    <LifeBuoy className="h-4 w-4" />
                    Centre d'aide
                  </Button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Se déconnecter
                  </button>
                </div>
              ) : (
                <div className="pt-6 border-t border-gray-200 dark:border-gray-800 space-y-2">
                  <Button 
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    onClick={() => {
                      navigate("/login");
                      setMobileOpen(false);
                    }}
                  >
                    Connexion
                  </Button>
                  <Button 
                    variant="outline"
                    className="w-full text-gray-700 dark:text-gray-300"
                    onClick={() => {
                      navigate("/register");
                      setMobileOpen(false);
                    }}
                  >
                    Inscription
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation AVEC PRICING (même couleur) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-lg">
        <div className="flex items-center justify-around px-2 py-3">
          {NAV_ITEMS.filter(item => 
            item.to === "/" || 
            item.to === "/courses" || 
            item.to === "/diagnostic" || 
            item.to === "/chat" || 
            item.to === "/pricing" || // ✅ Pricing ajouté
            item.to === "/help"
          ).map((item) => {
            const Icon = item.icon;
            const active = pathname === item.to || 
                          (item.to === "/" && pathname === "/dashboard");
            
            return (
              <Link
                key={item.to}
                to={item.to === "/" ? "/dashboard" : item.to}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all active:scale-95 min-w-[60px]",
                  active 
                    ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20" 
                    : "text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium truncate max-w-[60px]">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* AlertDialog pour la confirmation de déconnexion */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la déconnexion</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir vous déconnecter ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmLogout}>
              Se déconnecter
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}