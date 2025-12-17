import { Instagram, Facebook, MessageCircle } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-background border-t border-white/10 py-12 mt-auto relative z-20">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-center md:text-left">
          <span className="text-sm font-bold text-foreground tracking-tight">
            TORO GIL C.A.
          </span>
          <p className="text-xs text-neutral-500 mt-1">
            J-00000000-0 | Caracas, Venezuela
          </p>
        </div>

        <div className="flex gap-6">
          <a
            href="https://www.instagram.com/serviciostorogil/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-500 hover:text-foreground transition-colors"
            aria-label="Instagram"
          >
            <Instagram className="w-[18px] h-[18px]" />
          </a>
          <a
            href="https://www.facebook.com/serviciostorogil"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-500 hover:text-foreground transition-colors"
            aria-label="Facebook"
          >
            <Facebook className="w-[18px] h-[18px]" />
          </a>
          <a
            href="https://api.whatsapp.com/send/?phone=%2B584241950932&text&type=phone_number&app_absent=0"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-500 hover:text-foreground transition-colors"
            aria-label="WhatsApp"
          >
            <MessageCircle className="w-[18px] h-[18px]" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
