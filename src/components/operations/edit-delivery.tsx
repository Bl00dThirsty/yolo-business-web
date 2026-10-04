import { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { DestinationPicker, type DestinationPoint } from "./destination-picker";
export interface EditableDelivery {
  id: string;
  reference: string;
  version: number;
  recipient_name: string;
  recipient_phone: string;
  dropoff_address: string;
  dropoff_lat: number;
  dropoff_lng: number;
  instructions: string;
}
export interface EditResult {
  recipient_phone: string; reference: string;
  delivery_id: string;
  recipient_pin?: string;
  recipient_code_changed: boolean;
}
export function EditDelivery({
  delivery,
  onClose,
  onSaved,
}: {
  delivery: EditableDelivery;
  onClose: () => void;
  onSaved: (result: EditResult) => void;
}) {
  const [name, setName] = useState(delivery.recipient_name),
    [phone, setPhone] = useState(delivery.recipient_phone),
    [address, setAddress] = useState(delivery.dropoff_address),
    [instructions, setInstructions] = useState(delivery.instructions || ""),
    [point, setPoint] = useState<DestinationPoint>({
      lat: delivery.dropoff_lat,
      lng: delivery.dropoff_lng,
      query: delivery.dropoff_address,
      neighborhood: "",
      confirmed: true,
    }),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const lock = useRef(false),
    request = useRef({ id: crypto.randomUUID(), payload: "" });
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !lock.current) onClose();
      }}
    >
      <DialogContent
        closeDisabled={busy}
        className="w-[calc(100%-2rem)] max-w-2xl max-h-[90dvh] overflow-y-auto"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Modifier la livraison {delivery.reference}</DialogTitle>
          <DialogDescription>
            Disponible avant l’affectation d’un livreur. Si le numéro change, un
            nouveau code sera créé et l’ancien sera invalidé.
          </DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-4"
          onSubmit={async (e) => {
            e.preventDefault();
            if (lock.current) return;
            if (!point.confirmed) {
              setError("Confirmez le repère de destination sur la carte.");
              return;
            }
            if (!navigator.onLine) {
              setError("Vous êtes hors connexion. Votre saisie est conservée.");
              return;
            }
            const payload = {
              recipient_name: name.trim(),
              recipient_phone: phone.replace(/\s/g, ""),
              dropoff_address: address.trim(),
              dropoff_lat: point.lat,
              dropoff_lng: point.lng,
              instructions: instructions.trim(),
            };
            const fingerprint = JSON.stringify(payload);
            if (
              request.current.payload &&
              request.current.payload !== fingerprint
            )
              request.current.id = crypto.randomUUID();
            request.current.payload = fingerprint;
            lock.current = true;
            setBusy(true);
            setError("");
            try {
              const { data, error } = await supabase!.rpc(
                "operator_edit_delivery",
                {
                  p_delivery_id: delivery.id,
                  p_expected_version: delivery.version,
                  p_request_id: request.current.id,
                  p_payload: payload,
                },
              );
              if (error)
                throw Error(
                  error.code === "PGRST202"
                    ? "La modification des livraisons doit encore être activée sur le serveur."
                    : error.message,
                );
              onSaved(data as EditResult);
              onClose();
            } catch (e) {
              setError(
                e instanceof Error
                  ? e.message
                  : "Impossible d’enregistrer. Réessayez.",
              );
            } finally {
              lock.current = false;
              setBusy(false);
            }
          }}
        >
          <fieldset disabled={busy} className="grid gap-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <label className="grid gap-1">
                Destinataire
                <Input
                  required
                  minLength={2}
                  maxLength={120}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>
              <label className="grid gap-1">
                Téléphone du destinataire
                <Input
                  required
                  type="tel"
                  pattern="\+2376[0-9]{8}"
                  title="+237 suivi de 9 chiffres, sans espace"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </label>
            </div>
            <label className="grid gap-1">
              Adresse de livraison
              <Input
                required
                minLength={5}
                maxLength={500}
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  setPoint((p) => ({ ...p, confirmed: false }));
                }}
              />
            </label>
            <DestinationPicker
              value={point}
              onChange={(p) => {
                if (p) setPoint(p);
              }}
            />
            <label className="grid gap-1">
              Consignes
              <textarea
                className="border rounded-md p-3 min-h-20"
                maxLength={1000}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
              />
            </label>
          </fieldset>
          {error && (
            <p role="alert" className="text-destructive">
              {error}
            </p>
          )}
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={onClose}
            >
              Revenir
            </Button>
            <Button type="submit" disabled={busy || !point.confirmed}>
              {busy ? "Enregistrement…" : "Enregistrer les modifications"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
