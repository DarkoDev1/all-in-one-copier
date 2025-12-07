import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  Users,
  Upload,
  FileText,
  Trash2,
  RefreshCw,
  Download,
  Search,
} from "lucide-react";
import logoStg from "@/assets/logo-stg.png";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Client {
  name: string;
  password: string;
}

interface ClientFile {
  id: string;
  client_name: string;
  file_name: string;
  file_path: string;
  file_size: number;
  uploaded_at: string;
}

const AdminPanel = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [clientFiles, setClientFiles] = useState<ClientFile[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role !== "admin") {
      navigate("/login");
      return;
    }
    fetchClients();
  }, [navigate]);

  useEffect(() => {
    if (selectedClient) {
      fetchClientFiles(selectedClient);
    }
  }, [selectedClient]);

  // Realtime subscription for files
  useEffect(() => {
    const channel = supabase
      .channel("client-files-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "client_files",
        },
        () => {
          if (selectedClient) {
            fetchClientFiles(selectedClient);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedClient]);

  const fetchClients = async () => {
    setIsLoadingClients(true);
    try {
      const { data, error } = await supabase.functions.invoke("google-sheets");
      if (error) throw error;
      setClients(data?.clients || []);
    } catch (error) {
      console.error("Error fetching clients:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los clientes",
        variant: "destructive",
      });
    } finally {
      setIsLoadingClients(false);
    }
  };

  const fetchClientFiles = async (clientName: string) => {
    setIsLoadingFiles(true);
    try {
      const { data, error } = await supabase
        .from("client_files")
        .select("*")
        .eq("client_name", clientName)
        .order("uploaded_at", { ascending: false });

      if (error) throw error;
      setClientFiles(data || []);
    } catch (error) {
      console.error("Error fetching files:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los archivos",
        variant: "destructive",
      });
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedClient || !e.target.files?.length) return;

    const file = e.target.files[0];
    setIsUploading(true);

    try {
      const filePath = `${selectedClient}/${Date.now()}_${file.name}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("client-documents")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Add record to database
      const { error: dbError } = await supabase.from("client_files").insert({
        client_name: selectedClient,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        uploaded_by: localStorage.getItem("userName") || "admin",
      });

      if (dbError) throw dbError;

      toast({
        title: "Archivo subido",
        description: `${file.name} se subió correctamente`,
      });

      fetchClientFiles(selectedClient);
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Error",
        description: "No se pudo subir el archivo",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleDeleteFile = async (file: ClientFile) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("client-documents")
        .remove([file.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from("client_files")
        .delete()
        .eq("id", file.id);

      if (dbError) throw dbError;

      toast({
        title: "Archivo eliminado",
        description: `${file.file_name} fue eliminado`,
      });

      fetchClientFiles(selectedClient!);
    } catch (error) {
      console.error("Error deleting file:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el archivo",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    navigate("/");
  };

  const filteredClients = clients.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src={logoStg} 
              alt="Toro Gil Servicios" 
              className="h-10 w-auto object-contain"
            />
            <div>
              <span className="text-sm font-semibold text-foreground">
                Panel de Administrador
              </span>
              <p className="text-[10px] text-neutral-500">
                {localStorage.getItem("userName")}
              </p>
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

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Clients List */}
          <div className="lg:col-span-1">
            <div className="bg-neutral-900/30 border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  <h2 className="font-medium text-foreground">Clientes</h2>
                </div>
                <button
                  onClick={fetchClients}
                  className="p-2 hover:bg-white/10 rounded transition-colors"
                  title="Actualizar lista"
                >
                  <RefreshCw
                    className={`w-4 h-4 text-neutral-400 ${
                      isLoadingClients ? "animate-spin" : ""
                    }`}
                  />
                </button>
              </div>

              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar cliente..."
                  className="w-full bg-black/50 border border-white/10 rounded pl-10 pr-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {isLoadingClients ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                  </div>
                ) : filteredClients.length === 0 ? (
                  <p className="text-neutral-500 text-sm text-center py-8">
                    No hay clientes disponibles
                  </p>
                ) : (
                  filteredClients.map((client) => (
                    <button
                      key={client.name}
                      onClick={() => setSelectedClient(client.name)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedClient === client.name
                          ? "bg-primary/20 border border-primary/30"
                          : "bg-white/5 border border-transparent hover:bg-white/10"
                      }`}
                    >
                      <p className="text-sm font-medium text-foreground truncate">
                        {client.name}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Files Panel */}
          <div className="lg:col-span-2">
            <div className="bg-neutral-900/30 border border-white/10 rounded-xl p-6">
              {selectedClient ? (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="font-medium text-foreground">
                        Archivos de {selectedClient}
                      </h2>
                      <p className="text-xs text-neutral-500 mt-1">
                        {clientFiles.length} archivo(s)
                      </p>
                    </div>
                    <label className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-red-500 text-foreground text-xs font-medium rounded cursor-pointer transition-colors">
                      {isUploading ? (
                        <div className="w-4 h-4 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin"></div>
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      <span>Subir Archivo</span>
                      <input
                        type="file"
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={isUploading}
                      />
                    </label>
                  </div>

                  {isLoadingFiles ? (
                    <div className="flex items-center justify-center py-16">
                      <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    </div>
                  ) : clientFiles.length === 0 ? (
                    <div className="text-center py-16 border-2 border-dashed border-white/10 rounded-xl">
                      <FileText className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
                      <p className="text-neutral-400 text-sm">
                        No hay archivos para este cliente
                      </p>
                      <p className="text-neutral-600 text-xs mt-1">
                        Suba archivos usando el botón superior
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {clientFiles.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="w-8 h-8 text-primary" />
                            <div>
                              <p className="text-sm font-medium text-foreground">
                                {file.file_name}
                              </p>
                              <p className="text-xs text-neutral-500">
                                {formatFileSize(file.file_size || 0)} •{" "}
                                {new Date(file.uploaded_at).toLocaleDateString(
                                  "es-VE"
                                )}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteFile(file)}
                            className="p-2 text-red-500 hover:bg-red-500/10 rounded transition-colors"
                            title="Eliminar archivo"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-16">
                  <Users className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
                  <p className="text-neutral-400 text-sm">
                    Seleccione un cliente para ver sus archivos
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
