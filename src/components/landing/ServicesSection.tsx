import {
  Calculator,
  FileText,
  Scale,
  MoreHorizontal,
  Check,
} from "lucide-react";

interface ServicesSectionProps {
  onNavigate: (section: string) => void;
}

const services = [
  {
    title: "Servicios Administrativos",
    icon: FileText,
    color: "blue",
    description: "Control y manejo en pagos, cobros, nómina, proveedores, clientes, deberes formales y mucho más.",
  },
  {
    title: "Servicios Contables",
    icon: Calculator,
    color: "green",
    description: "Estados financieros, balances, libros legales, declaraciones y asesoría legal.",
  },
  {
    title: "Servicios Legales",
    icon: Scale,
    color: "purple",
    description: "Poderes, divorcios, libros contables, constitución de empresas, firmas personales, IVSS, FAOV, LOCTI y mucho más.",
  },
  {
    title: "Otros Servicios",
    icon: MoreHorizontal,
    color: "orange",
    description: "Patente, impuesto a los grandes patrimonios, certificación de ingresos, balance general, registro de empresa.",
  },
];

const colorClasses: Record<string, { icon: string; border: string }> = {
  blue: { icon: "bg-blue-500/10 text-blue-500", border: "border-blue-500/20" },
  green: { icon: "bg-green-500/10 text-green-500", border: "border-green-500/20" },
  purple: { icon: "bg-purple-500/10 text-purple-500", border: "border-purple-500/20" },
  orange: { icon: "bg-orange-500/10 text-orange-500", border: "border-orange-500/20" },
};

const ServicesSection = ({ onNavigate }: ServicesSectionProps) => {
  return (
    <div className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-16 border-b border-white/10 pb-8">
          <h2 className="text-3xl md:text-4xl font-medium tracking-tight mb-4 text-foreground">
            Nuestros Servicios
          </h2>
          <p className="text-neutral-400 max-w-2xl font-light">
            Ofrecemos soluciones integrales para todas sus necesidades administrativas, contables y legales.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service) => {
            const Icon = service.icon;
            const colors = colorClasses[service.color];

            return (
              <div
                key={service.title}
                className={`group border ${colors.border} bg-neutral-900/20 p-8 rounded-xl hover:bg-neutral-900/40 transition-all duration-300`}
              >
                <div
                  className={`w-12 h-12 rounded-lg ${colors.icon} flex items-center justify-center mb-6`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {service.title}
                </h3>
                <p className="text-neutral-400 text-sm leading-relaxed">
                  {service.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-16 p-8 bg-gradient-to-r from-red-900/20 to-black border border-red-900/30 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h3 className="text-xl font-medium text-foreground mb-2">
              ¿Necesita algo específico?
            </h3>
            <p className="text-neutral-400 text-sm">
              Gestionamos cualquier trámite ante la administración pública venezolana.
            </p>
          </div>
          <button
            onClick={() => onNavigate("contacto")}
            className="px-6 py-3 bg-primary hover:bg-red-700 text-foreground text-sm font-medium rounded transition-colors whitespace-nowrap"
          >
            Solicitar Presupuesto
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServicesSection;
