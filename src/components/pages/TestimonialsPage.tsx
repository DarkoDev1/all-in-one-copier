import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Carlos Mendoza",
    service: "Trámite SAIME",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=100&h=100",
    text: '"Excelente servicio, muy atentos y responsables. Me ayudaron con mi pasaporte y la prórroga de manera muy rápida cuando pensaba que sería imposible. 100% recomendados."',
  },
  {
    name: "Ana Rodríguez",
    service: "Registro Mercantil",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?fit=crop&w=100&h=100",
    text: '"Gracias a Servicios Toro Gil pude registrar mi PYME sin complicaciones. Se encargaron de todo el papeleo en el Registro y el SENIAT. Muy profesionales."',
  },
  {
    name: "Miguel Ángel P.",
    service: "Apostilla / GTU",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?fit=crop&w=100&h=100",
    text: '"Necesitaba apostillar mis documentos universitarios para emigrar y ellos lo hicieron todo. Me ahorraron el viaje a Caracas y las colas. Súper confiables."',
  },
];

const TestimonialsPage = () => {
  return (
    <section className="page-enter pt-12 pb-24">
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
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="bg-neutral-900/30 border border-white/10 p-8 rounded-2xl flex flex-col justify-between"
            >
              <div className="mb-6">
                <div className="flex text-primary mb-4 gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-neutral-300 text-sm leading-relaxed">
                  {testimonial.text}
                </p>
              </div>
              <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                <img
                  src={testimonial.image}
                  className="w-10 h-10 rounded-full object-cover grayscale"
                  alt={testimonial.name}
                />
                <div>
                  <h4 className="text-foreground text-sm font-medium">
                    {testimonial.name}
                  </h4>
                  <p className="text-xs text-neutral-500">
                    {testimonial.service}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsPage;
