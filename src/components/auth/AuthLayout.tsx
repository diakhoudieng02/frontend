import { Smartphone, Shield, Lock } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4 py-8 overflow-hidden">
      {/* Background gradient blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-accent/5 blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[300px] rounded-full bg-primary/3 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        {children}
      </div>

      {/* Security footer */}
      <div className="relative z-10 mt-8 flex items-center gap-2 text-xs text-muted-foreground animate-fade-in">
        <Lock className="h-3 w-3" />
        <span>Connexion sécurisée avec cryptage de bout en bout</span>
      </div>
    </div>
  );
}
