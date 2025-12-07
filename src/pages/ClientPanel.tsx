import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, FileText, Download, FolderOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import logoStg from "@/assets/logo-stg.png";

interface ClientFile {
  id: string;
  client_name: string;
  file_name: string;
  file_path: string;
  file_size: number;
  uploaded_at: string;
}

const ClientPanel = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [files, setFiles] = useState<ClientFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const userName = localStorage.getItem("userName");

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role !== "client") {
      navigate("/login");
      return;
    }
    fetchFiles();
  }, [navigate]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("my-files-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "client_files",
        },
        (payload) => {
          if (
            payload.new &&
            (payload.new as ClientFile).client_name === userName
          ) {
            fetchFiles();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userName]);

  const fetchFiles = async () => {
    if (!userName) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("client_files")
        .select("*")
        .eq("client_name", userName)
        .order("uploaded_at", { ascending: false });

      if (error) throw error;
      setFiles(data || []);
    } catch (error) {
      console.error("Error fetching files:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los archivos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (file: ClientFile) => {
    try {
      const { data, error } = await supabase.storage
        .from("client-documents")
        .download(file.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Descarga iniciada",
        description: file.file_name,
      });
    } catch (error) {
      console.error("Error downloading file:", error);
      toast({
        title: "Error",
        description: "No se pudo descargar el archivo",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    navigate("/");
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src={logoStg} 
              alt="Toro Gil Servicios" 
              className="h-10 w-auto object-contain"
            />
            <div>
              <span className="text-sm font-semibold text-foreground">
                Portal de Cliente
              </span>
              <p className="text-[10px] text-neutral-500">{userName}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-foreground text-xs font-medium rounded hover:bg-white/10 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Cerrar Sesión
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-neutral-900/30 border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <FolderOpen className="w-5 h-5 text-primary" />
            <h2 className="font-medium text-foreground">Mis Documentos</h2>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-white/10 rounded-xl">
              <FileText className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
              <p className="text-neutral-400 text-sm">
                No tiene documentos disponibles
              </p>
              <p className="text-neutral-600 text-xs mt-1">
                Sus documentos aparecerán aquí cuando estén listos
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {file.file_name}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {formatFileSize(file.file_size || 0)} •{" "}
                        {new Date(file.uploaded_at).toLocaleDateString("es-VE")}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownload(file)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-red-500 text-foreground text-xs font-medium rounded transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Descargar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientPanel;
