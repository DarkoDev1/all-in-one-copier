import { ShieldCheck, Zap, Briefcase } from "lucide-react";

interface HomePageProps {
  onNavigate: (page: string) => void;
}

const HomePage = ({ onNavigate }: HomePageProps) => {
  return (
    <section className="page-enter">
      <div className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background FX */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-[120px]"></div>
          {/* Abstract Grid */}
          <div className="absolute inset-0 grid-pattern"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-neutral-400 text-[11px] font-medium tracking-wide uppercase mb-8 backdrop-blur-sm animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse-slow"></span>
            Gestión Administrativa, legal y tributaria en Venezuela
          </div>

          <h1 className="text-5xl md:text-7xl font-medium tracking-tight text-foreground leading-[1.1] mb-8">
            Confiabilidad, rapidez y <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-red-400 to-orange-400 text-glow">
              Eficiencia Garantizada.
            </span>
          </h1>

          <p className="text-lg text-neutral-400 max-w-2xl mx-auto leading-relaxed font-light mb-10">
            Firma de contadores y abogados con más de 8 años de experiencia en el mercado con el objetivo de dar a los clientes servicios contables, administrativos y legales de alta calidad, con profesionales expertos y actualizados, equipados con herramientas de vanguardia para solventar sus necesidades y resolver problemas.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onNavigate("servicios")}
              className="w-full sm:w-auto px-8 py-3.5 bg-primary hover:bg-red-500 text-foreground font-medium text-sm rounded transition-all shadow-glow hover:shadow-glow-hover"
            >
              Explorar Servicios
            </button>
            <button
              onClick={() => onNavigate("contacto")}
              className="w-full sm:w-auto px-8 py-3.5 bg-transparent border border-white/10 hover:bg-white/5 text-foreground font-medium text-sm rounded transition-colors flex items-center justify-center gap-2"
            >
              Agendar Consulta
            </button>
          </div>
        </div>
      </div>

      {/* Features Strip */}
      <div className="border-y border-white/5 bg-neutral-900/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0 text-primary border border-white/5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-foreground font-medium mb-1">
                Seguridad Jurídica
              </h3>
              <p className="text-sm text-neutral-500">
                Gestión transparente de documentos y legalizaciones.
              </p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0 text-primary border border-white/5">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-foreground font-medium mb-1">
                Respuesta Ágil
              </h3>
              <p className="text-sm text-neutral-500">
                Optimizamos tiempos en entes públicos y privados.
              </p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0 text-primary border border-white/5">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-foreground font-medium mb-1">
                Asesoría Integral
              </h3>
              <p className="text-sm text-neutral-500">
                Desde PYMES hasta grandes corporaciones.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomePage;
