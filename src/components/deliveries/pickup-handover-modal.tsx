import React, { useState } from "react";
import {
  QrCode,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Bike,
  Package,
  X,
  Phone,
  ArrowRight,
  UserCheck,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDeliveries } from "@/context/delivery-context";

export function PickupHandoverModal() {
  const { handoverDeliveryId, setHandoverDeliveryId, deliveries, confirmHandover } = useDeliveries();
  const [courierScanned, setCourierScanned] = useState(false);

  const delivery = deliveries.find((d) => d.id === handoverDeliveryId);

  if (!delivery) return null;

  const handleClose = () => {
    setCourierScanned(false);
    setHandoverDeliveryId(null);
  };

  const handleFinalConfirm = () => {
    confirmHandover(delivery.id);
    setCourierScanned(false);
  };

  return (
    <Dialog open={!!handoverDeliveryId} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-md p-6 space-y-4">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-yolo-lime text-yolo-ink flex items-center justify-center font-bold">
              <QrCode className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">
                Remise au Livreur — Écran L04
              </DialogTitle>
              <DialogDescription className="text-xs">
                Contrôle d&apos;identité et transfert sécurisé de responsabilité physique.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* 1. Vérification Visuelle du Livreur */}
        <div className="p-3 bg-muted/40 rounded-xl border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Livreur Officiel Assigné
            </span>
            <Badge variant="success" className="text-[10px] gap-1">
              <ShieldCheck className="size-3" /> Attribution Vérifiée
            </Badge>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <div className="size-12 rounded-xl bg-yolo-ink text-yolo-lime flex items-center justify-center font-bold text-lg">
              <Bike className="size-6" />
            </div>
            <div>
              <div className="font-bold text-sm text-foreground">
                {delivery.assignedCourier?.name || "Martin Kamga"}
              </div>
              <div className="text-xs text-muted-foreground">
                Véhicule : <strong className="text-foreground capitalize">{delivery.assignedCourier?.vehicleType || "Moto"}</strong> ({delivery.assignedCourier?.plateNumber || "LT 482 EK"})
              </div>
              <div className="text-[11px] text-muted-foreground font-mono">
                {delivery.assignedCourier?.phone || "+237 694 22 18 90"}
              </div>
            </div>
          </div>

          <div className="p-2 bg-amber-500/10 rounded border border-amber-500/20 text-[11px] text-amber-900 dark:text-amber-300">
            <strong>Consigne de sécurité :</strong> Comparez la personne et sa plaque au comptoir. Ne jamais remettre à un tiers non attribué.
          </div>
        </div>

        {/* 2. Colis concernés */}
        <div className="flex items-center justify-between p-2.5 rounded-lg border text-xs">
          <div className="flex items-center gap-2">
            <Package className="size-4 text-muted-foreground" />
            <span className="font-semibold text-foreground">Colis à remettre :</span>
          </div>
          <span className="font-mono font-bold text-sm text-foreground">
            {delivery.packageCount} colis ({delivery.estimatedWeightKg} kg)
          </span>
        </div>

        {/* 3. QR Code & Code PIN */}
        <div className="text-center p-4 bg-muted/20 rounded-xl border space-y-3">
          <div className="text-xs text-muted-foreground">
            Faites scanner ce QR Code par l&apos;application <strong>Yolo Delivery</strong> du livreur :
          </div>

          {/* SVG QR Code representation */}
          <div className="size-40 mx-auto bg-white p-3 rounded-xl border shadow-xs flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="size-full text-yolo-ink">
              <rect width="100" height="100" fill="white" />
              {/* Corner 1 */}
              <rect x="10" y="10" width="25" height="25" fill="#121317" />
              <rect x="15" y="15" width="15" height="15" fill="white" />
              <rect x="18" y="18" width="9" height="9" fill="#121317" />
              {/* Corner 2 */}
              <rect x="65" y="10" width="25" height="25" fill="#121317" />
              <rect x="70" y="15" width="15" height="15" fill="white" />
              <rect x="73" y="18" width="9" height="9" fill="#121317" />
              {/* Corner 3 */}
              <rect x="10" y="65" width="25" height="25" fill="#121317" />
              <rect x="15" y="70" width="15" height="15" fill="white" />
              <rect x="18" y="73" width="9" height="9" fill="#121317" />
              {/* Patterns */}
              <rect x="42" y="15" width="8" height="8" fill="#121317" />
              <rect x="42" y="30" width="16" height="8" fill="#121317" />
              <rect x="15" y="45" width="20" height="8" fill="#121317" />
              <rect x="45" y="45" width="12" height="12" fill="#CAF76F" stroke="#121317" strokeWidth="2" />
              <rect x="65" y="45" width="20" height="8" fill="#121317" />
              <rect x="42" y="65" width="8" height="20" fill="#121317" />
              <rect x="65" y="65" width="12" height="12" fill="#121317" />
              <rect x="80" y="80" width="10" height="10" fill="#121317" />
            </svg>
          </div>

          <div className="text-xs">
            <span className="text-muted-foreground block text-[11px]">Code de secours (si caméra indisponible) :</span>
            <span className="font-mono font-black text-lg text-foreground tracking-widest">
              {delivery.pickupVerificationCode}
            </span>
          </div>
        </div>

        {/* Scan Simulation button & Confirmation */}
        <div className="space-y-2 pt-2 border-t">
          {!courierScanned ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setCourierScanned(true)}
              className="w-full text-xs gap-2 py-2.5 font-semibold"
            >
              <UserCheck className="size-4 text-emerald-600" />
              Simuler le scan du QR Code par le livreur
            </Button>
          ) : (
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Compte livreur validé côté serveur !</strong> Vous pouvez désormais lui confier physiquement les colis.
              </span>
            </div>
          )}

          <Button
            type="button"
            disabled={!courierScanned}
            onClick={handleFinalConfirm}
            className="w-full bg-yolo-ink text-yolo-lime hover:bg-yolo-ink/90 font-bold text-xs py-2.5 gap-2"
          >
            <CheckCircle2 className="size-4" />
            Confirmer la remise effective des {delivery.packageCount} colis
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
