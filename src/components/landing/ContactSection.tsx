import { useState } from "react";
import { Phone, Mail, MapPin, ChevronDown, Instagram, FileText, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ContactSection = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    serviceType: "",
    details: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(
        "https://api-n8n.mynexusdigital.com/webhook/Formulario",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nombre: formData.name,
            telefono: formData.phone,
            email: formData.email,
            tipoServicio: formData.serviceType,
            detalles: formData.details,
            fechaEnvio: new Date().toISOString(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Error al enviar el formulario");
      }

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
    } catch (error) {
      console.error("Error sending form:", error);
      toast({
        title: "Error",
        description: "No se pudo enviar el mensaje. Intente nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-24 bg-background">
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
                  <p className="text-foreground text-sm">(+58) 424.195.09.32</p>
                  <p className="text-foreground text-sm">(+58) 412.970.35.16</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-neutral-900/50 border border-white/5 rounded-lg">
                <div className="w-10 h-10 bg-primary/10 text-primary rounded flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-neutral-500 uppercase font-semibold mb-1">
                    Correo Electrónico
                  </p>
                  <p className="text-foreground text-sm">torogilservicios@gmail.com</p>
                  <p className="text-foreground text-sm">felixmtoroo@gmail.com</p>
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
                  <p className="text-foreground text-sm">Caracas - Miranda</p>
                  <p className="text-neutral-400 text-sm">Baruta, Zona La Trinidad</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-neutral-900/50 border border-white/5 rounded-lg">
                <div className="w-10 h-10 bg-primary/10 text-primary rounded flex items-center justify-center">
                  <Instagram className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-neutral-500 uppercase font-semibold">
                    Redes Sociales
                  </p>
                  <p className="text-foreground text-sm">@torogilservicios</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-neutral-900/50 border border-white/5 rounded-lg">
                <div className="w-10 h-10 bg-primary/10 text-primary rounded flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-neutral-500 uppercase font-semibold mb-1">
                    RIF
                  </p>
                  <p className="text-foreground text-sm font-mono">J-50226323-3</p>
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
                    <option value="contables">Servicios Contables</option>
                    <option value="administrativos">Servicios Administrativos</option>
                    <option value="constituciones">Constitución de Empresas</option>
                    <option value="otros">Otros Servicios</option>
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
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-red-500 text-foreground font-medium text-sm py-3 rounded transition-all shadow-lg shadow-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Enviar Mensaje"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactSection;
