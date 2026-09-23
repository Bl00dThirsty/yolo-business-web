import React, { useState } from "react";
import {
  Search,
  Filter,
  Plus,
  QrCode,
  Eye,
  ExternalLink,
  Bike,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Ban,
  ArrowUpDown,
  Store,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDeliveries } from "@/context/delivery-context";
import { useStore } from "@/context/store-context";
import { formatFCFA, formatDate } from "@/lib/utils";
import { DeliveryStatus } from "@/lib/types";

export function DeliveryListView() {
  const {
    deliveries,
    setActiveView,
    viewDeliveryDetail,
    setHandoverDeliveryId,
    openPublicTracking,
  } = useDeliveries();
  const { pickupSites, selectedSiteId } = useStore();

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Filter deliveries
  const filtered = deliveries.filter((del) => {
    // Site filter
    if (selectedSiteId !== "all" && del.pickupSiteId !== selectedSiteId) {
      return false;
    }

    // Status filter
    if (statusFilter !== "all") {
      if (statusFilter === "active" && ["delivered", "cancelled", "returned"].includes(del.status)) {
        return false;
      }
      if (statusFilter === "at_pickup" && del.status !== "at_pickup") {
        return false;
      }
      if (statusFilter === "in_transit" && del.status !== "in_transit") {
        return false;
      }
      if (statusFilter === "delivered" && del.status !== "delivered") {
        return false;
      }
      if (statusFilter === "incident" && !["incident", "return_in_progress"].includes(del.status)) {
        return false;
      }
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        del.reference.toLowerCase().includes(q) ||
        del.recipientName.toLowerCase().includes(q) ||
        del.recipientPhone.includes(q) ||
        del.recipientNeighborhood.toLowerCase().includes(q) ||
        (del.assignedCourier && del.assignedCourier.name.toLowerCase().includes(q))
      );
    }

    return true;
  });

  const getStatusBadge = (status: DeliveryStatus) => {
    switch (status) {
      case "at_pickup":
        return <Badge variant="warning" className="gap-1 font-semibold animate-pulse"><Clock className="size-3" /> Au Retrait</Badge>;
      case "in_transit":
        return <Badge variant="info" className="gap-1 font-semibold"><Bike className="size-3" /> En Transport</Badge>;
      case "searching_courier":
        return <Badge variant="secondary" className="gap-1 font-medium"><Clock className="size-3" /> Recherche livreur</Badge>;
      case "delivered":
        return <Badge variant="success" className="gap-1 font-semibold"><CheckCircle2 className="size-3" /> Livrée</Badge>;
      case "incident":
        return <Badge variant="destructive" className="gap-1 font-semibold"><AlertTriangle className="size-3" /> Incident</Badge>;
      case "return_in_progress":
        return <Badge variant="destructive" className="gap-1 font-semibold"><RotateCcw className="size-3" /> Retour en cours</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="gap-1 text-muted-foreground"><Ban className="size-3" /> Annulée</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Gestion des Livraisons ({filtered.length})
          </h1>
          <p className="text-xs text-muted-foreground">
            Suivi des courses, assignation coursier, remises sécurisées et statuts d&apos;encaissement.
          </p>
        </div>

        <Button
          onClick={() => setActiveView("create_delivery")}
          className="bg-yolo-ink text-yolo-lime hover:bg-yolo-ink/90 border border-yolo-lime/40 font-semibold gap-2 self-start sm:self-auto"
        >
          <Plus className="size-4" />
          Nouvelle livraison
        </Button>
      </div>

      {/* Filters Strip */}
      <Card className="p-3 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Status Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 text-xs">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                statusFilter === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Toutes
            </button>
            <button
              onClick={() => setStatusFilter("active")}
              className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                statusFilter === "active" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              En cours
            </button>
            <button
              onClick={() => setStatusFilter("at_pickup")}
              className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                statusFilter === "at_pickup" ? "bg-amber-500 text-white font-bold" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Au Retrait
              {deliveries.filter((d) => d.status === "at_pickup").length > 0 && (
                <span className="size-1.5 rounded-full bg-amber-200"></span>
              )}
            </button>
            <button
              onClick={() => setStatusFilter("in_transit")}
              className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                statusFilter === "in_transit" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              En transport
            </button>
            <button
              onClick={() => setStatusFilter("delivered")}
              className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                statusFilter === "delivered" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Livrées
            </button>
            <button
              onClick={() => setStatusFilter("incident")}
              className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                statusFilter === "incident" ? "bg-destructive text-destructive-foreground font-bold" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Incidents
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filtrer référence, client, coursier..."
              className="h-8 w-full rounded-md border bg-background pl-8 pr-3 text-xs outline-hidden focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>
      </Card>

      {/* Deliveries Table */}
      <Card className="overflow-hidden border shadow-xs">
        <Table className="min-w-[780px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-28">Référence</TableHead>
              <TableHead>Point de Retrait</TableHead>
              <TableHead>Destinataire</TableHead>
              <TableHead>Livreur Attribué</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Montant Marchandise</TableHead>
              <TableHead className="text-right">Frais Yolo</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                  Aucune livraison trouvée avec les critères sélectionnés.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((del) => (
                <TableRow key={del.id} className="hover:bg-muted/30">
                  {/* Référence */}
                  <TableCell>
                    <button
                      onClick={() => viewDeliveryDetail(del.id)}
                      className="font-bold font-mono text-xs text-foreground hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {del.reference}
                    </button>
                    <span className="text-[10px] text-muted-foreground block font-mono">
                      {del.createdAt ? formatDate(del.createdAt) : "Aujourd'hui"}
                    </span>
                  </TableCell>

                  {/* Point de retrait */}
                  <TableCell>
                    <div className="font-medium text-foreground truncate max-w-[150px]">
                      {del.pickupSiteName}
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {del.packageCount} colis • {del.estimatedWeightKg} kg
                    </span>
                  </TableCell>

                  {/* Destinataire */}
                  <TableCell>
                    <div className="font-semibold text-foreground truncate max-w-[160px]">
                      {del.recipientName}
                    </div>
                    <div className="text-[11px] text-muted-foreground truncate max-w-[160px]">
                      {del.recipientNeighborhood} ({del.recipientCity})
                    </div>
                  </TableCell>

                  {/* Livreur */}
                  <TableCell>
                    {del.assignedCourier ? (
                      <div className="flex items-center gap-2">
                        <div className="size-6 rounded-full bg-yolo-ink text-yolo-lime flex items-center justify-center font-bold text-[10px]">
                          <Bike className="size-3" />
                        </div>
                        <div>
                          <div className="font-medium text-xs text-foreground truncate max-w-[130px]">
                            {del.assignedCourier.name}
                          </div>
                          <div className="text-[10px] font-mono text-muted-foreground">
                            {del.assignedCourier.plateNumber}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">En recherche...</span>
                    )}
                  </TableCell>

                  {/* Statut */}
                  <TableCell>{getStatusBadge(del.status)}</TableCell>

                  {/* Montant Marchandise */}
                  <TableCell className="text-right">
                    <div className="font-mono font-bold text-foreground">
                      {formatFCFA(del.goodsAmount)}
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {del.paymentMode === "cash_on_delivery" ? "COD Espèces/MoMo" : "Déjà réglé"}
                    </span>
                  </TableCell>

                  {/* Frais Yolo */}
                  <TableCell className="text-right font-mono text-xs text-muted-foreground">
                    {formatFCFA(del.transportFee)}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Urgent Handover Button if at_pickup */}
                      {del.status === "at_pickup" && (
                        <Button
                          size="sm"
                          variant="yolo"
                          onClick={() => setHandoverDeliveryId(del.id)}
                          className="h-7 px-2 text-[11px] font-semibold gap-1"
                        >
                          <QrCode className="size-3" />
                          Remettre
                        </Button>
                      )}

                      {/* Detail View */}
                      <Button
                        size="icon-sm"
                        variant="outline"
                        onClick={() => viewDeliveryDetail(del.id)}
                        title="Consulter le détail"
                      >
                        <Eye className="size-3.5" />
                      </Button>

                      {/* Public Tracking Link */}
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        onClick={() => openPublicTracking(del.trackingToken)}
                        title="Lien public destinataire"
                      >
                        <ExternalLink className="size-3.5 text-muted-foreground" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
