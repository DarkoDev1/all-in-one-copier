import { useRef } from "react";
import Navigation from "@/components/landing/Navigation";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesStrip from "@/components/landing/FeaturesStrip";
import ServicesSection from "@/components/landing/ServicesSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import ContactSection from "@/components/landing/ContactSection";
import Footer from "@/components/landing/Footer";

const LandingPage = () => {
  const serviciosRef = useRef<HTMLElement>(null);
  const testimoniosRef = useRef<HTMLElement>(null);
  const contactoRef = useRef<HTMLElement>(null);

  const scrollToSection = (section: string) => {
    const refs: Record<string, React.RefObject<HTMLElement>> = {
      servicios: serviciosRef,
      testimonios: testimoniosRef,
      contacto: contactoRef,
    };

    if (section === "inicio") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const ref = refs[section];
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navigation onNavigate={scrollToSection} />
      
      <main className="flex-grow pt-16">
        {/* Hero Section */}
        <HeroSection onNavigate={scrollToSection} />
        
        {/* Features Strip */}
        <FeaturesStrip />
        
        {/* Services Section */}
        <section ref={serviciosRef} id="servicios">
          <ServicesSection onNavigate={scrollToSection} />
        </section>
        
        {/* Testimonials Section */}
        <section ref={testimoniosRef} id="testimonios">
          <TestimonialsSection />
        </section>
        
        {/* Contact Section */}
        <section ref={contactoRef} id="contacto">
          <ContactSection />
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default LandingPage;
