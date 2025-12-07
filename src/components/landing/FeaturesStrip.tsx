import { ShieldCheck, Zap, Briefcase } from "lucide-react";

const FeaturesStrip = () => {
  return (
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
  );
};

export default FeaturesStrip;
