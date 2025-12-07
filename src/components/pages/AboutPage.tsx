const AboutPage = () => {
  return (
    <section className="page-enter pt-12 pb-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-medium tracking-tight mb-6 text-foreground">
                Sobre Servicios Toro Gil
              </h2>
              <p className="text-neutral-400 leading-relaxed font-light mb-6">
                Somos una firma dedicada a la prestación de servicios en el área
                de gestión de trámites y documentación legal. Nacimos con la
                misión de facilitar la vida de los ciudadanos y empresas en
                Venezuela, eliminando las barreras burocráticas a través de un
                servicio eficiente y ético.
              </p>
              <p className="text-neutral-400 leading-relaxed font-light">
                Nuestro equipo está conformado por profesionales en
                administración, contaduría y derecho, garantizando que cada
                documento gestionado cumpla estrictamente con las normativas
                vigentes del país.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="border-l-2 border-primary pl-6">
                <h4 className="text-foreground font-medium mb-1">Misión</h4>
                <p className="text-xs text-neutral-500">
                  Proveer soluciones rápidas y confiables en gestión documental.
                </p>
              </div>
              <div className="border-l-2 border-white/20 pl-6">
                <h4 className="text-foreground font-medium mb-1">Visión</h4>
                <p className="text-xs text-neutral-500">
                  Ser la referencia nacional en servicios de consultoría
                  administrativa.
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-red-900 rounded-lg blur opacity-20"></div>
            <img
              src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2070&auto=format&fit=crop"
              alt="Equipo de trabajo"
              className="relative w-full rounded-lg shadow-2xl border border-white/10 grayscale hover:grayscale-0 transition-all duration-700"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutPage;
