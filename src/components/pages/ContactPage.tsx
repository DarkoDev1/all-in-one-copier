import { useState } from "react";
import { Phone, Mail, MapPin, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ContactPage = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    serviceType: "",
    details: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Mensaje enviado",
      description: "Pronto le contactaremos.",
    });
    setFormData({
      name: "",
      phone: "",
      email: "",
      serviceType: "",
      details: "",
    });
  };

  return (
    <section className="page-enter pt-12 pb-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-medium tracking-tight mb-6 text-foreground">
              Contáctenos
            </h2>
            <p className="text-neutral-400 mb-8 font-light">
              Estamos listos para atender sus requerimientos. Complete el
              formulario o utilice nuestros canales directos.
            </p>

            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-neutral-900/50 border border-white/5 rounded-lg">
                <div className="w-10 h-10 bg-primary/10 text-primary rounded flex items-center justify-center">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-neutral-500 uppercase font-semibold">
                    Teléfono / WhatsApp
                  </p>
                  <p className="text-foreground">+58 412-0000000</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-neutral-900/50 border border-white/5 rounded-lg">
                <div className="w-10 h-10 bg-primary/10 text-primary rounded flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-neutral-500 uppercase font-semibold">
                    Correo Electrónico
                  </p>
                  <p className="text-foreground">contacto@serviciostorogil.com</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-neutral-900/50 border border-white/5 rounded-lg">
                <div className="w-10 h-10 bg-primary/10 text-primary rounded flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-neutral-500 uppercase font-semibold">
                    Ubicación
                  </p>
                  <p className="text-foreground">Venezuela</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-neutral-900/30 border border-white/10 p-8 rounded-2xl">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-400">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full bg-black/50 border border-white/10 rounded px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none transition-colors"
                    placeholder="Su nombre"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-400">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full bg-black/50 border border-white/10 rounded px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none transition-colors"
                    placeholder="0412-1234567"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-400">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full bg-black/50 border border-white/10 rounded px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none transition-colors"
                  placeholder="ejemplo@correo.com"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-400">
                  Tipo de Trámite
                </label>
                <div className="relative">
                  <select
                    value={formData.serviceType}
                    onChange={(e) =>
                      setFormData({ ...formData, serviceType: e.target.value })
                    }
                    className="w-full bg-black/50 border border-white/10 rounded px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none transition-colors appearance-none"
                  >
                    <option value="">Seleccione una opción</option>
                    <option value="seniat">SENIAT / Fiscal</option>
                    <option value="saime">SAIME / Identificación</option>
                    <option value="saren">SAREN / Registros</option>
                    <option value="apostilla">Apostilla / Legalización</option>
                    <option value="otro">Otro</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none w-3.5 h-3.5" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-400">
                  Detalles
                </label>
                <textarea
                  rows={4}
                  value={formData.details}
                  onChange={(e) =>
                    setFormData({ ...formData, details: e.target.value })
                  }
                  className="w-full bg-black/50 border border-white/10 rounded px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none transition-colors resize-none"
                  placeholder="Describa brevemente lo que necesita..."
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-primary hover:bg-red-500 text-foreground font-medium text-sm py-3 rounded transition-all shadow-lg shadow-red-900/20"
              >
                Enviar Mensaje
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactPage;
