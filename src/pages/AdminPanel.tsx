import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  Users,
  Upload,
  FileText,
  Trash2,
  RefreshCw,
  Search,
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Plus,
  Calendar,
  Download,
  ArrowLeft,
} from "lucide-react";
import logoStg from "@/assets/logo-stg.png";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Client {
  name: string;
}

interface ClientFolder {
  id: string;
  client_name: string;
  folder_name: string;
  parent_id: string | null;
  folder_type: string;
  is_default: boolean;
  created_at: string;
}

interface ClientFile {
  id: string;
  client_name: string;
  file_name: string;
  file_path: string;
  file_size: number;
  uploaded_at: string;
  folder_id: string | null;
}

interface FolderTreeNode extends ClientFolder {
  children: FolderTreeNode[];
  files: ClientFile[];
  isExpanded?: boolean;
}

const AdminPanel = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAdmin, isLoading: authLoading, signOut } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [folders, setFolders] = useState<ClientFolder[]>([]);
  const [files, setFiles] = useState<ClientFile[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<ClientFolder | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const [isLoadingFolders, setIsLoadingFolders] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Dialog states
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [showNewYearDialog, setShowNewYearDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newYear, setNewYear] = useState(new Date().getFullYear().toString());
  const [yearType, setYearType] = useState<"admin" | "contab">("admin");
  const [deletePrevious, setDeletePrevious] = useState(false);

  // Auth check
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate("/login");
    }
  }, [user, isAdmin, authLoading, navigate]);

  // Fetch clients on mount
  useEffect(() => {
    if (user && isAdmin) {
      fetchClients();
    }
  }, [user, isAdmin]);

  // Fetch folders when client changes
  useEffect(() => {
    if (selectedClient) {
      fetchFoldersAndFiles(selectedClient);
    }
  }, [selectedClient]);

  // Realtime subscription
  useEffect(() => {
    const foldersChannel = supabase
      .channel("folders-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "client_folders" },
        () => {
          if (selectedClient) fetchFoldersAndFiles(selectedClient);
        }
      )
      .subscribe();

    const filesChannel = supabase
      .channel("files-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "client_files" },
        () => {
          if (selectedClient) fetchFoldersAndFiles(selectedClient);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(foldersChannel);
      supabase.removeChannel(filesChannel);
    };
  }, [selectedClient]);

  const fetchClients = async () => {
    setIsLoadingClients(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers = session?.access_token
        ? { Authorization: `Bearer ${session.access_token}` }
        : undefined;

      const { data, error } = await supabase.functions.invoke(
        "get-clients",
        headers ? { headers } : {}
      );

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

  const fetchFoldersAndFiles = async (clientName: string) => {
    setIsLoadingFolders(true);
    try {
      // Check if folders exist, if not create default ones
      const { data: existingFolders, error: checkError } = await supabase
        .from("client_folders")
        .select("id")
        .eq("client_name", clientName)
        .limit(1);

      if (checkError) throw checkError;

      if (!existingFolders || existingFolders.length === 0) {
        // Create default folders
        await supabase.rpc("create_default_folders_for_client", {
          _client_name: clientName,
          _year: new Date().getFullYear().toString(),
        });
      }

      // Fetch folders
      const { data: foldersData, error: foldersError } = await supabase
        .from("client_folders")
        .select("*")
        .eq("client_name", clientName)
        .order("folder_name");

      if (foldersError) throw foldersError;

      // Fetch files
      const { data: filesData, error: filesError } = await supabase
        .from("client_files")
        .select("*")
        .eq("client_name", clientName)
        .order("uploaded_at", { ascending: false });

      if (filesError) throw filesError;

      setFolders(foldersData || []);
      setFiles(filesData || []);
    } catch (error) {
      console.error("Error fetching folders/files:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las carpetas",
        variant: "destructive",
      });
    } finally {
      setIsLoadingFolders(false);
    }
  };

  const MONTH_ORDER: Record<string, number> = {
    "Enero": 1, "Febrero": 2, "Marzo": 3, "Abril": 4,
    "Mayo": 5, "Junio": 6, "Julio": 7, "Agosto": 8,
    "Septiembre": 9, "Octubre": 10, "Noviembre": 11, "Diciembre": 12,
  };

  const buildFolderTree = useCallback((): FolderTreeNode[] => {
    const folderMap = new Map<string, FolderTreeNode>();
    
    // Initialize all folders
    folders.forEach((folder) => {
      folderMap.set(folder.id, {
        ...folder,
        children: [],
        files: files.filter((f) => f.folder_id === folder.id),
        isExpanded: expandedFolders.has(folder.id),
      });
    });

    const rootFolders: FolderTreeNode[] = [];

    // Build tree
    folders.forEach((folder) => {
      const node = folderMap.get(folder.id)!;
      if (folder.parent_id && folderMap.has(folder.parent_id)) {
        folderMap.get(folder.parent_id)!.children.push(node);
      } else if (!folder.parent_id) {
        rootFolders.push(node);
      }
    });

    // Sort children
    const sortChildren = (nodes: FolderTreeNode[]): FolderTreeNode[] => {
      return nodes
        .map((node) => ({
          ...node,
          children: sortChildren(node.children),
        }))
        .sort((a, b) => {
          // Years descending
          if (a.folder_type === "year" && b.folder_type === "year") {
            return b.folder_name.localeCompare(a.folder_name);
          }
          // Months by calendar order
          if (a.folder_type === "month" && b.folder_type === "month") {
            return (MONTH_ORDER[a.folder_name] || 99) - (MONTH_ORDER[b.folder_name] || 99);
          }
          // Root folders: Administración first
          if (a.folder_type === "root" && b.folder_type === "root") {
            if (a.folder_name === "Administración") return -1;
            if (b.folder_name === "Administración") return 1;
          }
          return a.folder_name.localeCompare(b.folder_name);
        });
    };

    return sortChildren(rootFolders);
  }, [folders, files, expandedFolders]);

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  const handleCreateFolder = async () => {
    if (!selectedClient || !newFolderName.trim()) return;

    try {
      const { error } = await supabase.from("client_folders").insert({
        client_name: selectedClient,
        folder_name: newFolderName.trim(),
        parent_id: selectedFolder?.id || null,
        folder_type: "custom",
        is_default: false,
      });

      if (error) throw error;

      toast({ title: "Carpeta creada", description: newFolderName });
      setNewFolderName("");
      setShowNewFolderDialog(false);
      fetchFoldersAndFiles(selectedClient);
    } catch (error) {
      console.error("Error creating folder:", error);
      toast({
        title: "Error",
        description: "No se pudo crear la carpeta",
        variant: "destructive",
      });
    }
  };

  const handleCreateYear = async () => {
    if (!selectedClient || !newYear.trim()) return;

    try {
      // Find the root folder
      const rootFolderName = yearType === "admin" ? "Administración" : "Contabilidad";
      const rootFolder = folders.find(
        (f) => f.folder_name === rootFolderName && f.parent_id === null
      );

      if (!rootFolder) {
        toast({
          title: "Error",
          description: `No se encontró la carpeta ${rootFolderName}`,
          variant: "destructive",
        });
        return;
      }

      if (deletePrevious) {
        // Get previous year folders
        const { data: yearFolders } = await supabase
          .from("client_folders")
          .select("id")
          .eq("client_name", selectedClient)
          .eq("parent_id", rootFolder.id)
          .eq("folder_type", "year")
          .neq("folder_name", newYear);

        if (yearFolders && yearFolders.length > 0) {
          const yearIds = yearFolders.map((f) => f.id);
          
          // Delete files in those folders recursively
          const { data: allSubfolders } = await supabase
            .from("client_folders")
            .select("id")
            .eq("client_name", selectedClient);
            
          // This will cascade delete due to foreign key
          await supabase
            .from("client_folders")
            .delete()
            .in("id", yearIds);
        }
      }

      // Create new year structure
      if (yearType === "admin") {
        // Create year folder
        const { data: yearFolder, error: yearError } = await supabase
          .from("client_folders")
          .insert({
            client_name: selectedClient,
            folder_name: newYear,
            parent_id: rootFolder.id,
            folder_type: "year",
            is_default: true,
          })
          .select()
          .single();

        if (yearError) throw yearError;

        // Create subfolders
        await supabase.from("client_folders").insert([
          { client_name: selectedClient, folder_name: "Faov", parent_id: yearFolder.id, folder_type: "category", is_default: true },
          { client_name: selectedClient, folder_name: "IVSS", parent_id: yearFolder.id, folder_type: "category", is_default: true },
          { client_name: selectedClient, folder_name: "Patente", parent_id: yearFolder.id, folder_type: "category", is_default: true },
          { client_name: selectedClient, folder_name: "Inces", parent_id: yearFolder.id, folder_type: "category", is_default: true },
        ]);
      } else {
        // Contabilidad structure
        const { data: yearFolder, error: yearError } = await supabase
          .from("client_folders")
          .insert({
            client_name: selectedClient,
            folder_name: newYear,
            parent_id: rootFolder.id,
            folder_type: "year",
            is_default: true,
          })
          .select()
          .single();

        if (yearError) throw yearError;

        // Create Estado Financiero
        const { data: estadoFolder, error: estadoError } = await supabase
          .from("client_folders")
          .insert({
            client_name: selectedClient,
            folder_name: "Estado Financiero",
            parent_id: yearFolder.id,
            folder_type: "category",
            is_default: true,
          })
          .select()
          .single();

        if (estadoError) throw estadoError;

        // Create months
        const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
        await supabase.from("client_folders").insert(
          months.map((month) => ({
            client_name: selectedClient,
            folder_name: month,
            parent_id: estadoFolder.id,
            folder_type: "month",
            is_default: true,
          }))
        );
      }

      toast({ title: "Año creado", description: `${rootFolderName} - ${newYear}` });
      setShowNewYearDialog(false);
      setDeletePrevious(false);
      fetchFoldersAndFiles(selectedClient);
    } catch (error) {
      console.error("Error creating year:", error);
      toast({
        title: "Error",
        description: "No se pudo crear el año",
        variant: "destructive",
      });
    }
  };

  const handleDeleteFolder = async (folder: ClientFolder) => {
    if (!confirm(`¿Eliminar la carpeta "${folder.folder_name}" y todo su contenido?`)) return;

    try {
      const { error } = await supabase
        .from("client_folders")
        .delete()
        .eq("id", folder.id);

      if (error) throw error;

      toast({ title: "Carpeta eliminada", description: folder.folder_name });
      if (selectedFolder?.id === folder.id) setSelectedFolder(null);
      fetchFoldersAndFiles(selectedClient!);
    } catch (error) {
      console.error("Error deleting folder:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la carpeta",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedClient || !e.target.files?.length || !user) return;

    const file = e.target.files[0];
    setIsUploading(true);

    try {
      const folderPath = selectedFolder ? `${selectedFolder.id}/` : "";
      const filePath = `${selectedClient}/${folderPath}${Date.now()}_${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("client-documents")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase.from("client_files").insert({
        client_name: selectedClient,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        uploaded_by: user.email || "admin",
        user_id: user.id,
        folder_id: selectedFolder?.id || null,
      });

      if (dbError) throw dbError;

      toast({ title: "Archivo subido", description: file.name });
      fetchFoldersAndFiles(selectedClient);
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
    if (!confirm(`¿Eliminar "${file.file_name}"?`)) return;

    try {
      await supabase.storage.from("client-documents").remove([file.file_path]);
      await supabase.from("client_files").delete().eq("id", file.id);

      toast({ title: "Archivo eliminado", description: file.file_name });
      fetchFoldersAndFiles(selectedClient!);
    } catch (error) {
      console.error("Error deleting file:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el archivo",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    await signOut();
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

  const getBreadcrumb = (): ClientFolder[] => {
    if (!selectedFolder) return [];
    const path: ClientFolder[] = [];
    let current: ClientFolder | undefined = selectedFolder;
    
    while (current) {
      path.unshift(current);
      current = folders.find((f) => f.id === current?.parent_id);
    }
    
    return path;
  };

  const currentFolderFiles = selectedFolder
    ? files.filter((f) => f.folder_id === selectedFolder.id)
    : files.filter((f) => !f.folder_id);

  const renderFolderTree = (nodes: FolderTreeNode[], level = 0) => {
    return nodes.map((node) => (
      <div key={node.id}>
        <div
          className={`flex items-center gap-1 py-1.5 px-2 rounded cursor-pointer hover:bg-white/10 transition-colors ${
            selectedFolder?.id === node.id ? "bg-primary/20 border border-primary/30" : ""
          }`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
        >
          {node.children.length > 0 ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFolder(node.id);
              }}
              className="p-0.5 hover:bg-white/10 rounded"
            >
              {expandedFolders.has(node.id) ? (
                <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
              )}
            </button>
          ) : (
            <div className="w-4" />
          )}
          
          <button
            onClick={() => {
              setSelectedFolder(node);
              if (node.children.length > 0) toggleFolder(node.id);
            }}
            className="flex items-center gap-2 flex-1 min-w-0"
          >
            {expandedFolders.has(node.id) ? (
              <FolderOpen className="w-4 h-4 text-yellow-500 flex-shrink-0" />
            ) : (
              <Folder className="w-4 h-4 text-yellow-500 flex-shrink-0" />
            )}
            <span className="text-sm text-foreground truncate">{node.folder_name}</span>
            {node.files.length > 0 && (
              <span className="text-[10px] text-neutral-500 bg-white/5 px-1.5 py-0.5 rounded">
                {node.files.length}
              </span>
            )}
          </button>

          {!node.is_default && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteFolder(node);
              }}
              className="p-1 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded opacity-0 group-hover:opacity-100 transition-all"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>

        {expandedFolders.has(node.id) && node.children.length > 0 && (
          <div>{renderFolderTree(node.children, level + 1)}</div>
        )}
      </div>
    ));
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  const folderTree = buildFolderTree();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoStg} alt="Logo" className="h-10 w-auto object-contain" />
            <div>
              <span className="text-sm font-semibold text-foreground">Panel de Administrador</span>
              <p className="text-[10px] text-neutral-500">{user?.email}</p>
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Clients List */}
          <div className="lg:col-span-1">
            <div className="bg-neutral-900/30 border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  <h2 className="font-medium text-foreground text-sm">Clientes</h2>
                </div>
                <button onClick={fetchClients} className="p-1.5 hover:bg-white/10 rounded" title="Actualizar">
                  <RefreshCw className={`w-3.5 h-3.5 text-neutral-400 ${isLoadingClients ? "animate-spin" : ""}`} />
                </button>
              </div>

              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar..."
                  className="w-full bg-black/50 border border-white/10 rounded pl-9 pr-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div className="space-y-1 max-h-[60vh] overflow-y-auto">
                {isLoadingClients ? (
                  <div className="flex justify-center py-8">
                    <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                  </div>
                ) : filteredClients.length === 0 ? (
                  <p className="text-neutral-500 text-xs text-center py-8">No hay clientes</p>
                ) : (
                  filteredClients.map((client) => (
                    <button
                      key={client.name}
                      onClick={() => {
                        setSelectedClient(client.name);
                        setSelectedFolder(null);
                        setExpandedFolders(new Set());
                      }}
                      className={`w-full text-left p-2.5 rounded-lg text-xs transition-colors ${
                        selectedClient === client.name
                          ? "bg-primary/20 border border-primary/30"
                          : "bg-white/5 border border-transparent hover:bg-white/10"
                      }`}
                    >
                      {client.name}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Folder Tree */}
          <div className="lg:col-span-1">
            <div className="bg-neutral-900/30 border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Folder className="w-4 h-4 text-yellow-500" />
                  <h2 className="font-medium text-foreground text-sm">Carpetas</h2>
                </div>
                {selectedClient && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => setShowNewYearDialog(true)}
                      className="p-1.5 hover:bg-white/10 rounded text-neutral-400 hover:text-foreground"
                      title="Nuevo año"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setShowNewFolderDialog(true)}
                      className="p-1.5 hover:bg-white/10 rounded text-neutral-400 hover:text-foreground"
                      title="Nueva carpeta"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {selectedClient ? (
                isLoadingFolders ? (
                  <div className="flex justify-center py-8">
                    <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <div className="space-y-0.5 max-h-[60vh] overflow-y-auto group">
                    {renderFolderTree(folderTree)}
                  </div>
                )
              ) : (
                <p className="text-neutral-500 text-xs text-center py-8">Seleccione un cliente</p>
              )}
            </div>
          </div>

          {/* Files Panel */}
          <div className="lg:col-span-2">
            <div className="bg-neutral-900/30 border border-white/10 rounded-xl p-4">
              {selectedClient ? (
                <>
                  {/* Breadcrumb */}
                  <div className="flex items-center gap-2 mb-4 min-h-[28px]">
                    {selectedFolder && (
                      <button
                        onClick={() => {
                          const parent = folders.find((f) => f.id === selectedFolder.parent_id);
                          setSelectedFolder(parent || null);
                        }}
                        className="p-1.5 hover:bg-white/10 rounded text-neutral-400 hover:text-foreground"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                    )}
                    <div className="flex items-center gap-1 text-xs text-neutral-400 flex-1 min-w-0">
                      <button
                        onClick={() => setSelectedFolder(null)}
                        className="hover:text-foreground transition-colors"
                      >
                        {selectedClient}
                      </button>
                      {getBreadcrumb().map((folder) => (
                        <span key={folder.id} className="flex items-center gap-1">
                          <ChevronRight className="w-3 h-3" />
                          <button
                            onClick={() => setSelectedFolder(folder)}
                            className="hover:text-foreground transition-colors truncate max-w-[100px]"
                          >
                            {folder.folder_name}
                          </button>
                        </span>
                      ))}
                    </div>
                    <label className="flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-red-500 text-foreground text-xs font-medium rounded cursor-pointer transition-colors flex-shrink-0">
                      {isUploading ? (
                        <div className="w-3.5 h-3.5 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin"></div>
                      ) : (
                        <Upload className="w-3.5 h-3.5" />
                      )}
                      <span>Subir</span>
                      <input type="file" onChange={handleFileUpload} className="hidden" disabled={isUploading} />
                    </label>
                  </div>

                  {/* Files */}
                  {currentFolderFiles.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-xl">
                      <FileText className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
                      <p className="text-neutral-400 text-sm">No hay archivos</p>
                      <p className="text-neutral-600 text-xs mt-1">
                        {selectedFolder ? "Suba archivos a esta carpeta" : "Seleccione una carpeta"}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {currentFolderFiles.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                        >
                          <FileText className="w-8 h-8 text-primary flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{file.file_name}</p>
                            <p className="text-[10px] text-neutral-500">
                              {formatFileSize(file.file_size || 0)} • {new Date(file.uploaded_at).toLocaleDateString("es-VE")}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDeleteFile(file)}
                            className="p-1.5 text-red-500 hover:bg-red-500/10 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-16">
                  <Users className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
                  <p className="text-neutral-400 text-sm">Seleccione un cliente</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* New Folder Dialog */}
      <Dialog open={showNewFolderDialog} onOpenChange={setShowNewFolderDialog}>
        <DialogContent className="bg-neutral-900 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-foreground">Nueva Carpeta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-neutral-400">Nombre de la carpeta</Label>
              <Input
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Mi carpeta"
                className="mt-1.5 bg-black/50 border-white/10"
              />
            </div>
            {selectedFolder && (
              <p className="text-xs text-neutral-500">
                Se creará dentro de: <span className="text-foreground">{selectedFolder.folder_name}</span>
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewFolderDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateFolder} disabled={!newFolderName.trim()}>
              Crear
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Year Dialog */}
      <Dialog open={showNewYearDialog} onOpenChange={setShowNewYearDialog}>
        <DialogContent className="bg-neutral-900 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-foreground">Nuevo Año</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-neutral-400">Tipo</Label>
              <div className="flex gap-2 mt-1.5">
                <button
                  onClick={() => setYearType("admin")}
                  className={`flex-1 p-3 rounded-lg border text-sm transition-colors ${
                    yearType === "admin"
                      ? "border-primary bg-primary/20 text-foreground"
                      : "border-white/10 text-neutral-400 hover:bg-white/5"
                  }`}
                >
                  Administración
                </button>
                <button
                  onClick={() => setYearType("contab")}
                  className={`flex-1 p-3 rounded-lg border text-sm transition-colors ${
                    yearType === "contab"
                      ? "border-primary bg-primary/20 text-foreground"
                      : "border-white/10 text-neutral-400 hover:bg-white/5"
                  }`}
                >
                  Contabilidad
                </button>
              </div>
            </div>
            <div>
              <Label className="text-neutral-400">Año</Label>
              <Input
                value={newYear}
                onChange={(e) => setNewYear(e.target.value)}
                placeholder="2026"
                className="mt-1.5 bg-black/50 border-white/10"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="deletePrevious"
                checked={deletePrevious}
                onChange={(e) => setDeletePrevious(e.target.checked)}
                className="rounded border-white/10 bg-black/50"
              />
              <label htmlFor="deletePrevious" className="text-sm text-neutral-400">
                Eliminar años anteriores
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewYearDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateYear} disabled={!newYear.trim()}>
              Crear
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPanel;