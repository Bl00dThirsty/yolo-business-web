import "@fontsource-variable/manrope";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  LayoutDashboard,
  Package,
  MapPin,
  Users,
  Settings,
  Plus,
  ArrowRight,
  Menu,
  X,
} from "lucide-react";
import { BusinessTeam } from "./team-view";
import "./business.css";
interface Site {
  id: string;
  name: string;
  address: string;
  active: boolean;
}
interface Mission {
  id: string;
  reference: string;
  status: string;
  recipient_name: string;
  dropoff_address: string;
  created_at?: string;
}
const statuses: Record<string, string> = {
  searching: "Recherche du livreur",
  assigned: "Livreur en route",
  at_pickup: "Au retrait",
  picked_up: "En livraison",
  at_dropoff: "Chez le destinataire",
  delivered: "Livrée",
  cancelled: "Annulée",
};
const navigation = [
  ["dashboard", "Tableau de bord", LayoutDashboard],
  ["deliveries", "Livraisons", Package],
  ["sites", "Points de retrait", MapPin],
  ["team", "Équipe", Users],
  ["settings", "Paramètres", Settings],
] as const;
export function BusinessWorkspace({
  children,
  settings,
  sites,
  site,
  setSite,
  missions,
  userId,
  email,
  locked,
  onCreate,
  loading,
  lastUpdated,
  readFailed,
}: {
  children: ReactNode;
  settings: ReactNode;
  sites: Site[];
  site: string;
  setSite: (id: string) => void;
  missions: Mission[];
  userId: string;
  email: string;
  locked: boolean;
  onCreate: () => void;
  loading: boolean;
  lastUpdated: Date | null;
  readFailed: boolean;
}) {
  const [view, setView] = useState<string>("dashboard"),
    [menu, setMenu] = useState(false);
  const viewHeading = useRef<HTMLDivElement>(null);
  const firstView = useRef(true);
  useEffect(() => {
    if (firstView.current) { firstView.current = false; return; }
    viewHeading.current?.focus({ preventScroll: true });
  }, [view]);
  const selected = sites.find((s) => s.id === site);
  const inProgress = missions.filter(
    (m) => !["delivered", "cancelled"].includes(m.status),
  ).length;
  function navigate(next: string) {
    setView(next);
    setMenu(false);
  }
  function create() {
    navigate("deliveries");
    onCreate();
  }
  return (
    <div className="business-workspace">
      <button
        className="bw-mobile-menu"
        aria-expanded={menu}
        onClick={() => setMenu(!menu)}
      >
        {menu ? <X size={18} /> : <Menu size={18} />}Navigation
      </button>
      <aside className={`bw-sidebar ${menu ? "is-open" : ""}`}>
        <span className="bw-sidebar-label">ESPACE ENTREPRISE</span>
        <nav aria-label="Espace entreprise">
          {navigation.map(([id, title, Icon]) => (
            <button
              key={id}
              onClick={() => navigate(id)}
              aria-current={view === id ? "page" : undefined}
            >
              <Icon size={18} />
              {title}
            </button>
          ))}
        </nav>
        <div className="bw-sidebar-user">
          <span>{email}</span>
          <small>Votre espace Yolo Business</small>
        </div>
      </aside>
      <div className="bw-main" ref={viewHeading} tabIndex={-1}>
        <div className="bw-workspace-bar">
          <label>
            Point de retrait
            <select
              value={site}
              disabled={locked || !sites.length}
              onChange={(e) => setSite(e.target.value)}
            >
              {!sites.length && <option value="">Aucun point attribué</option>}
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <span className="bw-badge">
            {selected?.active ? "Point actif" : "Activation à compléter"}
          </span>
        </div>
        {lastUpdated && <p className="bw-sync-status">{readFailed ? "Dernière actualisation réussie" : "Actualisé"} à {lastUpdated.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</p>}
        {view === "dashboard" && (
          <>
            <div className="bw-page-heading">
              <div>
                <span className="bw-kicker">BONJOUR ET BIENVENUE</span>
                <h1>Votre activité, en un coup d’œil.</h1>
                <p>Retrouvez vos livraisons et les actions du quotidien.</p>
              </div>
              <button
                className="bw-primary"
                disabled={!selected?.active || locked}
                onClick={create}
              >
                <Plus size={17} />
                Nouvelle livraison
              </button>
            </div>
            <dl className="bw-stats" aria-label="Statistiques des livraisons" aria-busy={loading}>
              {[
                ["Livraisons récentes", missions.length, "Dernières demandes reçues"],
                ["En cours", inProgress, "En attente ou en livraison"],
                [
                  "Livrées",
                  missions.filter((m) => m.status === "delivered").length,
                  "Remises au destinataire",
                ],
                [
                  "Annulées",
                  missions.filter((m) => m.status === "cancelled").length,
                  "Demandes annulées",
                ],
              ].map(([label, value, description]) => (
                <div className="bw-stat" key={label}>
                  <dt>{label}</dt>
                  <dd>{loading ? <span className="bw-number-skeleton" aria-label="Chargement" /> : readFailed && !lastUpdated ? "Indisponible" : value}</dd>
                  <p>{description}</p>
                </div>
              ))}
            </dl>
            <p className="bw-hint">
              Indicateurs sur les 100 dernières livraisons du point sélectionné.
            </p>
            <div className="bw-dashboard-grid">
              <div className="bw-table-card">
                <div className="bw-card-heading">
                  <h2>Dernières livraisons</h2>
                  <button onClick={() => navigate("deliveries")}>
                    Tout voir <ArrowRight size={15} />
                  </button>
                </div>
                {loading ? (
                  <p role="status">Actualisation des livraisons…</p>
                ) : readFailed && !lastUpdated ? <p className="bw-empty">Les livraisons ne sont pas disponibles pour le moment.</p> : missions.length === 0 ? (
                  <div className="bw-empty">
                    <Package size={28} />
                    <h3>Prêt pour votre premier départ ?</h3>
                    <p>Vos livraisons apparaîtront ici dès leur création.</p>
                  </div>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>Référence</th>
                        <th>Destinataire</th>
                        <th>Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {missions.slice(0, 6).map((m) => (
                        <tr key={m.id}>
                          <td>
                            <button onClick={() => navigate("deliveries")}>
                              {m.reference}
                            </button>
                          </td>
                          <td>{m.recipient_name}</td>
                          <td>
                            <span className="bw-badge">
                              {statuses[m.status] || m.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              <div className="bw-card bw-quick-actions">
                <h2>Actions rapides</h2>
                <button disabled={!site} onClick={() => navigate("team")}>
                  <Users size={19} />
                  <span>
                    Inviter un collaborateur
                    <small>Gérer les accès de votre équipe</small>
                  </span>
                  <ArrowRight size={16} />
                </button>
                <button onClick={() => navigate("sites")}>
                  <MapPin size={19} />
                  <span>
                    Mes points de retrait
                    <small>Adresses et disponibilité</small>
                  </span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
        <div hidden={view !== "deliveries"}>{children}</div>
        {view === "team" &&
          (site ? (
            <BusinessTeam
              key={`${userId}:${site}`}
              locationId={site}
              userId={userId}
            />
          ) : (
            <p className="bw-empty">Aucun point de retrait attribué.</p>
          ))}
        {view === "sites" && (
          <section>
            <div className="bw-page-heading">
              <div>
                <span className="bw-kicker">VOS DÉPARTS</span>
                <h1>Points de retrait</h1>
                <p>Les lieux de prise en charge accessibles à votre compte.</p>
              </div>
            </div>
            <div className="bw-sites">
              {sites.map((s) => (
                <article className="bw-card" key={s.id}>
                  <MapPin size={23} />
                  <h2>{s.name}</h2>
                  <p>{s.address}</p>
                  <span className="bw-badge">
                    {s.active ? "Actif" : "À confirmer"}
                  </span>
                  <button
                    className="bw-outline"
                    onClick={() => {
                      setSite(s.id);
                      navigate("settings");
                    }}
                  >
                    Gérer ce point
                  </button>
                </article>
              ))}
            </div>
            {sites.length === 0 && (
              <p className="bw-empty">
                L’équipe Yolo doit attribuer un point de retrait à votre compte.
              </p>
            )}
          </section>
        )}
        {view === "settings" && (
          <section>
            <div className="bw-page-heading">
              <div>
                <span className="bw-kicker">VOTRE ESPACE</span>
                <h1>Paramètres</h1>
                <p>
                  Sécurisez votre compte et confirmez vos points de retrait.
                </p>
              </div>
            </div>
            {settings}
          </section>
        )}
      </div>
    </div>
  );
}
