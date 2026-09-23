import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DestinationPicker, type DestinationPoint } from "./destination-picker";

export interface PickupLocation {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  active: boolean;
  position_confirmed_at?: string;
}
interface Courier {
  id: string;
  full_name: string;
  approval: string;
  max_active_parcels: number;
  vehicle: string;
  plate: string;
}
async function rpc(name: string, params?: Record<string, unknown>) {
  const { data, error } = await supabase!.rpc(name, params);
  if (error) throw Error(error.message);
  return data;
}
export function AccountSettings({
  locations,
  isAdmin,
  onUpdated,
}: {
  locations: PickupLocation[];
  isAdmin: boolean;
  onUpdated: () => void;
}) {
  const [password, setPassword] = useState(""),
    [confirmation, setConfirmation] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false),
    [failure, setFailure] = useState("");
  const [couriers, setCouriers] = useState<Courier[]>([]);
  useEffect(() => {
    if (!isAdmin) return;
    let alive = true;
    void rpc("admin_couriers")
      .then((data) => {
        if (alive) setCouriers(data);
      })
      .catch((e) => {
        if (alive) setFailure(e.message);
      });
    return () => {
      alive = false;
    };
  }, [isAdmin]);
  async function run(action: () => Promise<void>) {
    if (busy) return;
    setBusy(true);
    setFailure("");
    setNotice("");
    try {
      await action();
      setNotice("Modification enregistrée.");
    } catch (e) {
      setFailure(e instanceof Error ? e.message : "Veuillez réessayer.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <details className="border rounded-2xl bg-card p-5">
      <summary className="font-semibold cursor-pointer">
        Mon compte{isAdmin ? " et administration" : ""}
      </summary>
      <div className="pt-5 flex flex-col gap-6">
        {failure && (
          <p role="alert" className="text-destructive">
            {failure}
          </p>
        )}
        {notice && <p role="status">{notice}</p>}
        <form
          className="grid gap-3 max-w-md"
          onSubmit={(e) => {
            e.preventDefault();
            void run(async () => {
              if (password.length < 12 || password !== confirmation)
                throw Error(
                  "Utilisez au moins 12 caractères et confirmez le même mot de passe.",
                );
              const { error } = await supabase!.auth.updateUser({ password });
              if (error) throw Error(error.message);
              setPassword("");
              setConfirmation("");
            });
          }}
        >
          <h2 className="font-semibold">Définir mon mot de passe personnel</h2>
          <p className="text-sm text-muted-foreground">
            Remplacez le mot de passe temporaire après votre première connexion.
          </p>
          <label className="grid gap-1 text-sm">
            Nouveau mot de passe
            <Input
              type="password"
              autoComplete="new-password"
              minLength={12}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <label className="grid gap-1 text-sm">
            Confirmer le mot de passe
            <Input
              type="password"
              autoComplete="new-password"
              required
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
            />
          </label>
          <Button type="submit" disabled={busy}>
            Enregistrer mon mot de passe
          </Button>
        </form>
        {locations
          .filter((l) => !l.position_confirmed_at)
          .map((l) => (
            <PickupSetup key={l.id} location={l} onUpdated={onUpdated} />
          ))}
        {isAdmin && (
          <section className="grid gap-4">
            <h2 className="font-semibold">Livreurs et affectation</h2>
            <p className="text-sm text-muted-foreground">
              Vérifiez l’identité, le véhicule et la plaque avant d’autoriser un
              livreur. La recherche manuelle traite les commandes prêtes ; le
              livreur doit être disponible et géolocalisé.
            </p>
            <Button
              disabled={busy}
              onClick={() =>
                void run(async () => {
                  await rpc("admin_dispatch_now");
                })
              }
            >
              Rechercher des livreurs maintenant
            </Button>
            {couriers.map((c) => (
              <form
                key={c.id}
                className="border rounded-xl p-4 flex flex-wrap gap-3 items-end"
                onSubmit={(e) => {
                  e.preventDefault();
                  void run(async () => {
                    await rpc("admin_update_courier", {
                      p_id: c.id,
                      p_approval: c.approval,
                      p_capacity: c.max_active_parcels,
                      p_vehicle: c.vehicle,
                      p_plate: c.plate,
                    });
                  });
                }}
              >
                <p className="w-full font-semibold">{c.full_name}</p>
                <label className="grid gap-1 text-sm">
                  Autorisation
                  <select
                    className="border rounded-md p-2"
                    value={c.approval}
                    onChange={(e) =>
                      setCouriers((rows) =>
                        rows.map((r) =>
                          r.id === c.id
                            ? { ...r, approval: e.target.value }
                            : r,
                        ),
                      )
                    }
                  >
                    <option value="pending">En attente</option>
                    <option value="approved">Autorisé</option>
                    <option value="suspended">Suspendu</option>
                  </select>
                </label>
                <label className="grid gap-1 text-sm">
                  Véhicule
                  <Input
                    value={c.vehicle}
                    maxLength={80}
                    required
                    onChange={(e) =>
                      setCouriers((rows) =>
                        rows.map((r) =>
                          r.id === c.id ? { ...r, vehicle: e.target.value } : r,
                        ),
                      )
                    }
                  />
                </label>
                <label className="grid gap-1 text-sm">
                  Plaque
                  <Input
                    value={c.plate}
                    maxLength={40}
                    onChange={(e) =>
                      setCouriers((rows) =>
                        rows.map((r) =>
                          r.id === c.id ? { ...r, plate: e.target.value } : r,
                        ),
                      )
                    }
                  />
                </label>
                <label className="grid gap-1 text-sm">
                  Capacité en colis
                  <Input
                    type="number"
                    min={1}
                    max={50}
                    required
                    value={c.max_active_parcels}
                    onChange={(e) =>
                      setCouriers((rows) =>
                        rows.map((r) =>
                          r.id === c.id
                            ? {
                                ...r,
                                max_active_parcels: Number(e.target.value),
                              }
                            : r,
                        ),
                      )
                    }
                  />
                </label>
                <Button disabled={busy} type="submit">
                  Enregistrer le livreur
                </Button>
              </form>
            ))}
          </section>
        )}
      </div>
    </details>
  );
}
function PickupSetup({
  location,
  onUpdated,
}: {
  location: PickupLocation;
  onUpdated: () => void;
}) {
  const [point, setPoint] = useState<DestinationPoint | null>(null),
    [busy, setBusy] = useState(false),
    [failure, setFailure] = useState("");
  return (
    <section className="border rounded-xl p-4 grid gap-4">
      <h2 className="font-semibold">Confirmer le retrait : {location.name}</h2>
      <p className="text-sm">
        {location.address}. Placez le repère à l’entrée où le livreur récupérera
        les colis. Le retrait reste inactif tant que ce point n’est pas
        enregistré.
      </p>
      <DestinationPicker value={point} onChange={setPoint} />
      {failure && <p role="alert">{failure}</p>}
      <Button
        disabled={busy || !point?.confirmed}
        onClick={() => {
          if (!point?.confirmed) return;
          setBusy(true);
          setFailure("");
          void rpc("operator_confirm_location", {
            p_location_id: location.id,
            p_lat: point.lat,
            p_lng: point.lng,
          })
            .then(onUpdated)
            .catch((e) => setFailure(e.message))
            .finally(() => setBusy(false));
        }}
      >
        Activer ce point de retrait
      </Button>
    </section>
  );
}
