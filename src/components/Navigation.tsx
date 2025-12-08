import { useState } from "react";
import { Menu, X, ArrowRight } from "lucide-react";

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const Navigation = ({ currentPage, onNavigate }: NavigationProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: "inicio", label: "Inicio" },
    { id: "servicios", label: "Servicios" },
    { id: "nosotros", label: "Sobre Nosotros" },
    { id: "testimonios", label: "Testimonios" },
  ];

  const handleNavigate = (page: string) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/80 backdrop-blur-xl supports-[backdrop-filter]:bg-black/60">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => handleNavigate("inicio")}
            className="flex items-center gap-3 group"
          >
            <div className="relative w-8 h-8 flex items-center justify-center bg-gradient-to-br from-primary to-red-800 rounded-lg shadow-lg shadow-red-900/20 group-hover:shadow-primary/40 transition-all duration-300">
              <span className="font-bold text-foreground text-lg">T</span>
              <div className="absolute inset-0 border border-white/20 rounded-lg"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-tight text-foreground leading-none">
                SERVICIOS TORO, GIL & ASOCIADOS, C.A.
              </span>
            </div>
          </button>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/5">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`nav-link px-4 py-1.5 text-xs font-medium rounded-full transition-all ${
                  currentPage === item.id
                    ? "active"
                    : "text-neutral-400 hover:text-foreground"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* CTA */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleNavigate("contacto")}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-foreground text-background text-xs font-semibold rounded hover:bg-neutral-200 transition-colors"
            >
              <span>Contáctanos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-foreground p-2 hover:bg-white/10 rounded-md transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/95 backdrop-blur-md pt-24 px-6">
          <div className="flex flex-col space-y-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className="text-xl font-medium text-foreground border-b border-white/10 pb-4 text-left"
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => handleNavigate("contacto")}
              className="text-xl font-medium text-primary border-b border-white/10 pb-4 text-left"
            >
              Contacto
            </button>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="absolute top-6 right-6 text-neutral-400"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      )}
    </>
  );
};

export default Navigation;
