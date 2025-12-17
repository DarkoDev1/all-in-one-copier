import { Instagram, MessageCircle, Send, Facebook } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-background border-t border-white/10 py-12 mt-auto relative z-20">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-center md:text-left">
          <span className="text-sm font-bold text-foreground tracking-tight">
            SERVICIOS TORO, GIL & ASOCIADOS, C.A.
          </span>
          <p className="text-xs text-neutral-500 mt-1">
            J-50226323-3 | Caracas - Miranda, Venezuela
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
            href="https://api.whatsapp.com/send/?phone=%2B584241950932&text&type=phone_number&app_absent=0"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-500 hover:text-foreground transition-colors"
            aria-label="WhatsApp"
          >
            <MessageCircle className="w-[18px] h-[18px]" />
          </a>
          <a
            href="https://t.me/Serviciostorogil"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-500 hover:text-foreground transition-colors"
            aria-label="Telegram"
          >
            <Send className="w-[18px] h-[18px]" />
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
            href="https://www.facebook.com/serviciostorogil"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-500 hover:text-foreground transition-colors"
            aria-label="X (Twitter)"
          >
            <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
