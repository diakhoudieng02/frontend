import { GraduationCap } from 'lucide-react';

interface FooterProps {
  companyName?: string;
  tagline?: string;
}

export default function Footer({ 
  companyName = "ETOOBLO AI", 
  tagline = "L'intelligence artificielle au service de votre réussite éducative." 
}: FooterProps) {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Produit: [
      { label: 'Fonctionnalités', href: '#features' },
      { label: 'Tarifs', href: '/pricing' },
      { label: 'Démo', href: '/demo' },
      { label: 'API', href: '/api' },
    ],
    Entreprise: [
      { label: 'À propos', href: '/about' },
      { label: 'Carrières', href: '/careers' },
      { label: 'Blog', href: '/blog' },
      { label: 'Presse', href: '/press' },
    ],
    Légal: [
      { label: 'Confidentialité', href: '/privacy' },
      { label: 'Conditions', href: '/terms' },
      { label: 'Cookies', href: '/cookies' },
      { label: 'Contact', href: '/contact' },
    ],
  };

  return (
    <footer className="bg-sage-blue-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-white flex items-center justify-center">
                <GraduationCap className="w-4 h-4 sm:w-6 sm:h-6 text-primary" />
              </div>
              <span className="font-display font-bold text-lg sm:text-xl">{companyName}</span>
            </div>
            <p className="text-white/80 text-sm sm:text-base">
              {tagline}
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-bold text-base sm:text-lg mb-3 sm:mb-4">{category}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <a 
                      href={link.href} 
                      className="text-white/80 hover:text-white transition-colors text-sm sm:text-base"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 mt-6 sm:mt-12 pt-6 sm:pt-8 text-center text-white/60">
          <p className="text-sm sm:text-base">
            © {currentYear} {companyName}. Tous droits réservés.
          </p>
          <p className="mt-1 sm:mt-2 text-xs sm:text-sm">
            Made with ❤️ for students worldwide
          </p>
        </div>
      </div>
    </footer>
  );
}