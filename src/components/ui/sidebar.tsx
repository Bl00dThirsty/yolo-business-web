import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./dialog";
import * as React from "react";
import { PanelLeft, PanelLeftClose } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

const SidebarContext = React.createContext<SidebarContextType | undefined>(
  undefined,
);

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

export function SidebarTrigger({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { open, toggleSidebar } = useSidebar();
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={toggleSidebar}
      className={cn(
        "size-8 text-muted-foreground hover:text-foreground",
        className,
      )}
      title={open ? "Fermer le menu (Ctrl+B)" : "Ouvrir le menu (Ctrl+B)"}
      {...props}
    >
      {open ? (
        <PanelLeftClose className="size-4" />
      ) : (
        <PanelLeft className="size-4" />
      )}
      <span className="sr-only">Basculer la barre latérale</span>
    </Button>
  );
}

export function Sidebar({
  children,
  className,
}: React.PropsWithChildren<{ className?: string }>) {
  const { open, setOpen } = useSidebar();
  const [mobile, setMobile] = React.useState(
    () => matchMedia("(max-width:760px)").matches,
  );
  React.useEffect(() => {
    const query = matchMedia("(max-width:760px)");
    const change = () => {
      setMobile(query.matches);
      setOpen(!query.matches);
    };
    query.addEventListener("change", change);
    return () => query.removeEventListener("change", change);
  }, [setOpen]);
  if (mobile)
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bw-sidebar-drawer">
          <DialogHeader>
            <DialogTitle>Navigation</DialogTitle>
            <DialogDescription className="sr-only">
              Choisissez une page de votre espace entreprise.
            </DialogDescription>
          </DialogHeader>
          <aside className={cn(className, "is-open")}>{children}</aside>
        </DialogContent>
      </Dialog>
    );
  return open ? <aside className={className}>{children}</aside> : null;
}
export function SidebarContent(props: React.ComponentProps<"div">) {
  return <div data-sidebar="content" {...props} />;
}
export function SidebarMenu(props: React.ComponentProps<"ul">) {
  return <ul data-sidebar="menu" {...props} />;
}
export function SidebarMenuItem(props: React.ComponentProps<"li">) {
  return <li data-sidebar="menu-item" {...props} />;
}
export function SidebarMenuButton({
  isActive,
  ...props
}: React.ComponentProps<typeof Button> & { isActive?: boolean }) {
  return (
    <Button
      variant="ghost"
      data-sidebar="menu-button"
      aria-current={isActive ? "page" : undefined}
      {...props}
    />
  );
}
