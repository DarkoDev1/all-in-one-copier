import vybLogo from "@/assets/testimonials/vyb.png";
import marinLogo from "@/assets/testimonials/marin.png";
import tsolutionsLogo from "@/assets/testimonials/tsolutions.png";

import brasasGusLogo from "@/assets/testimonials/brasas-gus.png";
import picaderoWesternLogo from "@/assets/testimonials/picadero-western.png";
import andaraLogo from "@/assets/testimonials/andara.jpg";

const testimonials = [
  {
    name: "Bernardo Taravay",
    company: "V&B 179 Seguridad Integral, C.A.",
    text: "Cuando estuve apunto de cerrar mis servicios, hicieron un cambio increíble para mejorar mi estado financiero.",
    logo: vybLogo,
  },
  {
    name: "William Marín",
    company: "Servicios Automotriz Marín, F.P.",
    text: "Servicio rápido y oportuno.",
    logo: marinLogo,
  },
  {
    name: "Alexander Cordero",
    company: "Tsolutions, C.A.",
    text: "Son los contadores que me han brindado los resultados más transparentes de mi empresa.",
    logo: tsolutionsLogo,
  },
  {
    name: "Gustavo González",
    company: "Inversiones González G 751, F.P.",
    text: "Realizaron mi constitución de empresa, llevan mi contabilidad y la verdad excelente servicio.",
    logo: brasasGusLogo,
  },
  {
    name: "Winston Toro",
    company: "Inversiones Picadero Western, C.A.",
    text: "Excelente servicio, siempre atentos a las necesidades del cliente. Su profesionalismo y dedicación hacen la diferencia.",
    logo: picaderoWesternLogo,
  },
  {
    name: "Jorge Andara",
    company: "Servicios Técnicos Andara RDA, C.A.",
    text: "Un servicio impecable y muy oportuno, jamás había tenido mis estados financieros mes a mes.",
    logo: andaraLogo,
  },
];

const TestimonialsSection = () => {
  return (
    <div className="py-24 bg-neutral-900/30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-medium tracking-tight mb-4 text-foreground">
            Lo que dicen nuestros clientes
          </h2>
          <p className="text-neutral-400 max-w-xl mx-auto font-light">
            La confianza de nuestros clientes es nuestra mejor carta de
            presentación. Resultados reales en tiempos récords.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="group bg-background/50 border border-white/10 p-8 rounded-2xl flex flex-col justify-between hover-card"
            >
              <div className="mb-6">
                <p className="text-neutral-300 text-sm leading-relaxed italic">
                  "{testimonial.text}"
                </p>
              </div>
              <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-white">
                  <img
                    src={testimonial.logo}
                    alt={testimonial.company}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                  />
                </div>
                <div>
                  <h4 className="text-foreground text-sm font-medium">
                    {testimonial.name}
                  </h4>
                  <p className="text-xs text-neutral-500 mt-1">
                    {testimonial.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestimonialsSection;
