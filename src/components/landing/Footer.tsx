import { Instagram, MessageCircle } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-background border-t border-white/10 py-12 mt-auto relative z-20">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-center md:text-left">
          <span className="text-sm font-bold text-foreground tracking-tight">
            TORO GIL SERVICIOS C.A.
          </span>
          <p className="text-xs text-neutral-500 mt-1">
            J-50226323-3 | Caracas - Miranda, Venezuela
          </p>
        </div>

        <div className="flex gap-6">
          <a
            href="https://instagram.com/torogilservicios"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-500 hover:text-foreground transition-colors"
          >
            <Instagram className="w-[18px] h-[18px]" />
          </a>
          <a
            href="https://wa.me/584241950932"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-500 hover:text-foreground transition-colors"
          >
            <MessageCircle className="w-[18px] h-[18px]" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
