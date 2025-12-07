import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, LogIn, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import logoStg from "@/assets/logo-stg.png";
import { z } from "zod";

// Validation schema
const loginSchema = z.object({
  clientName: z.string().min(1, "Nombre de usuario requerido"),
  password: z.string().min(1, "Contraseña requerida"),
});

const LoginPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, userRole, isLoading: authLoading } = useAuth();
  const [clientName, setClientName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && user && userRole) {
      if (userRole.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/cliente');
      }
    }
  }, [user, userRole, authLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate input
      const validation = loginSchema.safeParse({ clientName, password });
      if (!validation.success) {
        toast({
          title: "Error",
          description: validation.error.errors[0].message,
          variant: "destructive",
        });
        return;
      }

      // Call authentication edge function - unified login for both admin and clients
      const { data, error } = await supabase.functions.invoke("authenticate", {
        body: { 
          email: `${clientName.toLowerCase().replace(/[^a-z0-9]/g, '_')}@client.torogil.local`, 
          password, 
          clientName 
        },
      });

      if (error) {
        throw new Error(error.message || "Error de autenticación");
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.session) {
        // Set the session in the Supabase client
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });

        toast({
          title: "Bienvenido",
          description: data.role === 'admin' 
            ? "Acceso de administrador concedido."
            : `Hola, ${data.clientName || clientName}`,
        });

        // Navigate based on role
        if (data.role === 'admin') {
          navigate("/admin");
        } else {
          navigate("/cliente");
        }
      } else {
        throw new Error("No se recibió sesión válida");
      }
    } catch (error: unknown) {
      console.error("Login error:", error);
      const errorMessage = error instanceof Error ? error.message : "No se pudo iniciar sesión";
      toast({
        title: "Error",
        description: errorMessage === "Invalid credentials" 
          ? "Credenciales incorrectas" 
          : errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

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
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
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
