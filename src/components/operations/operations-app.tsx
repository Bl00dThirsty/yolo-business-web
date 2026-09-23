import { useEffect, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import {
  Plus,
  Trash2,
  LogOut,
  RefreshCw,
  Package,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DestinationPicker, type DestinationPoint } from "./destination-picker";
import logo from "@/assets/logo-yolo-black.png";

import { AccountSettings, type PickupLocation } from "./account-settings";

interface Pickup extends PickupLocation {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
}
interface Mission {
  id: string;
  reference: string;
  status: string;
  recipient_name: string;
  dropoff_address: string;
  courier_name?: string;
  plate?: string;
  pickup_acknowledged_at?: string;
  cash_to_collect: number;
  courier_fee: number;
}
interface Parcel {
  id: string;
  recipient: string;
  phone: string;
  address: string;
  landmark: string;
  description: string;
  weight: string;
  cash: string;
  fee: string;
  point: DestinationPoint | null;
}
const blankParcel = (): Parcel => ({
  id: crypto.randomUUID(),
  recipient: "",
  phone: "+237",
  address: "",
  landmark: "",
  description: "",
  weight: "1000",
  cash: "0",
  fee: "",
  point: null,
});
const labels: Record<string, string> = {
  searching: "Recherche du livreur",
  assigned: "Livreur en route",
  at_pickup: "Au retrait",
  picked_up: "En livraison",
  at_dropoff: "Chez le destinataire",
  delivered: "Livrée",
  cancelled: "Annulée",
};
class RpcFailure extends Error {
  constructor(
    message: string,
    readonly code: string,
  ) {
    super(message);
  }
}
async function rpc<T>(
  name: string,
  params?: Record<string, unknown>,
): Promise<T> {
  if (!supabase) throw Error("Connexion non configurée.");
  const { data, error } = await supabase.rpc(name, params);
  if (error) throw new RpcFailure(error.message, error.code);
  if (data?.error) throw Error(data.error);
  return data as T;
}
export default function OperationsApp() {
  const [session, setSession] = useState<Session | null>(null),
    [checking, setChecking] = useState(!!supabase);
  const [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [workspaceRevision, setWorkspaceRevision] = useState(0);
  const [sites, setSites] = useState<Pickup[]>([]),
    [site, setSite] = useState(""),
    [missions, setMissions] = useState<Mission[]>([]);
  const [parcels, setParcels] = useState<Parcel[]>(() => [blankParcel()]);
  const [creating, setCreating] = useState(false),
    [reference, setReference] = useState(""),
    [ready, setReady] = useState(true);
  const [proofs, setProofs] = useState<
    { delivery_id: string; recipient_pin?: string }[]
  >([]);
  const [challenge, setChallenge] = useState<{
    id: string;
    pin: string;
    expires_at: string;
  } | null>(null);
  const [now, setNow] = useState(Date.now());
  const [hasPending, setHasPending] = useState(false);
  const userId = session?.user.id;
  const pending = useRef<{
    key: string;
    payload: Record<string, unknown>;
  } | null>(null);
  const rememberPending = (value: typeof pending.current) => {
    pending.current = value;
    setHasPending(!!value);
  };
  const mutationLock = useRef(false);
  const readVersion = useRef(0);
  useEffect(() => {
    if (!supabase) return;
    let alive = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (alive) {
        setSession(data.session);
        setChecking(false);
      }
    });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setChecking(false);
      setChallenge(null);
      setProofs([]);
    });
    return () => {
      alive = false;
      data.subscription.unsubscribe();
    };
  }, []);
  useEffect(() => {
    setIsAdmin(false);
    setSites([]);
    setSite("");
    setMissions([]);
    setProofs([]);
    rememberPending(null);
    setParcels([blankParcel()]);
    if (!userId) return;
    let active = true;
    void rpc<{ locations: Pickup[]; is_admin: boolean }>("operator_workspace")
      .then((data) => {
        if (active) {
          setIsAdmin(data.is_admin);
          setSites(data.locations);
          setSite(data.locations[0]?.id ?? "");
        }
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [userId, workspaceRevision]);
  useEffect(() => {
    const current = ++readVersion.current;
    setMissions([]);
    setChallenge(null);
    if (!site || !userId) return;
    const refresh = () =>
      rpc<Mission[]>("operator_list_deliveries", { p_location_id: site })
        .then((rows) => {
          if (current === readVersion.current) setMissions(rows);
        })
        .catch((e) => {
          if (current === readVersion.current) setError(e.message);
        });
    void refresh();
    const timer = setInterval(() => void refresh(), 15000);
    return () => {
      readVersion.current++;
      clearInterval(timer);
    };
  }, [site, userId]);
  useEffect(() => {
    if (!challenge) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [challenge]);
  const run = async (action: () => Promise<void>) => {
    if (mutationLock.current) return;
    mutationLock.current = true;
    setBusy(true);
    setError("");
    try {
      await action();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Opération interrompue. Réessayez.",
      );
    } finally {
      mutationLock.current = false;
      setBusy(false);
    }
  };
  const refresh = async () => {
    const current = readVersion.current;
    const rows = await rpc<Mission[]>("operator_list_deliveries", {
      p_location_id: site,
    });
    if (current === readVersion.current) setMissions(rows);
  };
  const update = (id: string, patch: Partial<Parcel>) =>
    setParcels((items) =>
      items.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    );
  const confirm = () =>
    run(async () => {
      if (!pending.current) {
        if (!sites.find((s) => s.id === site)?.active || !reference.trim())
          throw Error(
            "Choisissez le point de retrait et une référence de commande.",
          );
        if (
          parcels.some(
            (p) =>
              !p.point?.confirmed ||
              p.recipient.trim().length < 2 ||
              !/^\+[1-9][0-9]{7,14}$/.test(p.phone.replace(/\s/g, "")) ||
              p.address.trim().length < 3 ||
              p.fee === "" ||
              !Number.isInteger(Number(p.fee)) ||
              Number(p.fee) < 0 ||
              !Number.isInteger(Number(p.cash)) ||
              Number(p.cash) < 0 ||
              Number(p.weight) <= 0,
          )
        )
          throw Error(
            "Vérifiez les coordonnées, le destinataire et les montants de chaque colis.",
          );
        rememberPending({
          key: crypto.randomUUID(),
          payload: {
            location_id: site,
            external_reference: reference.trim(),
            parcels: parcels.map((p) => ({
              recipient_name: p.recipient.trim(),
              recipient_phone: p.phone.replace(/\s/g, ""),
              dropoff_address: p.address.trim(),
              dropoff_area: p.point!.neighborhood,
              dropoff_lat: p.point!.lat,
              dropoff_lng: p.point!.lng,
              description: p.description,
              weight_grams: Number(p.weight),
              courier_fee: Number(p.fee),
              cash_to_collect: Number(p.cash),
              ready,
              ready_at: ready
                ? new Date().toISOString()
                : "2099-01-01T00:00:00Z",
              destination_metadata: {
                method: "map_pin",
                confirmed: true,
                provider: "yolo-area-catalog-v1",
                search_query: p.point!.query,
                landmark: p.landmark,
              },
            })),
          },
        });
        sessionStorage.setItem(
          "yolo.pending-batch." + userId,
          JSON.stringify(pending.current),
        );
      }
      let result: {
        deliveries: { delivery_id: string; recipient_pin?: string }[];
      };
      try {
        result = await rpc<{
          deliveries: { delivery_id: string; recipient_pin?: string }[];
        }>("operator_create_batch", {
          p_payload: pending.current!.payload,
          p_request_id: pending.current!.key,
        });
      } catch (e) {
        if (
          e instanceof RpcFailure &&
          (e.code === "P0001" ||
            e.code.startsWith("22") ||
            e.code.startsWith("23"))
        ) {
          rememberPending(null);
          sessionStorage.removeItem("yolo.pending-batch." + userId);
        }
        throw e;
      }
      rememberPending(null);
      sessionStorage.removeItem("yolo.pending-batch." + userId);
      setProofs(result.deliveries);
      setParcels([blankParcel()]);
      setReference("");
      setCreating(false);
      await refresh();
    });
  useEffect(() => {
    if (!userId) return;
    try {
      const raw = sessionStorage.getItem("yolo.pending-batch." + userId);
      if (raw) {
        rememberPending(JSON.parse(raw));
        setError(
          "Une création attend sa confirmation. Utilisez « Vérifier la demande en attente ».",
        );
      }
    } catch {
      setError(
        "Le brouillon en attente est illisible. Contactez l’assistance avec votre référence avant de recréer une demande.",
      );
    }
  }, [userId]);
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-5 py-5 flex items-center justify-between gap-4">
          <a href="/" className="flex flex-col items-center">
            <img src={logo} alt="Yolo" className="w-24" />
            <span className="text-[10px] tracking-[.28em] font-semibold mt-1">
              BUSINESS
            </span>
          </a>
          <div className="flex gap-3 items-center">
            <a href="/demo" className="text-xs underline">
              Voir la démonstration
            </a>
            {session && (
              <Button
                variant="outline"
                disabled={busy || hasPending}
                onClick={() =>
                  void run(async () => {
                    if (userId)
                      sessionStorage.removeItem("yolo.pending-batch." + userId);
                    await supabase!.auth.signOut();
                  })
                }
              >
                <LogOut data-icon="inline-start" />
                Déconnexion
              </Button>
            )}
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto p-5 md:p-9 flex flex-col gap-6">
        {error && (
          <div
            role="alert"
            className="border border-destructive rounded-xl p-4 text-sm"
          >
            {error}
          </div>
        )}
        {checking ? (
          <p role="status">Connexion à votre espace…</p>
        ) : !supabase ? (
          <div className="max-w-xl border rounded-2xl bg-card p-8">
            <h1 className="text-3xl font-bold mb-4">
              Votre espace de livraison
            </h1>
            <p>
              La connexion au service Yolo doit être configurée pour cette
              installation.
            </p>
          </div>
        ) : !session ? (
          <section className="max-w-md mx-auto w-full py-12">
            <ShieldCheck className="size-9 mb-5" />
            <h1 className="text-4xl font-bold">
              Chaque colis.
              <br />
              Au bon endroit.
            </h1>
            <p className="text-muted-foreground mt-4 mb-8">
              Connectez-vous avec le compte autorisé pour votre point de
              retrait.
            </p>
            <form
              className="flex flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                void run(async () => {
                  const { error: failure } =
                    await supabase!.auth.signInWithPassword({
                      email: email.trim(),
                      password,
                    });
                  if (failure)
                    throw Error(
                      "Connexion impossible. Vérifiez vos identifiants.",
                    );
                  setPassword("");
                });
              }}
            >
              <label className="text-sm flex flex-col gap-2">
                E-mail
                <Input
                  type="email"
                  autoComplete="username"
                  value={email}
                  required
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
              <label className="text-sm flex flex-col gap-2">
                Mot de passe
                <Input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  required
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>
              <Button variant="yolo" size="lg" disabled={busy} type="submit">
                {busy ? "Connexion…" : "Se connecter"}
                <ArrowRight data-icon="inline-end" />
              </Button>
            </form>
            <p className="text-xs text-muted-foreground mt-5">
              L’accès aux points de retrait est accordé par l’équipe Yolo.
            </p>
          </section>
        ) : (
          <>
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div>
                <p className="text-xs tracking-widest text-muted-foreground mb-2">
                  ESPACE CONNECTÉ
                </p>
                <h1 className="text-3xl font-bold">
                  Vos colis, leurs destinations.
                </h1>
              </div>
              <Button
                variant="yolo"
                size="lg"
                disabled={!sites.find((s) => s.id === site)?.active || busy}
                onClick={() => setCreating((v) => !v)}
              >
                <Plus data-icon="inline-start" />
                Nouvelle demande
              </Button>
            </div>
            <AccountSettings
              key={userId}
              locations={sites}
              isAdmin={isAdmin}
              onUpdated={() => setWorkspaceRevision((v) => v + 1)}
            />
            {sites.some((s) => !s.active) && (
              <p className="border rounded-xl p-4">
                Confirmez le point de retrait dans « Mon compte » pour créer vos
                demandes.
              </p>
            )}
            {sites.length === 0 ? (
              <p className="border rounded-xl p-6">
                Votre compte est connecté. Aucun point de retrait ne lui est
                encore attribué. L’équipe Yolo doit activer cet accès.
              </p>
            ) : (
              <label className="text-sm flex flex-col gap-2 max-w-md">
                Point de retrait
                <select
                  className="border rounded-md p-2 bg-card"
                  value={site}
                  disabled={busy || hasPending}
                  onChange={(e) => setSite(e.target.value)}
                >
                  {sites.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} · {s.address}
                    </option>
                  ))}
                </select>
              </label>
            )}
            {hasPending && (
              <Button disabled={busy} onClick={() => void confirm()}>
                Vérifier la demande en attente
              </Button>
            )}
            {proofs.length > 0 && (
              <section className="border rounded-xl bg-card p-5 flex flex-col gap-3">
                <h2 className="font-semibold">Demande enregistrée</h2>
                <p className="text-sm">
                  Transmettez chaque code uniquement au destinataire
                  correspondant. Les codes ne sont affichés qu’une fois et ne
                  sont pas accessibles au livreur.
                </p>
                {proofs.map((p, i) => (
                  <div key={p.delivery_id} className="text-sm">
                    Colis {i + 1} · {p.delivery_id.slice(0, 8)} :{" "}
                    <strong>
                      {p.recipient_pin ??
                        "Code déjà émis — contacter l’exploitation si nécessaire"}
                    </strong>
                  </div>
                ))}
                <Button variant="outline" onClick={() => setProofs([])}>
                  Masquer les codes
                </Button>
              </section>
            )}
            {creating && (
              <section className="flex flex-col gap-5">
                <div className="bg-primary text-primary-foreground rounded-2xl p-6">
                  <h2 className="text-2xl font-semibold">
                    Un colis, une destination.
                  </h2>
                  <p className="text-sm mt-2">
                    Ajoutez les colis de votre demande. Ils pourront être
                    attribués au même livreur selon sa capacité.
                  </p>
                </div>
                <fieldset
                  disabled={busy || hasPending}
                  className="flex flex-col gap-5"
                >
                  <label className="flex flex-col gap-2 text-sm">
                    Référence de la commande
                    <Input
                      value={reference}
                      maxLength={160}
                      placeholder="Votre référence unique"
                      onChange={(e) => setReference(e.target.value)}
                    />
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={ready}
                      onChange={(e) => setReady(e.target.checked)}
                    />
                    Colis prêts à être retirés maintenant
                  </label>
                  {parcels.map((p, i) => (
                    <section
                      key={p.id}
                      className="border rounded-2xl p-5 bg-card flex flex-col gap-5"
                    >
                      <div className="flex justify-between items-center">
                        <h3 className="text-xl font-semibold flex items-center gap-2">
                          <Package className="size-5" />
                          Colis {i + 1}
                        </h3>
                        <Button
                          variant="ghost"
                          type="button"
                          aria-label={"Supprimer le colis " + (i + 1)}
                          disabled={parcels.length === 1}
                          onClick={() =>
                            setParcels((items) =>
                              items.filter((item) => item.id !== p.id),
                            )
                          }
                        >
                          <Trash2 />
                        </Button>
                      </div>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-3">
                          {(
                            [
                              {
                                key: "recipient",
                                label: "Nom du destinataire",
                              },
                              {
                                key: "phone",
                                label: "Téléphone international",
                                type: "tel",
                              },
                              { key: "address", label: "Adresse de livraison" },
                              {
                                key: "landmark",
                                label: "Repère ou consigne d’accès",
                              },
                              {
                                key: "description",
                                label: "Description du colis",
                              },
                              {
                                key: "weight",
                                label: "Poids en grammes",
                                type: "number",
                              },
                              {
                                key: "cash",
                                label:
                                  "Espèces à collecter pour ce colis (FCFA)",
                                type: "number",
                              },
                              {
                                key: "fee",
                                label: "Rémunération livreur autorisée (FCFA)",
                                type: "number",
                              },
                            ] as const
                          ).map((f) => (
                            <label
                              key={f.key}
                              className="flex flex-col gap-1 text-xs"
                            >
                              {f.label}
                              <Input
                                value={p[f.key]}
                                type={"type" in f ? f.type : "text"}
                                min={f.key === "weight" ? 1 : 0}
                                maxLength={500}
                                onChange={(e) =>
                                  update(p.id, { [f.key]: e.target.value })
                                }
                              />
                            </label>
                          ))}
                        </div>
                        <DestinationPicker
                          value={p.point}
                          onChange={(point) => update(p.id, { point })}
                        />
                      </div>
                    </section>
                  ))}
                  <Button
                    variant="outline"
                    type="button"
                    disabled={parcels.length >= 50}
                    onClick={() =>
                      setParcels((items) => [...items, blankParcel()])
                    }
                  >
                    <Plus />
                    Ajouter un colis et sa destination
                  </Button>
                </fieldset>
                <Button
                  variant="yolo"
                  size="lg"
                  disabled={busy}
                  onClick={() => void confirm()}
                >
                  {busy
                    ? "Enregistrement…"
                    : `Confirmer la demande de ${parcels.length} colis`}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Cet espace pilote est réservé aux opérateurs habilités. Les
                  tarifs commerçants automatisés et les reversements ne sont pas
                  encore activés.
                </p>
              </section>
            )}
            {site && (
              <section className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">
                    Livraisons du point de retrait
                  </h2>
                  <Button
                    variant="outline"
                    disabled={busy}
                    onClick={() => void run(refresh)}
                  >
                    <RefreshCw />
                    Actualiser
                  </Button>
                </div>
                {missions.length === 0 ? (
                  <p className="p-8 border rounded-xl text-muted-foreground">
                    Aucune livraison pour ce point de retrait.
                  </p>
                ) : (
                  missions.map((m) => (
                    <article
                      key={m.id}
                      className="border rounded-xl bg-card p-5 flex flex-col gap-3"
                    >
                      <div className="flex flex-wrap justify-between gap-3">
                        <strong>{m.reference}</strong>
                        <span className="text-sm">
                          {labels[m.status] ?? m.status}
                        </span>
                      </div>
                      <p className="text-sm">
                        {m.recipient_name} · {m.dropoff_address}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {m.courier_name
                          ? `Livreur : ${m.courier_name} · ${m.plate || "Plaque non renseignée"}`
                          : "Livreur non attribué"}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {!["delivered", "cancelled"].includes(m.status) && (
                          <Button
                            variant="outline"
                            disabled={busy}
                            onClick={() =>
                              void run(async () => {
                                const reason = window.prompt(
                                  "Après vérification du destinataire, indiquez le motif de réémission (10 caractères minimum). L’ancien code sera invalidé.",
                                );
                                if (!reason) return;
                                const proof = await rpc<{
                                  delivery_id: string;
                                  recipient_pin: string;
                                }>("operator_reissue_recipient_code", {
                                  p_delivery_id: m.id,
                                  p_reason: reason,
                                });
                                setProofs([proof]);
                              })
                            }
                          >
                            Réémettre le code destinataire
                          </Button>
                        )}
                        {["searching", "assigned", "at_pickup"].includes(
                          m.status,
                        ) && (
                          <Button
                            variant="outline"
                            disabled={busy}
                            onClick={() =>
                              void run(async () => {
                                await rpc("operator_set_ready", {
                                  p_delivery_id: m.id,
                                  p_ready: true,
                                  p_ready_at: new Date().toISOString(),
                                });
                                await refresh();
                              })
                            }
                          >
                            Colis prêt
                          </Button>
                        )}
                        {m.status === "at_pickup" && (
                          <>
                            <Button
                              disabled={busy}
                              onClick={() =>
                                void run(async () => {
                                  const c = await rpc<{
                                    pin: string;
                                    expires_at: string;
                                  }>("operator_issue_pickup", {
                                    p_delivery_id: m.id,
                                  });
                                  setNow(Date.now());
                                  setChallenge({ id: m.id, ...c });
                                })
                              }
                            >
                              Afficher le code de retrait
                            </Button>
                            <Button
                              variant="yolo"
                              disabled={busy || !m.pickup_acknowledged_at}
                              onClick={() =>
                                void run(async () => {
                                  if (
                                    !window.confirm(
                                      "Avez-vous vérifié le livreur attribué et remis physiquement ce colis ?",
                                    )
                                  )
                                    return;
                                  await rpc("operator_confirm_pickup", {
                                    p_delivery_id: m.id,
                                    p_request_id: crypto.randomUUID(),
                                  });
                                  setChallenge(null);
                                  await refresh();
                                })
                              }
                            >
                              Confirmer la remise physique
                            </Button>
                          </>
                        )}
                      </div>
                      {challenge?.id === m.id && (
                        <div className="bg-muted rounded-lg p-4">
                          <p className="text-xs">
                            À saisir dans l’application du livreur attribué
                          </p>
                          <p className="font-mono text-3xl tracking-widest my-2">
                            {new Date(challenge.expires_at).getTime() > now
                              ? challenge.pin
                              : "Expiré"}
                          </p>
                          <p className="text-xs">
                            {m.pickup_acknowledged_at
                              ? "Code validé par le livreur. Confirmez après remise du colis."
                              : "En attente de validation du livreur."}
                          </p>
                        </div>
                      )}
                    </article>
                  ))
                )}
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
