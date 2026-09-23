import React, { useState } from "react";
import {
  Search,
  Bell,
  Plus,
  ChevronDown,
  Check,
  Clock,
  ShieldCheck,
  QrCode,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/auth-context";
import { useStore } from "@/context/store-context";
import { useDeliveries } from "@/context/delivery-context";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function TopBar() {
  const { currentUser, allUsers, switchUser } = useAuth();
  const { merchant, selectedSite } = useStore();
  const {
    setActiveView,
    deliveries,
    setHandoverDeliveryId,
    viewDeliveryDetail,
  } = useDeliveries();

  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  // Search filter
  const filteredDeliveries = deliveries.filter((d) => {
    if (!searchQuery.trim()) return false;
    const q = searchQuery.toLowerCase();
    return (
      d.reference.toLowerCase().includes(q) ||
      d.recipientName.toLowerCase().includes(q) ||
      d.recipientPhone.includes(q) ||
      d.recipientNeighborhood.toLowerCase().includes(q)
    );
  });

  const couriersWaiting = deliveries.filter((d) => d.status === "at_pickup");

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between border-b bg-white/95 dark:bg-[#121317]/95 backdrop-blur px-3 sm:px-4 lg:px-6">
      {/* Left: Sidebar Trigger & Brand */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <SidebarTrigger className="h-8 w-8 shrink-0 rounded-lg border bg-muted/40 hover:bg-muted" />

        {/* Brand Pill */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex size-7 items-center justify-center rounded-lg bg-yolo-ink text-yolo-lime font-black text-xs shadow-xs border border-yolo-lime/40">
            Y
          </div>
          <span className="font-bold text-xs tracking-tight text-foreground hidden sm:inline">
            Yolo <span className="text-[9.5px] font-semibold px-1 py-0.2 rounded bg-yolo-lime text-yolo-ink">BUSINESS</span>
          </span>
        </div>

        {/* Desktop Search Bar */}
        <div className="relative hidden md:block w-56 lg:w-72">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchResults(true);
            }}
            onFocus={() => setShowSearchResults(true)}
            placeholder="Rechercher #YLO, client, tel..."
            className="h-8 w-full rounded-md border bg-muted/30 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground outline-hidden focus:bg-background focus:ring-1 focus:ring-ring transition-colors"
          />

          {/* Desktop Search dropdown results */}
          {showSearchResults && searchQuery.trim() && (
            <div className="absolute top-10 left-0 right-0 bg-popover border rounded-lg shadow-lg p-2 z-50 text-xs">
              <div className="text-[10px] font-semibold text-muted-foreground px-2 py-1 uppercase">
                Résultats livraisons ({filteredDeliveries.length})
              </div>
              {filteredDeliveries.length === 0 ? (
                <div className="p-3 text-center text-muted-foreground text-xs">
                  Aucune livraison correspondante
                </div>
              ) : (
                <div className="space-y-1 max-h-56 overflow-y-auto">
                  {filteredDeliveries.map((del) => (
                    <button
                      key={del.id}
                      onClick={() => {
                        viewDeliveryDetail(del.id);
                        setShowSearchResults(false);
                        setSearchQuery("");
                      }}
                      className="w-full flex items-center justify-between p-2 rounded hover:bg-muted text-left transition-colors cursor-pointer"
                    >
                      <div>
                        <div className="font-semibold text-foreground">{del.reference}</div>
                        <div className="text-[11px] text-muted-foreground">
                          {del.recipientName} • {del.recipientNeighborhood}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px]">
                        {del.status}
                      </Badge>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right: Actions & User Role Switcher */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Mobile Search Toggle Button */}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
          className="md:hidden size-8 text-muted-foreground"
          title="Rechercher"
        >
          <Search className="size-4" />
        </Button>

        {/* Urgent Pickup Button if courier waiting */}
        {couriersWaiting.length > 0 && (
          <Button
            size="sm"
            variant="yolo"
            onClick={() => {
              setHandoverDeliveryId(couriersWaiting[0].id);
              setActiveView("deliveries");
            }}
            className="h-8 px-2 sm:px-3 text-xs gap-1.5 font-semibold animate-pulse shrink-0"
          >
            <QrCode className="size-3.5" />
            <span className="hidden lg:inline">Livreur au comptoir ({couriersWaiting.length})</span>
            <span className="lg:hidden font-mono font-bold">({couriersWaiting.length})</span>
          </Button>
        )}

        {/* Quick New Delivery CTA */}
        <Button
          size="sm"
          onClick={() => setActiveView("create_delivery")}
          className="h-8 px-2.5 sm:px-3 gap-1.5 text-xs bg-yolo-ink text-yolo-lime hover:bg-yolo-ink/90 border border-yolo-lime/40 font-semibold shrink-0"
        >
          <Plus className="size-3.5" />
          <span className="hidden sm:inline">Nouvelle course</span>
        </Button>

        {/* Notifications Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground hover:text-foreground relative shrink-0"
              aria-label="Notifications"
            >
              <Bell className="size-4" />
              {couriersWaiting.length > 0 && (
                <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-amber-500" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72 sm:w-80 p-2">
            <DropdownMenuLabel className="flex items-center justify-between text-xs">
              <span>Notifications en direct</span>
              <Badge variant="secondary" className="text-[10px]">
                Temps réel
              </Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="space-y-1.5 text-xs">
              {couriersWaiting.map((del) => (
                <div key={del.id} className="p-2 bg-amber-500/10 rounded-md border border-amber-500/20 text-amber-900 dark:text-amber-300 space-y-0.5">
                  <div className="font-semibold flex items-center gap-1.5">
                    <Clock className="size-3 text-amber-600" />
                    Livreur au retrait #{del.reference}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {del.assignedCourier?.name} attend au comptoir {del.pickupSiteName}.
                  </p>
                </div>
              ))}

              <div className="p-2 bg-muted/40 rounded-md space-y-0.5">
                <div className="font-semibold flex items-center gap-1.5 text-foreground">
                  <ShieldCheck className="size-3 text-emerald-600" />
                  Rapprochement J+0 régularisé
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Encaissements Mobile Money réconciliés automatiquement.
                </p>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <Separator orientation="vertical" className="h-5 mx-0.5 hidden sm:block" />

        {/* Role Switcher & User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-lg p-1 hover:bg-muted/40 transition-colors text-left outline-hidden cursor-pointer shrink-0"
            >
              <Avatar className="size-7 rounded-md shrink-0">
                <AvatarFallback className={`rounded-md text-[10px] font-bold ${currentUser.avatarColor}`}>
                  {currentUser.avatarInitials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden xl:flex flex-col min-w-0">
                <span className="text-xs font-semibold leading-tight text-foreground truncate max-w-[110px]">
                  {currentUser.name}
                </span>
                <span className="text-[10px] text-muted-foreground font-medium truncate max-w-[110px]">
                  {currentUser.roleLabel}
                </span>
              </div>
              <ChevronDown className="size-3 text-muted-foreground hidden sm:inline" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-68 p-1.5 rounded-xl text-xs">
            <div className="p-2 bg-muted/40 rounded-lg space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground">{currentUser.name}</span>
                <Badge variant="outline" className="text-[9.5px] px-1.5 py-0.5 font-mono font-medium">
                  {currentUser.role}
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground truncate">{merchant.name}</p>
              <p className="text-[10px] text-muted-foreground/80 font-mono truncate">{currentUser.email}</p>
            </div>

            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-[10.5px] font-semibold text-muted-foreground">
              Changer de profil métier (Simulation)
            </DropdownMenuLabel>

            {allUsers.map((user) => (
              <DropdownMenuItem
                key={user.id}
                onClick={() => switchUser(user.id)}
                className="flex items-center justify-between cursor-pointer py-1.5 rounded-md"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Avatar className="size-5 rounded-xs shrink-0">
                    <AvatarFallback className={`text-[8.5px] font-bold ${user.avatarColor}`}>
                      {user.avatarInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <span className="font-medium text-xs truncate">{user.name}</span>
                    <span className="text-[9.5px] text-muted-foreground truncate">{user.roleLabel}</span>
                  </div>
                </div>
                {user.id === currentUser.id && (
                  <Check className="size-3.5 text-yolo-ink dark:text-yolo-lime shrink-0" />
                )}
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setActiveView("settings")}
              className="cursor-pointer py-1.5"
            >
              <span>Paramètres du compte</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Mobile Search Overlay when toggled */}
      {mobileSearchOpen && (
        <div className="absolute top-14 left-0 right-0 p-3 bg-background border-b shadow-lg z-30 md:hidden flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <input
              type="search"
              value={searchQuery}
              autoFocus
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher #YLO, client, tél..."
              className="h-9 w-full rounded-md border bg-muted/40 pl-8 pr-3 text-xs outline-hidden"
            />
          </div>
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={() => setMobileSearchOpen(false)}
          >
            <X className="size-4" />
          </Button>

          {/* Results under mobile bar */}
          {searchQuery.trim() && (
            <div className="absolute top-14 left-3 right-3 bg-popover border rounded-xl shadow-xl p-2 z-50 text-xs max-h-60 overflow-y-auto">
              {filteredDeliveries.length === 0 ? (
                <div className="p-3 text-center text-muted-foreground">Aucune livraison trouvée</div>
              ) : (
                filteredDeliveries.map((del) => (
                  <button
                    key={del.id}
                    onClick={() => {
                      viewDeliveryDetail(del.id);
                      setMobileSearchOpen(false);
                      setSearchQuery("");
                    }}
                    className="w-full flex items-center justify-between p-2 rounded hover:bg-muted text-left"
                  >
                    <div>
                      <div className="font-semibold text-foreground">{del.reference}</div>
                      <div className="text-[11px] text-muted-foreground">{del.recipientName}</div>
                    </div>
                    <Badge variant="outline" className="text-[10px]">{del.status}</Badge>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </header>
  );
}
