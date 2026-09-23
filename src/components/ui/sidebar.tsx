import * as React from "react";
import { PanelLeft, PanelLeftClose, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

const SidebarContext = React.createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({
  defaultOpen = false, // Fermable par défaut
  children,
}: {
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState<boolean>(defaultOpen);

  const toggleSidebar = React.useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  // Keyboard shortcut: Ctrl+B or Cmd+B to toggle sidebar
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);

  return (
    <SidebarContext.Provider value={{ open, setOpen, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}

export function SidebarTrigger({ className, ...props }: React.ComponentProps<typeof Button>) {
  const { open, toggleSidebar } = useSidebar();
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={toggleSidebar}
      className={cn("size-8 text-muted-foreground hover:text-foreground", className)}
      title={open ? "Fermer le menu (Ctrl+B)" : "Ouvrir le menu (Ctrl+B)"}
      {...props}
    >
      {open ? <PanelLeftClose className="size-4" /> : <PanelLeft className="size-4" />}
      <span className="sr-only">Basculer la barre latérale</span>
    </Button>
  );
}
