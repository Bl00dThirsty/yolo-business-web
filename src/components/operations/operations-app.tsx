import { WorkspaceHeader } from "@/components/business/workspace-header";
import { ContextHelp } from "@/components/ui/context-help";
import { useActionPopup } from "@/components/ui/action-popup";
import { AuthPage } from "./auth-page";
import { BusinessWorkspace } from "@/components/business/business-workspace";
import { AcceptInvitation } from "@/components/business/accept-invitation";
import { useEffect, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import {
  Plus,
  Trash2,
  RefreshCw,
  Package,
  CheckCircle2,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DestinationPicker, type DestinationPoint } from "./destination-picker";

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
  const { openAction, popup } = useActionPopup();
  const [session, setSession] = useState<Session | null>(null),
    [checking, setChecking] = useState(!!supabase);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const [recovery, setRecovery] = useState(
    () =>
      new URLSearchParams(window.location.search).get("reset") === "1" ||
      new URLSearchParams(window.location.hash.slice(1)).get("type") ===
        "recovery",
  );
  const [workspaceView, setWorkspaceView] = useState("dashboard");
  const [guideRequest, setGuideRequest] = useState(0);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 8000);
    return () => window.clearTimeout(timer);
  }, [notice]);
  const [readError, setReadError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [offline, setOffline] = useState(!navigator.onLine);
  const latestRead = useRef(0);
  const errorPanel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (error) errorPanel.current?.focus();
  }, [error]);
  useEffect(() => {
    const online = () => setOffline(false),
      offline = () => setOffline(true);
    window.addEventListener("online", online);
    window.addEventListener("offline", offline);
    return () => {
      window.removeEventListener("online", online);
      window.removeEventListener("offline", offline);
    };
  }, []);
  const [invitationToken] = useState(() => {
    if (window.location.pathname !== "/invitation") return "";
    return (
      new URLSearchParams(window.location.hash.slice(1)).get("token") ||
      new URLSearchParams(window.location.search).get("invitation") ||
      sessionStorage.getItem("yolo.business.invitation") ||
      ""
    );
  });
  useEffect(() => {
    if (invitationToken) {
      sessionStorage.setItem("yolo.business.invitation", invitationToken);
      const url = new URL(window.location.href);
      url.searchParams.delete("invitation");
      if (url.hash.startsWith("#token=")) url.hash = "";
      window.history.replaceState(
        null,
        "",
        url.pathname + url.search + url.hash,
      );
    }
  }, [invitationToken]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [missionsLoading, setMissionsLoading] = useState(false);
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
  const [now, setNow] = useState(Date.now);
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
    void supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (error) throw error;
        if (alive) {
          setSession(data.session);
          setChecking(false);
        }
      })
      .catch(() => {
        if (alive) {
          setChecking(false);
          setError(
            "Votre session n’a pas pu être vérifiée. Rechargez la page.",
          );
        }
      });
    const { data } = supabase.auth.onAuthStateChange((event, next) => {
      setSession(next);
      setChecking(false);
      if (event === "PASSWORD_RECOVERY") setRecovery(true);
      if (event === "SIGNED_OUT") {
        setWorkspaceView("dashboard");
        setGuideRequest(0);
        setChallenge(null);
        setProofs([]);
        setNotice("");
      }
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
    setParcels([blankParcel()]);
    if (!userId) return;
    let active = true;
    void rpc<{ locations: Pickup[]; is_admin: boolean }>("operator_workspace")
      .then((data) => {
        if (active) {
          setIsAdmin(data.is_admin);
          setSites(data.locations);
          setSite(
            data.locations.find(
              (l) => l.id === pending.current?.payload.location_id,
            )?.id ??
              data.locations[0]?.id ??
              "",
          );
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
    setLastUpdated(null);
    setReadError("");
    setChallenge(null);
    if (!site || !userId) {
      setMissionsLoading(false);
      return;
    }
    setMissionsLoading(true);
    const poll = async () => {
      const request = ++latestRead.current;
      try {
        const rows = await rpc<Mission[]>("operator_list_deliveries", {
          p_location_id: site,
        });
        if (current === readVersion.current && request === latestRead.current) {
          setMissions(rows);
          setMissionsLoading(false);
          setReadError("");
          setLastUpdated(new Date());
        }
      } catch {
        if (current === readVersion.current && request === latestRead.current) {
          setReadError(
            "Actualisation impossible. Les informations affichées peuvent être anciennes.",
          );
          setMissionsLoading(false);
        }
      }
    };
    void poll();
    const timer = setInterval(() => void poll(), 15000);
    return () => {
      readVersion.current++;
      clearInterval(timer);
    };
  }, [site, userId]);
  useEffect(() => {
    if (!challenge) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [challenge]);
  useEffect(() => {
    if (!creating && !hasPending) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [creating, hasPending]);
  const run = async (action: () => Promise<void>) => {
    if (mutationLock.current) return;
    mutationLock.current = true;
    setBusy(true);
    setError("");
    setNotice("");
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
    const current = readVersion.current,
      request = ++latestRead.current;
    try {
      const rows = await rpc<Mission[]>("operator_list_deliveries", {
        p_location_id: site,
      });
      if (current === readVersion.current && request === latestRead.current) {
        setMissions(rows);
        setMissionsLoading(false);
        setReadError("");
        setLastUpdated(new Date());
      }
    } catch {
      if (current === readVersion.current && request === latestRead.current)
        setReadError(
          "La liste n’a pas pu être actualisée. Réessayez pour consulter son état récent.",
        );
    }
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
              cash_to_collect: 0,
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
      const pendingParcels = pending.current?.payload.parcels as
        { cash_to_collect?: number }[] | undefined;
      if (pendingParcels?.some((p) => Number(p.cash_to_collect || 0) !== 0))
        throw Error(
          "Cette ancienne demande comporte un encaissement de produit. Contactez l’équipe Yolo avant de la reprendre.",
        );
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
      setNotice("Votre demande de livraison a bien été enregistrée.");
      setProofs(result.deliveries);
      setParcels([blankParcel()]);
      setReference("");
      setCreating(false);
      await refresh();
    });
  useEffect(() => {
    if (!userId) {
      rememberPending(null);
      return;
    }
    try {
      rememberPending(null);
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
      {session && !recovery && (
        <WorkspaceHeader
          email={session.user.email || ""}
          name={
            typeof session.user.user_metadata?.display_name === "string"
              ? session.user.user_metadata.display_name
              : ""
          }
          disabled={busy || hasPending}
          onSettings={() => setWorkspaceView("settings")}
          onGuide={() => {
            setWorkspaceView("dashboard");
            setGuideRequest((v) => v + 1);
          }}
          onSignOut={() =>
            void run(async () => {
              if (userId)
                sessionStorage.removeItem("yolo.pending-batch." + userId);
              const { error } = await supabase!.auth.signOut();
              if (error)
                throw Error("La déconnexion n’a pas abouti. Réessayez.");
            })
          }
        />
      )}
      <main className={session && !recovery ? "business-main-root" : ""}>
        {error && (
          <div
            role="alert"
            ref={errorPanel}
            tabIndex={-1}
            className="bw-global-error"
          >
            {error}
          </div>
        )}
        {session && !recovery && notice && (
          <div className="bw-action-feedback" role="status">
            <CheckCircle2 size={18} />
            <span>{notice}</span>
            <button
              onClick={() => setNotice("")}
              aria-label="Fermer la confirmation"
            >
              <X size={16} />
            </button>
          </div>
        )}
        {session && !recovery && (offline || readError) && (
          <div className="bw-read-warning" role="status">
            <span>
              {offline
                ? "Vous êtes hors connexion. Vos données restent affichées ; reconnectez-vous pour valider une action."
                : readError}
            </span>
            <button
              disabled={offline || busy}
              onClick={() => void run(refresh)}
            >
              Réessayer
            </button>
          </div>
        )}
        {checking ? (
          <div
            className="app-loading"
            role="progressbar"
            aria-label="Vérification de la connexion"
          >
            <span />
          </div>
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
        ) : !session || recovery ? (
          <AuthPage
            invitationToken={invitationToken}
            recovery={recovery && !!session}
            onRecovered={() => {
              setRecovery(false);
              window.history.replaceState(null, "", "/app");
              setNotice("Votre mot de passe a été modifié.");
            }}
          />
        ) : window.location.pathname === "/invitation" ? (
          <AcceptInvitation
            onAccepted={() => {
              window.location.href = "/app";
            }}
          />
        ) : (
          <BusinessWorkspace
            view={workspaceView}
            onNavigate={setWorkspaceView}
            guideRequest={guideRequest}
            key={userId}
            settings={
              <AccountSettings
                displayName={
                  typeof session.user.user_metadata?.display_name === "string"
                    ? session.user.user_metadata.display_name
                    : ""
                }
                key={userId}
                locations={sites}
                isAdmin={isAdmin}
                onUpdated={() => setWorkspaceRevision((v) => v + 1)}
              />
            }
            sites={sites}
            site={site}
            setSite={setSite}
            missions={missions}
            userId={userId!}
            email={session.user.email || "Mon compte"}
            locked={busy || hasPending || offline || creating}
            loading={missionsLoading}
            lastUpdated={lastUpdated}
            readFailed={!!readError}
            onCreate={() => setCreating(true)}
          >
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div>
                <p className="text-xs tracking-widest text-muted-foreground mb-2">
                  ESPACE CONNECTÉ
                </p>
                <h1 className="text-3xl font-bold">Vos livraisons</h1>
              </div>
              <Button
                variant="yolo"
                size="lg"
                disabled={
                  !sites.find((s) => s.id === site)?.active ||
                  busy ||
                  offline ||
                  hasPending
                }
                onClick={() => setCreating((v) => !v)}
              >
                <Plus data-icon="inline-start" />
                {creating ? "Fermer le formulaire" : "Nouvelle demande"}
              </Button>
            </div>

            {sites.some((s) => !s.active) && (
              <p className="border rounded-xl p-4">
                Confirmez le point de retrait dans « Mon compte » pour créer vos
                demandes.
              </p>
            )}
            {hasPending && (
              <Button disabled={busy || offline} onClick={() => void confirm()}>
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
                  disabled={busy || offline}
                  onClick={() => void confirm()}
                >
                  {busy
                    ? "Enregistrement…"
                    : `Confirmer la demande de ${parcels.length} colis`}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Vérifiez les coordonnées et le montant de livraison de chaque
                  colis avant de confirmer.
                </p>
              </section>
            )}
            {site && (
              <section className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">
                    Livraisons du point de retrait{" "}
                    <ContextHelp label="Aide : cycle de livraison">
                      Le statut suit les actions du livreur. Vous pouvez annuler
                      avant le retrait ; une remise confirmée nécessite ensuite
                      un traitement par l’assistance.
                    </ContextHelp>
                  </h2>
                  <Button
                    variant="outline"
                    disabled={busy || offline}
                    onClick={() => void run(refresh)}
                  >
                    <RefreshCw />
                    Actualiser
                  </Button>
                </div>
                {missionsLoading ? (
                  <p role="status">Actualisation des livraisons…</p>
                ) : readError && !lastUpdated ? (
                  <p className="bw-empty">
                    Les livraisons ne sont pas disponibles pour le moment.
                  </p>
                ) : missions.length === 0 ? (
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
                        {["searching", "assigned", "at_pickup"].includes(
                          m.status,
                        ) && (
                          <Button
                            variant="outline"
                            disabled={busy || offline}
                            onClick={() => {
                              const requestId = crypto.randomUUID();
                              openAction({
                                title:
                                  "Annuler la livraison " + m.reference + " ?",
                                description:
                                  "Le colis doit encore être au point de retrait. Cette annulation mettra fin à la recherche ou à l’affectation du livreur.",
                                confirm: "Annuler la livraison",
                                destructive: true,
                                onConfirm: async () => {
                                  await rpc("operator_release_delivery", {
                                    p_delivery_id: m.id,
                                    p_cancel: true,
                                    p_request_id: requestId,
                                  });
                                  setChallenge((current) =>
                                    current?.id === m.id ? null : current,
                                  );
                                  setProofs((current) =>
                                    current.filter(
                                      (proof) => proof.delivery_id !== m.id,
                                    ),
                                  );
                                  setNotice(
                                    "La livraison " +
                                      m.reference +
                                      " a été annulée.",
                                  );
                                  await refresh();
                                },
                              });
                            }}
                          >
                            Annuler la livraison
                          </Button>
                        )}

                        {!["delivered", "cancelled"].includes(m.status) && (
                          <Button
                            variant="outline"
                            disabled={busy || offline}
                            onClick={() =>
                              openAction({
                                title: "Réémettre le code destinataire",
                                description:
                                  "Vérifiez l’identité du destinataire avant de continuer. L’ancien code sera invalidé.",
                                confirm: "Créer le nouveau code",
                                inputLabel: "Motif de réémission",
                                minLength: 10,
                                onConfirm: async (reason) => {
                                  const proof = await rpc<{
                                    delivery_id: string;
                                    recipient_pin: string;
                                  }>("operator_reissue_recipient_code", {
                                    p_delivery_id: m.id,
                                    p_reason: reason,
                                  });
                                  setProofs([proof]);
                                  setNotice(
                                    "Le nouveau code est disponible. L’ancien a été invalidé.",
                                  );
                                },
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
                            disabled={busy || offline}
                            onClick={() =>
                              void run(async () => {
                                await rpc("operator_set_ready", {
                                  p_delivery_id: m.id,
                                  p_ready: true,
                                  p_ready_at: new Date().toISOString(),
                                });
                                setNotice("Le colis est prêt pour le retrait.");
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
                              disabled={busy || offline}
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
                                  setNotice(
                                    "Le code de retrait est affiché sur la livraison concernée.",
                                  );
                                })
                              }
                            >
                              Afficher le code de retrait
                            </Button>
                            <Button
                              variant="yolo"
                              disabled={
                                busy || offline || !m.pickup_acknowledged_at
                              }
                              onClick={() => {
                                const requestId = crypto.randomUUID();
                                openAction({
                                  title: "Confirmer la remise du colis",
                                  description:
                                    "Avez-vous vérifié le livreur attribué et remis physiquement ce colis ?",
                                  confirm: "Confirmer la remise",
                                  onConfirm: async () => {
                                    await rpc("operator_confirm_pickup", {
                                      p_delivery_id: m.id,
                                      p_request_id: requestId,
                                    });
                                    setChallenge(null);
                                    setNotice(
                                      "La remise du colis au livreur est confirmée.",
                                    );
                                    await refresh();
                                  },
                                });
                              }}
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
          </BusinessWorkspace>
        )}
      </main>
      {popup}
    </div>
  );
}
