import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, LogIn, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import logoStg from "@/assets/logo-stg.png";

// Admin credentials
const ADMIN_USER = "Felix Manuel Toro Gil";
const ADMIN_PASSWORD = "Mango78.";

const LoginPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Check if admin
      if (username === ADMIN_USER && password === ADMIN_PASSWORD) {
        localStorage.setItem("userRole", "admin");
        localStorage.setItem("userName", username);
        toast({
          title: "Bienvenido",
          description: "Acceso de administrador concedido.",
        });
        navigate("/admin");
        return;
      }

      // Check against Google Sheets for clients
      const { data, error } = await supabase.functions.invoke("google-sheets");

      if (error) {
        throw new Error("Error al conectar con el servidor");
      }

      const clients = data?.clients || [];
      const client = clients.find(
        (c: { name: string; password: string }) =>
          c.name === username && c.password === password
      );

      if (client) {
        localStorage.setItem("userRole", "client");
        localStorage.setItem("userName", username);
        toast({
          title: "Bienvenido",
          description: `Hola, ${username}`,
        });
        navigate("/cliente");
      } else {
        toast({
          title: "Error",
          description: "Credenciales incorrectas",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Error",
        description: "No se pudo iniciar sesión. Intente más tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      {/* Background FX */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-[120px]"></div>
        <div className="absolute inset-0 grid-pattern"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-neutral-400 hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Volver al inicio</span>
        </button>

        <div className="bg-neutral-900/50 border border-white/10 rounded-2xl p-8">
          <div className="text-center mb-8">
            <img 
              src={logoStg} 
              alt="Servicios Toro, Gil & Asociados" 
              className="w-16 h-16 mx-auto mb-4 object-contain"
            />
            <h1 className="text-2xl font-medium text-foreground">
              Iniciar Sesión
            </h1>
            <p className="text-sm text-neutral-400 mt-2">
              Ingrese sus credenciales para continuar
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-400">
                Nombre de Usuario
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none transition-colors"
                placeholder="Ingrese su nombre completo"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-400">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none transition-colors pr-12"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-foreground font-medium text-sm py-3 rounded transition-all shadow-lg shadow-red-900/20 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin"></div>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Iniciar Sesión
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
