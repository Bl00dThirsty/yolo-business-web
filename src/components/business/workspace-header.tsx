import { BookOpen, LogOut, Settings, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import logo from "@/assets/logo-yolo-black.png";
export function WorkspaceHeader({
  email,
  name,
  disabled,
  onSettings,
  onGuide,
  onSignOut,
}: {
  email: string;
  name: string;
  disabled: boolean;
  onSettings: () => void;
  onGuide: () => void;
  onSignOut: () => void;
}) {
  const initials = (name || email)
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0])
    .join("")
    .toUpperCase();
  return (
    <header className="bw-header">
      <div className="bw-header-inner">
        <a href="/" className="bw-brand" aria-label="Yolo Business, accueil">
          <img src={logo} alt="Yolo" />
          <span>business</span>
        </a>
        <span className="bw-header-context">Espace entreprise</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="bw-account-trigger"
              aria-label="Ouvrir le menu de mon compte"
            >
              <span className="bw-avatar">{initials}</span>
              <ChevronDown size={14} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 p-2">
            <DropdownMenuLabel>
              <span className="block truncate font-semibold">
                {name || "Mon compte"}
              </span>
              <span className="block truncate text-xs font-normal text-muted-foreground mt-1">
                {email}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={onSettings}>
              <Settings />
              Mon compte et paramètres
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={onGuide}>
              <BookOpen />
              Guide de démarrage
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled={disabled} onSelect={onSignOut}>
              <LogOut />
              Se déconnecter
            </DropdownMenuItem>
            {disabled && (
              <p className="px-2 py-1 text-xs text-muted-foreground">
                Terminez la demande en cours avant de vous déconnecter.
              </p>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
