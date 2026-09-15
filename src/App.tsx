import { lazy, Suspense, useEffect, useState, Component } from "react";
import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useParams } from "react-router-dom";

// ─────────────────────────────────────────────────────────────
// ✅ ErrorBoundary — évite la page blanche sur erreur de rendu
// ─────────────────────────────────────────────────────────────
class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-full flex-col items-center justify-center gap-4 p-4 text-center bg-background">
          <p className="text-lg font-semibold text-destructive">Une erreur inattendue s'est produite.</p>
          <p className="text-sm text-muted-foreground font-mono">{(this.state.error as Error)?.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-sm underline text-primary"
          >
            Recharger la page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─────────────────────────────────────────────────────────────
// ✅ Redirect legacy /courses/:id → /course/:id
// ─────────────────────────────────────────────────────────────
function LegacyCourseRedirect() {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={`/course/${id}`} replace />;
}

import { AuthProvider } from "@/contexts/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import Navigation from "@/components/layout/Navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PageTransition } from "@/components/layout/PageTransition";
import axios from "axios";

// ✅ IMPORT DU HOOK DE VERSION
import { useAppVersion } from "@/hooks/Useappversion";

// ─────────────────────────────────────────────────────────────
// ✅ Pages NON lazy (critiques pour le premier rendu)
// ─────────────────────────────────────────────────────────────
import Index from "@/pages/Index";
import Maintenance from "./pages/Maintenance";

// ─────────────────────────────────────────────────────────────
// ✅ Pages LAZY — chargées uniquement lorsqu'on les visite
// ─────────────────────────────────────────────────────────────
const Login             = lazy(() => import("./pages/Login"));
const Register          = lazy(() => import("./pages/Register"));
const VerifyOtp         = lazy(() => import("./pages/VerifyOtp"));
const CompleteProfile   = lazy(() => import("./pages/CompleteProfile"));
const ForgotPassword    = lazy(() => import("./pages/ForgotPassword"));
const AuthCallback      = lazy(() => import("@/pages/AuthCallback"));
const Dashboard         = lazy(() => import("./pages/Dashboard"));
const Courses           = lazy(() => import("@/pages/Courses"));
const CourseDetail      = lazy(() => import("@/pages/CourseDetail"));
const Profile           = lazy(() => import("./pages/Profile"));
const Chat              = lazy(() => import("@/pages/Chat"));
const Exercises         = lazy(() => import("@/pages/Exercises"));
const CorrectionView    = lazy(() => import("@/pages/CorrectionView"));
const Diagnostic        = lazy(() => import("@/pages/Diagnostic"));
const Settings          = lazy(() => import("@/pages/Settings"));
const Help              = lazy(() => import("@/pages/Help"));
const Pricing           = lazy(() => import("./pages/Pricing"));
const PaymentSuccess    = lazy(() => import("./pages/PaymentSuccess"));
// ✅ NOUVELLE IMPORT : Page de callback de paiement
const PaymentCallback   = lazy(() => import("./pages/PaymentCallback"));
const SupportContact    = lazy(() => import("./pages/SupportContact"));
const MyTickets         = lazy(() => import("./pages/MyTickets"));
const TicketDetail      = lazy(() => import("./pages/TicketDetail"));
const NotFound          = lazy(() => import("./pages/NotFound"));

// ─────────────────────────────────────────────────────────────
// ✅ Loader léger affiché pendant le chargement des chunks
// ─────────────────────────────────────────────────────────────
function PageLoader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
      <div className="flex flex-col items-center gap-3">
        <div
          className="h-8 w-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin"
          aria-hidden="true"
        />
        <p className="text-sm text-muted-foreground">Chargement…</p>
      </div>
    </div>
  );
}

const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation();

  const authPages = ['/login', '/register', '/verify-otp', '/forgot-password', '/complete-profile'];
  const isIndexPage   = location.pathname === '/';
  const isAuthPage    = authPages.includes(location.pathname);
  const needsNavbar   = !isIndexPage && !isAuthPage;

  return (
    <>
      {isIndexPage  && <Navigation />}
      {needsNavbar  && <Navbar />}

      <PageTransition>
        {/* ✅ Suspense global — couvre toutes les routes lazy */}
        <Suspense fallback={<PageLoader />}>
          {/* ✅ MAIN AVEC FOND GRIS - C'EST ICI LA MODIFICATION */}
          
<main className="min-h-screen bg-gray-100 dark:bg-gray-900 pb-20 md:pb-0 [background:rgb(243,244,246)] dark:[background:rgb(17,24,39)]">
                <Routes>
              {/* ── Pages publiques ── */}
              <Route path="/"                  element={<Index />} />
              <Route path="/login"             element={<Login />} />
              <Route path="/register"          element={<Register />} />
              <Route path="/verify-otp"        element={<VerifyOtp />} />
              <Route path="/complete-profile"  element={<CompleteProfile />} />
              <Route path="/forgot-password"   element={<ForgotPassword />} />
              <Route path="/auth/callback"     element={<AuthCallback />} />
              <Route path="/maintenance"       element={<Maintenance />} />
              <Route path="/pricing"           element={<Pricing />} />
              
              {/* ✅ ROUTES DE PAIEMENT */}
              <Route path="/payment-success"   element={<PaymentSuccess />} />
              <Route path="/payment/success"   element={<PaymentCallback />} />
              
              {/* ── Pages protégées ── */}
              <Route path="/dashboard"   element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/courses"     element={<ProtectedRoute><Courses /></ProtectedRoute>} />
              <Route path="/course/:id"  element={<ProtectedRoute><CourseDetail /></ProtectedRoute>} />
              <Route path="/courses/:id" element={<LegacyCourseRedirect />} />
              <Route path="/profile"     element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/chat"        element={<ProtectedRoute><Chat /></ProtectedRoute>} />
              <Route path="/exercises/:courseId" element={<Exercises />} />
              <Route path="/correction/:id" element={<ProtectedRoute><CorrectionView /></ProtectedRoute>} />
              <Route path="/diagnostic"  element={<ProtectedRoute><Diagnostic /></ProtectedRoute>} />
              <Route path="/settings"    element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/help"        element={<ProtectedRoute><Help /></ProtectedRoute>} />

              {/* ── Support ── */}
              <Route path="/support/contact"      element={<ProtectedRoute><SupportContact /></ProtectedRoute>} />
              <Route path="/support/my-tickets"   element={<ProtectedRoute><MyTickets /></ProtectedRoute>} />
              <Route path="/support/ticket/:id"   element={<ProtectedRoute><TicketDetail /></ProtectedRoute>} />

              {/* ── 404 ── */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </Suspense>
      </PageTransition>
    </>
  );
};

const App = () => {
  // ✅ Détection de version — doit être en premier
  useAppVersion();

  const [isMaintenance, setIsMaintenance] = useState(false);
  const [isDebug,       setIsDebug]       = useState(false);
  const [isChecking,    setIsChecking]    = useState(true);

  useEffect(() => {
    // ✅ Lecture du mode debug (URL param ou localStorage)
    const debugMode =
      new URLSearchParams(window.location.search).get("debug") === "true" ||
      localStorage.getItem("debug_mode") === "true";
    setIsDebug(debugMode);

    const checkMaintenance = async () => {
      try {
        // ✅ Chemin relatif au lieu de localhost:3000 codé en dur
        const apiBase = import.meta.env.VITE_API_URL ?? "/api";
        const response = await fetch(`${apiBase}/courses`, {
          method: "GET",
          headers: { Accept: "application/json" },
        });

        if (response.status === 503 && !debugMode) {
          setIsMaintenance(true);
        }
      } catch (error: any) {
        // En cas d'erreur réseau on ne bloque pas l'app
        if (import.meta.env.DEV) {
          // ✅ console.log uniquement en développement
          console.warn("[App] Vérification maintenance échouée :", error?.message);
        }
      } finally {
        setIsChecking(false);
      }
    };

    checkMaintenance();

    // ✅ Intercepteur Axios — détecte le mode debug côté serveur et les 503
    const interceptor = axios.interceptors.response.use(
      (response) => {
        if (response.headers?.["x-debug-mode"] === "true") setIsDebug(true);
        return response;
      },
      (error) => {
        if (error.response?.status === 503 && !debugMode) setIsMaintenance(true);
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  // ── Écran de vérification initiale ───────────────────────────
  if (isChecking) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-background">
        <div
          className="h-10 w-10 rounded-full border-[3px] border-primary/20 border-t-primary animate-spin"
          aria-hidden="true"
        />
        <p className="text-sm text-muted-foreground">Vérification du serveur…</p>
      </div>
    );
  }

  // ── Mode maintenance ─────────────────────────────────────────
  if (isMaintenance && !isDebug) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Maintenance />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  // ── App normale ──────────────────────────────────────────────
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <ErrorBoundary>
              <AppContent />

            {/* ✅ Badge debug — visible uniquement en mode debug */}
            {isDebug && (
              <button
                aria-label="Désactiver le mode debug"
                style={{
                  position: "fixed",
                  bottom: "20px",
                  right: "20px",
                  background: "rgba(0,0,0,0.8)",
                  color: "#ff0",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  fontSize: "12px",
                  zIndex: 9999,
                  cursor: "pointer",
                  border: "none",
                }}
                onClick={() => {
                  localStorage.removeItem("debug_mode");
                  window.location.reload();
                }}
              >
                🐛 DEBUG MODE
              </button>
            )}
            </ErrorBoundary>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;