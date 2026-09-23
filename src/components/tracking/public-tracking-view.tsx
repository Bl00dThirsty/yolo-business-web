import React from "react";
import {
  Bike,
  Package,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  ShieldCheck,
  AlertCircle,
  ArrowLeft,
  Store,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDeliveries } from "@/context/delivery-context";
import { formatFCFA } from "@/lib/utils";

export function PublicTrackingView() {
  const { deliveries, activeTrackingToken, setActiveView } = useDeliveries();

  // Find delivery matching token or fallback to the first active delivery
  const delivery =
    deliveries.find((d) => d.trackingToken === activeTrackingToken) ||
    deliveries.find((d) => d.status === "in_transit") ||
    deliveries[0];

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-16">
      {/* Top Banner indicating preview mode */}
      <div className="flex items-center justify-between p-2.5 rounded-lg bg-yolo-lime/20 border border-yolo-lime text-xs text-yolo-ink">
        <span className="font-semibold">Aperçu du lien public destinataire (Écran T01)</span>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setActiveView("dashboard")}
          className="h-6 text-[11px] bg-background"
        >
          Retour au SaaS
        </Button>
      </div>

      {/* Public Tracking Card */}
      <Card className="p-6 space-y-6 shadow-md border rounded-2xl bg-card">
        {/* Brand & Store */}
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-yolo-ink text-yolo-lime font-black text-sm flex items-center justify-center">
              Y
            </div>
            <div>
              <div className="font-bold text-sm text-foreground">Yolo Delivery</div>
              <div className="text-xs text-muted-foreground">
                Colis expédié par <strong className="text-foreground">{delivery.pickupSiteName}</strong>
              </div>
            </div>
          </div>
          <Badge variant="yolo" className="text-xs font-mono font-bold">
            #{delivery.reference}
          </Badge>
        </div>

        {/* Current State & Estimated Time */}
        <div className="text-center space-y-2">
          <Badge
            variant={delivery.status === "delivered" ? "success" : "secondary"}
            className="text-xs px-3 py-1 font-semibold"
          >
            {delivery.status === "delivered"
              ? "Colis Livré avec Succès"
              : delivery.status === "in_transit"
              ? "Livreur en cours de route vers vous"
              : delivery.status === "at_pickup"
              ? "Prise en charge au point de retrait"
              : "Commande en cours de traitement"}
          </Badge>

          <h2 className="text-2xl font-extrabold text-foreground">
            {delivery.status === "delivered"
              ? "Remis au destinataire"
              : "Arrivée estimée : dans 15 - 25 min"}
          </h2>
          <p className="text-xs text-muted-foreground">
            Destination : <strong>{delivery.recipientAddress}</strong> ({delivery.recipientNeighborhood}, {delivery.recipientCity})
          </p>
        </div>

        {/* 4-Step Progress Bar */}
        <div className="space-y-2 pt-2">
          <div className="grid grid-cols-4 gap-1.5 h-2">
            <div className="bg-yolo-ink dark:bg-yolo-lime rounded-full"></div>
            <div className={`rounded-full ${["in_transit", "at_destination", "delivered"].includes(delivery.status) ? "bg-yolo-ink dark:bg-yolo-lime" : "bg-muted"}`}></div>
            <div className={`rounded-full ${["at_destination", "delivered"].includes(delivery.status) ? "bg-yolo-ink dark:bg-yolo-lime" : "bg-muted"}`}></div>
            <div className={`rounded-full ${delivery.status === "delivered" ? "bg-yolo-ink dark:bg-yolo-lime" : "bg-muted"}`}></div>
          </div>

          <div className="grid grid-cols-4 text-[10px] text-muted-foreground text-center pt-1 font-medium">
            <span>Préparation</span>
            <span>Retrait</span>
            <span>En transport</span>
            <span>Livré</span>
          </div>
        </div>

        {/* Courier Info Card */}
        {delivery.assignedCourier && (
          <div className="p-4 bg-muted/30 rounded-xl border space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Votre Coursier Yolo
              </span>
              <Badge variant="success" className="text-[10px]">
                Attribution certifiée
              </Badge>
            </div>

            <div className="flex items-center gap-3">
              <div className="size-12 rounded-xl bg-yolo-ink text-yolo-lime flex items-center justify-center font-bold text-lg">
                <Bike className="size-6" />
              </div>
              <div>
                <div className="font-bold text-sm text-foreground">{delivery.assignedCourier.name}</div>
                <div className="text-xs text-muted-foreground">
                  Véhicule : <strong className="text-foreground capitalize">{delivery.assignedCourier.vehicleType}</strong> ({delivery.assignedCourier.plateNumber})
                </div>
                <div className="text-[11px] text-amber-600 font-semibold">
                  ★ {delivery.assignedCourier.rating} / 5.0 (Vérifié Yolo Delivery)
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security Rule for Recipient (Section 10 of Userflow) */}
        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 space-y-2 text-xs">
          <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-bold">
            <ShieldCheck className="size-4 text-amber-600" />
            Consigne de Remise & Code Secret
          </div>
          <p className="text-amber-800 dark:text-amber-300/90 leading-relaxed text-[11px]">
            Pour votre sécurité, vérifiez l&apos;état physique de vos colis dès l&apos;arrivée du coursier. Communiquez votre <strong>code secret destinataire</strong> au livreur <strong>uniquement après contrôle de vos marchandises</strong>.
          </p>
          {delivery.totalToCollect > 0 && (
            <div className="p-2 bg-background rounded border mt-2 flex justify-between items-center text-xs font-mono">
              <span className="text-foreground font-semibold">Montant à régler à l&apos;arrivée :</span>
              <span className="font-bold text-emerald-600 text-sm">{formatFCFA(delivery.totalToCollect)}</span>
            </div>
          )}
        </div>

        {/* Help & Support */}
        <div className="text-center pt-2">
          <button
            onClick={() => alert("Assistance destinataire : +237 699 00 11 22")}
            className="text-xs text-muted-foreground underline hover:text-foreground cursor-pointer"
          >
            Besoin d&apos;aide ou consigne particulière ? Contacter l&apos;assistance Yolo
          </button>
        </div>
      </Card>
    </div>
  );
}
