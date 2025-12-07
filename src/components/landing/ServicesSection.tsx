import {
  Calculator,
  Building,
  Scroll,
  UserCheck,
  Award,
  BarChart,
  Check,
  Landmark,
  Users,
  FileSignature,
  Globe,
  Stamp,
  Briefcase,
} from "lucide-react";

interface ServicesSectionProps {
  onNavigate: (section: string) => void;
}

const services = [
  {
    title: "Trámites Fiscales (SENIAT)",
    icon: Calculator,
    bgIcon: Landmark,
    color: "red",
    items: [
      "Inscripción y actualización de RIF",
      "Declaración de ISLR e IVA",
      "Gestión de Sucesiones",
    ],
  },
  {
    title: "Entes Parafiscales",
    icon: Building,
    bgIcon: Users,
    color: "blue",
    items: ["IVSS (Seguro Social)", "FAOV (Banavih)", "INCES y MINTRA"],
  },
  {
    title: "Registros y Notarías (SAREN)",
    icon: Scroll,
    bgIcon: FileSignature,
    color: "purple",
    items: [
      "Actas Constitutivas (PYMES/C.A.)",
      "Legalizaciones y Ventas",
      "Registro Mercantil",
    ],
  },
  {
    title: "Identificación (SAIME)",
    icon: UserCheck,
    bgIcon: Globe,
    color: "green",
    items: ["Citas de Pasaportes", "Prórrogas", "Datos Filiatorios"],
  },
  {
    title: "Apostilla y Legalización",
    icon: Award,
    bgIcon: Stamp,
    color: "orange",
    items: [
      "Apostilla de La Haya",
      "Legalización de Títulos (GTU)",
      "Antecedentes Penales",
    ],
  },
  {
    title: "Gestión Corporativa",
    icon: BarChart,
    bgIcon: Briefcase,
    color: "teal",
    items: [
      "RNC (Registro Nacional de Contratistas)",
      "Balances Contables",
      "Patentes Municipales (Alcaldías)",
    ],
  },
];

const colorClasses: Record<string, { icon: string; check: string }> = {
  red: { icon: "bg-red-500/10 text-red-500", check: "text-red-500" },
  blue: { icon: "bg-blue-500/10 text-blue-500", check: "text-blue-500" },
  purple: { icon: "bg-purple-500/10 text-purple-500", check: "text-purple-500" },
  green: { icon: "bg-green-500/10 text-green-500", check: "text-green-500" },
  orange: { icon: "bg-orange-500/10 text-orange-500", check: "text-orange-500" },
  teal: { icon: "bg-teal-500/10 text-teal-500", check: "text-teal-500" },
};

const ServicesSection = ({ onNavigate }: ServicesSectionProps) => {
  return (
    <div className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-16 border-b border-white/10 pb-8">
          <h2 className="text-3xl md:text-4xl font-medium tracking-tight mb-4 text-foreground">
            Catálogo de Servicios
          </h2>
          <p className="text-neutral-400 max-w-2xl font-light">
            Cubrimos todas las necesidades administrativas y legales requeridas
            por los entes gubernamentales venezolanos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => {
            const Icon = service.icon;
            const BgIcon = service.bgIcon;
            const colors = colorClasses[service.color];

            return (
              <div
                key={service.title}
                className="group border border-white/10 bg-neutral-900/20 p-8 rounded-xl hover-card relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <BgIcon className="w-16 h-16" />
                </div>
                <div
                  className={`w-10 h-10 rounded ${colors.icon} flex items-center justify-center mb-6`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  {service.title}
                </h3>
                <ul className="space-y-2 text-sm text-neutral-400">
                  {service.items.map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <Check className={`w-4 h-4 ${colors.check}`} />
                      {item}
                    </li>
                  ))}
                </ul>
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
              Gestionamos cualquier trámite ante la administración pública
              venezolana.
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
