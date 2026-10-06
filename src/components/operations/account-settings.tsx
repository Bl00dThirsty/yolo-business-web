import { InlineEdit } from "@/components/ui/inline-edit";
import { ContextHelp } from "@/components/ui/context-help";
import { useEffect, useRef, useState } from "react";
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
  displayName,
  locations,
  isAdmin,
  onUpdated,
}: {
  displayName: string;
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
    <details open className="border rounded-2xl bg-card p-5">
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
        <InlineEdit
          label="Nom affiché"
          value={displayName}
          maxLength={80}
          onSave={async (name) => {
            const { error } = await supabase!.auth.updateUser({
              data: { display_name: name },
            });
            if (error) throw Error(error.message);
          }}
        />
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
              <CourierSettings
                key={c.id}
                courier={c}
                onSaved={(next) =>
                  setCouriers((rows) =>
                    rows.map((row) => (row.id === next.id ? next : row)),
                  )
                }
              />
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

function CourierSettings({
  courier,
  onSaved,
}: {
  courier: Courier;
  onSaved: (courier: Courier) => void;
}) {
  const [saving, setSaving] = useState(false),
    [approval, setApproval] = useState(courier.approval),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const updateLock = useRef(false);
  async function update(patch: Partial<Courier>) {
    if (updateLock.current)
      throw Error("Une modification est en cours. Réessayez dans un instant.");
    updateLock.current = true;
    const next = { ...courier, ...patch };
    setSaving(true);
    try {
      await rpc("admin_update_courier", {
        p_id: next.id,
        p_approval: next.approval,
        p_capacity: next.max_active_parcels,
        p_vehicle: next.vehicle,
        p_plate: next.plate,
      });
      onSaved(next);
    } finally {
      updateLock.current = false;
      setSaving(false);
    }
  }
  return (
    <article className="border rounded-xl p-4 grid gap-3">
      <h3 className="font-semibold">{courier.full_name}</h3>
      <div className="bw-courier-fields">
        <InlineEdit
          label="Véhicule"
          value={courier.vehicle || ""}
          disabled={saving}
          onSave={(vehicle) => update({ vehicle })}
        />
        <InlineEdit
          label="Plaque"
          value={courier.plate || ""}
          maxLength={40}
          disabled={saving}
          onSave={(plate) => update({ plate })}
        />
        <InlineEdit
          label="Capacité en colis"
          value={String(courier.max_active_parcels)}
          disabled={saving}
          maxLength={2}
          onSave={async (value) => {
            if (!/^\d+$/.test(value) || Number(value) < 1 || Number(value) > 50)
              throw Error("Indiquez un nombre entier entre 1 et 50.");
            await update({ max_active_parcels: Number(value) });
          }}
        />
      </div>
      <form
        className="flex flex-wrap items-end gap-3"
        onSubmit={async (e) => {
          e.preventDefault();
          if (saving) return;
          setError("");
          setNotice("");
          try {
            await update({ approval });
            setNotice("Autorisation mise à jour.");
          } catch (e) {
            setError(e instanceof Error ? e.message : "Veuillez réessayer.");
          }
        }}
      >
        <label className="grid gap-1 text-sm">
          <span>
            Autorisation{" "}
            <ContextHelp label="Aide : autorisation du livreur">
              Autoriser un livreur lui permet de recevoir des courses. Vérifiez
              son identité et son véhicule avant de valider.
            </ContextHelp>
          </span>
          <select
            className="border rounded-md p-2"
            disabled={saving}
            value={approval}
            onChange={(e) => setApproval(e.target.value)}
          >
            <option value="pending">En attente</option>
            <option value="approved">Autorisé</option>
            <option value="suspended">Suspendu</option>
          </select>
        </label>
        <Button
          type="submit"
          disabled={saving || approval === courier.approval}
        >
          {saving ? "Enregistrement…" : "Valider l’autorisation"}
        </Button>
      </form>
      {error && (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="text-sm">
          {notice}
        </p>
      )}
    </article>
  );
}
