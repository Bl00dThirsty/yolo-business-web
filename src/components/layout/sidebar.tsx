import React from "react";
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  QrCode,
  AlertOctagon,
  Wallet,
  MapPin,
  Users,
  Settings,
  HelpCircle,
  ExternalLink,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDeliveries, type ActiveNavView } from "@/context/delivery-context";
import { useStore } from "@/context/store-context";
import { useAuth } from "@/context/auth-context";
import { useSidebar } from "@/components/ui/sidebar";

interface NavItem {
  id: ActiveNavView;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeVariant?: "default" | "yolo" | "destructive" | "warning" | "secondary";
  highlight?: boolean;
  requiredPermission?: "manage_team" | "view_finances" | "edit_billing" | "create_delivery" | "handover_parcel";
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export function Sidebar() {
  const { open, setOpen } = useSidebar();
  const { activeView, setActiveView, deliveries, setHandoverDeliveryId } = useDeliveries();
  const { merchant, pickupSites, selectedSiteId, setSelectedSiteId } = useStore();
  const { hasPermission } = useAuth();

  // Dynamic counts for live badges
  const activeDeliveriesCount = deliveries.filter(
    (d) => !["delivered", "cancelled", "returned"].includes(d.status)
  ).length;

  const couriersWaitingAtPickup = deliveries.filter(
    (d) => d.status === "at_pickup"
  ).length;

  const incidentsCount = deliveries.filter(
    (d) => d.status === "incident" || d.isReturnInitiated
  ).length;

  const navGroups: NavGroup[] = [
    {
      title: "Supervision",
      items: [
        {
          id: "dashboard",
          label: "Tableau de bord",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: "Opérations",
      items: [
        {
          id: "deliveries",
          label: "Toutes les livraisons",
          icon: Package,
          badge: activeDeliveriesCount > 0 ? activeDeliveriesCount : undefined,
          badgeVariant: "secondary",
        },
        {
          id: "create_delivery",
          label: "Nouvelle livraison",
          icon: PlusCircle,
          highlight: true,
          requiredPermission: "create_delivery",
        },
        {
          id: "deliveries",
          label: "Remise au coursier (Scan)",
          icon: QrCode,
          badge: couriersWaitingAtPickup > 0 ? `${couriersWaitingAtPickup} en attente` : undefined,
          badgeVariant: "warning",
          requiredPermission: "handover_parcel",
        },
        {
          id: "deliveries",
          label: "Incidents & Retours",
          icon: AlertOctagon,
          badge: incidentsCount > 0 ? incidentsCount : undefined,
          badgeVariant: "destructive",
        },
      ],
    },
    {
      title: "Gestion Commerçante",
      items: [
        {
          id: "finances",
          label: "Finances & Reversements",
          icon: Wallet,
          requiredPermission: "view_finances",
        },
        {
          id: "pickup_sites",
          label: "Points de retrait",
          icon: MapPin,
          badge: pickupSites.length,
          badgeVariant: "secondary",
        },
        {
          id: "team",
          label: "Équipe & Permissions",
          icon: Users,
          requiredPermission: "manage_team",
        },
      ],
    },
    {
      title: "Système & Client",
      items: [
        {
          id: "tracking_preview",
          label: "Lien Suivi Client",
          icon: ExternalLink,
        },
        {
          id: "settings",
          label: "Paramètres & Facturation",
          icon: Settings,
        },
        {
          id: "support",
          label: "Assistance SAV",
          icon: HelpCircle,
        },
      ],
    },
  ];

  const handleNavClick = (item: NavItem) => {
    if (item.label.includes("Remise au coursier")) {
      const waiting = deliveries.find((d) => d.status === "at_pickup");
      if (waiting) {
        setHandoverDeliveryId(waiting.id);
      }
      setActiveView("deliveries");
    } else {
      setActiveView(item.id);
    }
    // Always close sidebar on mobile/tablet after clicking a destination
    if (window.innerWidth < 1024) {
      setOpen(false);
    }
  };

  return (
    <>
      {/* Dark backdrop overlay when sidebar is open */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity duration-300",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* Floating & Fully Opaque Sidebar Container */}
      <aside
        className={cn(
          // Mobile: Full height docked to left edge with rounded right edge
          // Desktop: Floating card with rounded corners and margins
          "fixed inset-y-0 left-0 z-50 flex w-[85vw] max-w-[300px] flex-col border-r shadow-2xl transition-all duration-300 ease-in-out",
          "md:top-3 md:bottom-3 md:left-3 md:w-72 md:rounded-2xl md:border",
          // 100% OPAQUE background: solid white in light mode, solid #181A18 in dark mode
          "bg-white dark:bg-[#181A18] text-foreground",
          open
            ? "translate-x-0 opacity-100 pointer-events-auto"
            : "-translate-x-full opacity-0 pointer-events-none"
        )}
      >
        {/* Brand Header with Close button */}
        <div className="flex h-14 shrink-0 items-center justify-between border-b px-4 bg-white dark:bg-[#181A18] md:rounded-t-2xl">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-yolo-ink text-yolo-lime font-black text-sm tracking-wider shadow-xs border border-yolo-lime/40">
              Y
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm tracking-tight text-foreground">Yolo</span>
                <span className="text-[10px] font-semibold px-1 py-0.2 rounded bg-yolo-lime text-yolo-ink">
                  BUSINESS
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground truncate max-w-[130px]">
                {merchant.name}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Badge variant="outline" className="text-[9.5px] font-mono px-1.5 py-0.5 bg-muted/30">
              v1.0
            </Badge>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setOpen(false)}
              className="size-7 rounded-md text-muted-foreground hover:text-foreground"
              title="Fermer le menu"
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>

        {/* Pickup Site Selector in Sidebar */}
        <div className="px-3.5 pt-3 pb-2 border-b bg-muted/30 shrink-0">
          <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
            Site sélectionné
          </label>
          <select
            value={selectedSiteId}
            onChange={(e) => setSelectedSiteId(e.target.value)}
            className="w-full text-xs rounded-lg border bg-background py-1.5 px-2 text-foreground font-medium outline-hidden focus:ring-1 focus:ring-ring cursor-pointer"
          >
            <option value="all">Tous les points ({pickupSites.length})</option>
            {pickupSites.map((site) => (
              <option key={site.id} value={site.id}>
                {site.name} ({site.city})
              </option>
            ))}
          </select>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {navGroups.map((group) => {
            const visibleItems = group.items.filter((item) =>
              item.requiredPermission ? hasPermission(item.requiredPermission) : true
            );

            if (visibleItems.length === 0) return null;

            return (
              <div key={group.title} className="space-y-1">
                <h4 className="flex h-6 items-center px-2 text-[10.5px] font-semibold text-muted-foreground uppercase tracking-wider">
                  {group.title}
                </h4>

                <div className="space-y-0.5">
                  {visibleItems.map((item, idx) => {
                    const isActive =
                      item.label.includes("Remise au coursier")
                        ? false
                        : activeView === item.id;

                    return (
                      <button
                        key={idx}
                        onClick={() => handleNavClick(item)}
                        type="button"
                        className={cn(
                          "group relative flex w-full h-9 items-center justify-between rounded-xl px-2.5 text-xs font-medium transition-colors cursor-pointer text-left",
                          isActive
                            ? "bg-secondary text-foreground font-semibold shadow-2xs"
                            : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                          item.highlight &&
                            !isActive &&
                            "bg-yolo-lime/15 text-yolo-ink dark:text-yolo-lime font-semibold border border-yolo-lime/30"
                        )}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <item.icon
                            className={cn(
                              "size-4 shrink-0 transition-colors",
                              isActive
                                ? "text-primary"
                                : item.highlight
                                ? "text-yolo-ink dark:text-yolo-lime"
                                : "text-muted-foreground group-hover:text-foreground"
                            )}
                          />
                          <span className="truncate">{item.label}</span>
                        </div>

                        {item.badge && (
                          <Badge
                            variant={item.badgeVariant || "secondary"}
                            className="text-[10px] font-medium px-1.5 py-0 h-4.5 shrink-0"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Network & Dispatch Connectivity Footer */}
        <div className="border-t p-3 bg-muted/20 space-y-1.5 shrink-0 md:rounded-b-2xl">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="relative flex size-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full size-2 bg-emerald-500"></span>
              </span>
              <span className="font-medium text-foreground">Flotte Yolo Delivery</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-600 font-semibold">En ligne</span>
          </div>
          <p className="text-[10px] text-muted-foreground leading-tight">
            Dispatch PostGIS connecté • Rapprochement J+0 actif
          </p>
        </div>
      </aside>
    </>
  );
}
