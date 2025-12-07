import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import HomePage from "@/components/pages/HomePage";
import ServicesPage from "@/components/pages/ServicesPage";
import AboutPage from "@/components/pages/AboutPage";
import TestimonialsPage from "@/components/pages/TestimonialsPage";
import ContactPage from "@/components/pages/ContactPage";

const Index = () => {
  const [currentPage, setCurrentPage] = useState("inicio");

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    // Set initial page
    setCurrentPage("inicio");
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case "inicio":
        return <HomePage onNavigate={handleNavigate} />;
      case "servicios":
        return <ServicesPage onNavigate={handleNavigate} />;
      case "nosotros":
        return <AboutPage />;
      case "testimonios":
        return <TestimonialsPage />;
      case "contacto":
        return <ContactPage />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navigation currentPage={currentPage} onNavigate={handleNavigate} />
      <main className="flex-grow pt-16 relative min-h-screen">
        {renderPage()}
      </main>
      <Footer />
    </div>
  );
};

export default Index;
