import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, FileText, Download, FolderOpen, Folder, ChevronRight, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import logoStg from "@/assets/logo-stg.png";

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
}

const MONTH_ORDER: Record<string, number> = {
  "Enero": 1, "Febrero": 2, "Marzo": 3, "Abril": 4,
  "Mayo": 5, "Junio": 6, "Julio": 7, "Agosto": 8,
  "Septiembre": 9, "Octubre": 10, "Noviembre": 11, "Diciembre": 12,
};

const ClientPanel = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isClient, clientName, isLoading: authLoading, signOut } = useAuth();
  const [folders, setFolders] = useState<ClientFolder[]>([]);
  const [files, setFiles] = useState<ClientFile[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || !isClient)) {
      navigate("/login");
    }
  }, [user, isClient, authLoading, navigate]);

  useEffect(() => {
    if (user && isClient && clientName) {
      fetchFoldersAndFiles();
    }
  }, [user, isClient, clientName]);

  useEffect(() => {
    if (!clientName) return;

    const foldersChannel = supabase
      .channel("client-folders-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "client_folders" },
        () => fetchFoldersAndFiles()
      )
      .subscribe();

    const filesChannel = supabase
      .channel("client-files-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "client_files" },
        () => fetchFoldersAndFiles()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(foldersChannel);
      supabase.removeChannel(filesChannel);
    };
  }, [clientName]);

  const fetchFoldersAndFiles = async () => {
    if (!clientName) return;
    setIsLoading(true);
    try {
      const [foldersRes, filesRes] = await Promise.all([
        supabase.from("client_folders").select("*").eq("client_name", clientName),
        supabase.from("client_files").select("*").eq("client_name", clientName),
      ]);

      if (foldersRes.error) throw foldersRes.error;
      if (filesRes.error) throw filesRes.error;

      setFolders(foldersRes.data || []);
      setFiles(filesRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los documentos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const buildFolderTree = useCallback((): FolderTreeNode[] => {
    const folderMap = new Map<string, FolderTreeNode>();

    folders.forEach((folder) => {
      folderMap.set(folder.id, {
        ...folder,
        children: [],
        files: files.filter((f) => f.folder_id === folder.id),
      });
    });

    const rootFolders: FolderTreeNode[] = [];

    folders.forEach((folder) => {
      const node = folderMap.get(folder.id)!;
      if (folder.parent_id && folderMap.has(folder.parent_id)) {
        folderMap.get(folder.parent_id)!.children.push(node);
      } else if (!folder.parent_id) {
        rootFolders.push(node);
      }
    });

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
  }, [folders, files]);

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

      toast({ title: "Descarga iniciada", description: file.file_name });
    } catch (error) {
      console.error("Error downloading file:", error);
      toast({
        title: "Error",
        description: "No se pudo descargar el archivo",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return "0 B";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const renderFolder = (folder: FolderTreeNode, depth = 0) => {
    const isExpanded = expandedFolders.has(folder.id);
    const hasContent = folder.children.length > 0 || folder.files.length > 0;

    return (
      <div key={folder.id}>
        <button
          onClick={() => toggleFolder(folder.id)}
          className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/5 rounded-lg transition-colors text-left"
          style={{ paddingLeft: `${depth * 16 + 12}px` }}
        >
          {hasContent ? (
            isExpanded ? (
              <ChevronDown className="w-4 h-4 text-neutral-500 flex-shrink-0" />
            ) : (
              <ChevronRight className="w-4 h-4 text-neutral-500 flex-shrink-0" />
            )
          ) : (
            <span className="w-4" />
          )}
          {isExpanded ? (
            <FolderOpen className="w-5 h-5 text-primary flex-shrink-0" />
          ) : (
            <Folder className="w-5 h-5 text-primary flex-shrink-0" />
          )}
          <span className="text-sm text-foreground truncate">{folder.folder_name}</span>
          {folder.files.length > 0 && (
            <span className="text-xs text-neutral-500 ml-auto">
              {folder.files.length} archivo{folder.files.length !== 1 ? "s" : ""}
            </span>
          )}
        </button>

        {isExpanded && (
          <div>
            {folder.children.map((child) => renderFolder(child, depth + 1))}
            {folder.files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between px-3 py-2 hover:bg-white/5 rounded-lg transition-colors group"
                style={{ paddingLeft: `${(depth + 1) * 16 + 12}px` }}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="w-4" />
                  <FileText className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground truncate">{file.file_name}</p>
                    <p className="text-xs text-neutral-500">
                      {formatFileSize(file.file_size)} • {new Date(file.uploaded_at).toLocaleDateString("es-VE")}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDownload(file)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-primary hover:bg-red-500 text-foreground text-xs font-medium rounded transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Download className="w-3 h-3" />
                  Descargar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
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
      <header className="border-b border-white/10 bg-black/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={logoStg}
              alt="Servicios Toro, Gil & Asociados"
              className="h-10 w-auto object-contain"
            />
            <div>
              <span className="text-sm font-semibold text-foreground">Portal de Cliente</span>
              <p className="text-[10px] text-neutral-500">{clientName}</p>
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
          ) : folderTree.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-white/10 rounded-xl">
              <FileText className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
              <p className="text-neutral-400 text-sm">No tiene documentos disponibles</p>
              <p className="text-neutral-600 text-xs mt-1">
                Sus documentos aparecerán aquí cuando estén listos
              </p>
            </div>
          ) : (
            <div className="space-y-1">{folderTree.map((folder) => renderFolder(folder))}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientPanel;