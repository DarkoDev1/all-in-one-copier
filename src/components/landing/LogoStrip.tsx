import logoStg from "@/assets/logo-stg.png";

const LogoStrip = () => {
  return (
    <div className="py-6 bg-neutral-900/50 overflow-hidden">
      <div className="flex animate-scroll-left">
        {[...Array(12)].map((_, index) => (
          <div key={index} className="flex-shrink-0 mx-12">
            <img
              src={logoStg}
              alt="Servicios Toro, Gil & Asociados"
              className="h-16 w-auto opacity-60 hover:opacity-100 transition-opacity duration-300"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default LogoStrip;
