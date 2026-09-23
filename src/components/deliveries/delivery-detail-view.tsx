import React from "react";
import {
  ArrowLeft,
  Bike,
  Clock,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  ExternalLink,
  MapPin,
  User,
  Phone,
  Package,
  Coins,
  ShieldCheck,
  Ban,
  FileText,
  RotateCcw,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useDeliveries } from "@/context/delivery-context";
import { formatFCFA, formatDate } from "@/lib/utils";

export function DeliveryDetailView() {
  const {
    selectedDelivery,
    setActiveView,
    setHandoverDeliveryId,
    cancelDelivery,
    resolveIncident,
    openPublicTracking,
  } = useDeliveries();

  if (!selectedDelivery) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-muted-foreground text-xs">Aucune livraison sélectionnée.</p>
        <Button size="sm" onClick={() => setActiveView("deliveries")}>
          Retour aux livraisons
        </Button>
      </div>
    );
  }

  const d = selectedDelivery;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveView("deliveries")}
            className="gap-2 text-xs"
          >
            <ArrowLeft className="size-4" />
            Liste des livraisons
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-foreground font-mono">{d.reference}</h1>
              <Badge variant="yolo" className="text-xs capitalize">
                {d.status.replace("_", " ")}
              </Badge>
            </div>
            <span className="text-[11px] text-muted-foreground font-mono">
              Créée le {formatDate(d.createdAt)} • Token de suivi : {d.trackingToken}
            </span>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2">
          {d.status === "at_pickup" && (
            <Button
              size="sm"
              variant="yolo"
              onClick={() => setHandoverDeliveryId(d.id)}
              className="gap-1.5 font-bold text-xs animate-pulse"
            >
              <QrCode className="size-3.5" />
              Contrôler & Remettre les colis (L04)
            </Button>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={() => openPublicTracking(d.trackingToken)}
            className="gap-1.5 text-xs"
          >
            <ExternalLink className="size-3.5" />
            Lien Suivi Destinataire (T01)
          </Button>

          {["searching_courier", "courier_assigned"].includes(d.status) && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => {
                if (confirm("Confirmer l'annulation de cette livraison avant prise en charge ?")) {
                  cancelDelivery(d.id, "Annulation demandée par le commerce");
                }
              }}
              className="gap-1.5 text-xs"
            >
              <Ban className="size-3.5" />
              Annuler
            </Button>
          )}

          {d.status === "incident" && (
            <Button
              size="sm"
              variant="default"
              onClick={() => resolveIncident(d.id, "return")}
              className="gap-1.5 text-xs"
            >
              <RotateCcw className="size-3.5" />
              Valider le retour marchandise (L07)
            </Button>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Route & Timeline */}
        <div className="lg:col-span-8 space-y-6">
          {/* Pickup & Destination Card */}
          <Card className="p-5 space-y-4 shadow-xs">
            <CardTitle className="text-sm font-bold">Itinéraire & Adresses</CardTitle>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Point de retrait */}
              <div className="p-3 bg-muted/30 rounded-lg border space-y-1.5">
                <div className="flex items-center gap-1.5 text-muted-foreground font-semibold">
                  <MapPin className="size-3.5 text-yolo-ink dark:text-yolo-lime" />
                  <span>Point de Retrait (Départ)</span>
                </div>
                <div className="font-bold text-foreground text-sm">{d.pickupSiteName}</div>
                <div className="text-muted-foreground">{d.pickupAddress}</div>
                <div className="text-[11px] text-muted-foreground">
                  Quartier : <strong>{d.pickupNeighborhood}</strong>
                </div>
              </div>

              {/* Destinataire */}
              <div className="p-3 bg-muted/30 rounded-lg border space-y-1.5">
                <div className="flex items-center gap-1.5 text-muted-foreground font-semibold">
                  <User className="size-3.5 text-emerald-600" />
                  <span>Destinataire (Arrivée)</span>
                </div>
                <div className="font-bold text-foreground text-sm">{d.recipientName}</div>
                <div className="text-muted-foreground">{d.recipientAddress}</div>
                <div className="text-[11px] text-muted-foreground">
                  Quartier : <strong>{d.recipientNeighborhood}</strong> ({d.recipientCity})
                </div>
                <div className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
                  <Phone className="size-3" />
                  {d.recipientPhone}
                </div>
                {d.recipientInstructions && (
                  <div className="text-[11px] italic bg-background/80 p-1.5 rounded border text-muted-foreground">
                    Consignes : {d.recipientInstructions}
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Colis & Marchandises */}
          <Card className="p-5 space-y-4 shadow-xs">
            <CardTitle className="text-sm font-bold">Colis & Déclaration de Marchandise</CardTitle>

            <div className="space-y-2 text-xs">
              {d.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/20"
                >
                  <div className="flex items-center gap-2">
                    <Package className="size-4 text-muted-foreground" />
                    <div>
                      <span className="font-semibold text-foreground">{item.name}</span>
                      <span className="text-muted-foreground text-[11px] block">
                        Catégorie : {item.category}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold font-mono text-foreground">Qté : {item.quantity}</span>
                    {item.weightKg && (
                      <span className="text-[11px] text-muted-foreground block font-mono">
                        {item.weightKg} kg
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t text-xs">
              <div className="p-2 rounded bg-muted/30 text-center">
                <span className="text-muted-foreground block text-[10px]">Nombre de colis</span>
                <span className="font-bold text-foreground font-mono">{d.packageCount}</span>
              </div>
              <div className="p-2 rounded bg-muted/30 text-center">
                <span className="text-muted-foreground block text-[10px]">Poids total</span>
                <span className="font-bold text-foreground font-mono">{d.estimatedWeightKg} kg</span>
              </div>
              <div className="p-2 rounded bg-muted/30 text-center">
                <span className="text-muted-foreground block text-[10px]">Sensibilité</span>
                <span className="font-bold text-foreground">
                  {d.isFragile ? "Fragile (Précaution)" : "Standard"}
                </span>
              </div>
            </div>
          </Card>

          {/* Chronologie / Audit Timeline */}
          <Card className="p-5 space-y-4 shadow-xs">
            <CardTitle className="text-sm font-bold">Journal d&apos;Événements & Transferts de Garde</CardTitle>
            <div className="space-y-3 pl-2 border-l-2 border-border text-xs">
              {d.timeline.map((event) => (
                <div key={event.id} className="relative pl-4 space-y-0.5">
                  <span className="absolute -left-[21px] top-1 size-2 rounded-full bg-yolo-ink dark:bg-yolo-lime" />
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-muted-foreground">{event.timestamp}</span>
                    <span className="font-semibold text-foreground">{event.title}</span>
                    <Badge variant="outline" className="text-[9.5px] px-1.5 py-0.5">
                      {event.actor}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-[11px]">{event.description}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column (4 cols): Courier, Codes & Financials */}
        <div className="lg:col-span-4 space-y-6">
          {/* Livreur Card */}
          <Card className="p-5 space-y-3 shadow-xs border-yolo-ink/20">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold">Livreur Yolo Delivery</CardTitle>
              {d.assignedCourier?.verified && (
                <Badge variant="success" className="gap-1 text-[10px]">
                  <ShieldCheck className="size-3" /> Vérifié
                </Badge>
              )}
            </div>

            {d.assignedCourier ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="size-12 rounded-xl bg-yolo-ink text-yolo-lime flex items-center justify-center font-bold text-lg">
                    <Bike className="size-6" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-foreground">{d.assignedCourier.name}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 font-mono">
                      <Phone className="size-3" />
                      {d.assignedCourier.phone}
                    </div>
                    <div className="text-[11px] text-amber-600 font-semibold">
                      ★ {d.assignedCourier.rating} / 5.0
                    </div>
                  </div>
                </div>

                <div className="p-2.5 bg-muted/40 rounded-lg text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Véhicule :</span>
                    <span className="font-medium text-foreground capitalize">
                      {d.assignedCourier.vehicleType} ({d.assignedCourier.plateNumber})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Arrivée estimée :</span>
                    <span className="font-bold text-foreground">
                      {d.assignedCourier.estimatedArrivalMinutes !== undefined
                        ? `${d.assignedCourier.estimatedArrivalMinutes} min`
                        : "Sur place"}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-muted-foreground italic bg-muted/20 rounded-lg">
                Recherche de coursier en cours...
              </div>
            )}
          </Card>

          {/* Security Codes Card */}
          <Card className="p-5 space-y-3 shadow-xs bg-muted/10">
            <CardTitle className="text-sm font-bold">Codes de Sécurité & Clôture</CardTitle>
            <p className="text-[11px] text-muted-foreground">
              Ces codes prouvent le transfert physique de responsabilité (Userflow Section 9 & 10).
            </p>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg border bg-background flex items-center justify-between">
                <div>
                  <span className="text-muted-foreground block text-[10px]">Code Retrait Sécurisé (PIN) :</span>
                  <span className="font-mono font-black text-sm text-foreground">
                    {d.pickupVerificationCode}
                  </span>
                </div>
                <Badge variant="secondary" className="text-[10px]">
                  Au comptoir
                </Badge>
              </div>

              <div className="p-2.5 rounded-lg border bg-background flex items-center justify-between">
                <div>
                  <span className="text-muted-foreground block text-[10px]">Code Remise Destinataire :</span>
                  <span className="font-mono font-black text-sm text-emerald-600">
                    {d.recipientDeliveryPin}
                  </span>
                </div>
                <Badge variant="outline" className="text-[10px]">
                  Secret Client
                </Badge>
              </div>
            </div>
          </Card>

          {/* Financial Breakdown */}
          <Card className="p-5 space-y-3 shadow-xs">
            <CardTitle className="text-sm font-bold">Détail Financier de la Course</CardTitle>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Prix Marchandise :</span>
                <span className="font-mono font-semibold text-foreground">{formatFCFA(d.goodsAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Frais Transport Yolo :</span>
                <span className="font-mono font-semibold text-foreground">{formatFCFA(d.transportFee)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Frais pris en charge par :</span>
                <span className="font-medium text-foreground capitalize">
                  {d.transportPayer === "merchant" ? "Commerce" : "Destinataire"}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm font-bold">
                <span className="text-foreground">Total à encaisser (COD) :</span>
                <span className="font-mono text-emerald-600 font-extrabold">{formatFCFA(d.totalToCollect)}</span>
              </div>
              <div className="flex justify-between text-[11px] pt-1 text-muted-foreground">
                <span>Statut rapprochement :</span>
                <Badge variant={d.reconciliationStatus === "reconciled_j0" ? "success" : "secondary"}>
                  {d.reconciliationStatus === "reconciled_j0" ? "Rapproché J+0" : "En cours"}
                </Badge>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
