import { useRef, useState, type ReactNode } from "react";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Package, ArrowUpDown } from "lucide-react";
export interface DeliverySummary {
  id: string;
  reference: string;
  status: string;
  recipient_name: string;
  recipient_phone?: string;
  dropoff_address: string;
  pickup_address?: string;
  pickup_name?: string;
  instructions?: string;
  courier_name?: string;
  vehicle?: string;
  plate?: string;
  package_count?: number;
  created_at?: string;
  updated_at?: string;
  ready_at?: string;
  ready?: boolean;
  completed_at?: string;
}
const labels: Record<string, string> = {
  searching: "Recherche du livreur",
  assigned: "Livreur en route",
  at_pickup: "Au retrait",
  picked_up: "En livraison",
  at_dropoff: "Chez le destinataire",
  delivered: "Livrée",
  cancelled: "Annulée",
};
const date = (value?: string) =>
  value && Number.isFinite(Date.parse(value))
    ? new Date(value).toLocaleString("fr-FR", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "Non renseignée";
export function DeliveryBrowser<T extends DeliverySummary>({
  deliveries,
  renderActions,
  pendingId,
  selectedId,
  onSelect,
}: {
  deliveries: T[];
  renderActions: (delivery: T) => ReactNode;
  pendingId?: string;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  const [query, setQuery] = useState(""),
    [status, setStatus] = useState("all"),
    [ascending, setAscending] = useState(false);
  const origin = useRef<HTMLElement | null>(null);
  const selected = deliveries.find((d) => d.id === selectedId);
  const normalized = query.trim().toLocaleLowerCase("fr");
  const filtered = deliveries
    .filter(
      (d) =>
        (status === "all" || d.status === status) &&
        (d.reference + " " + d.recipient_name + " " + d.dropoff_address)
          .toLocaleLowerCase("fr")
          .includes(normalized),
    )
    .sort(
      (a, b) =>
        ((Date.parse(a.created_at || "") || 0) -
          (Date.parse(b.created_at || "") || 0)) *
        (ascending ? 1 : -1),
    );
  function open(d: T) {
    origin.current = document.activeElement as HTMLElement;
    onSelect(d.id);
  }
  const badge = (d: T) => (
    <Badge
      variant={
        pendingId === d.id
          ? "warning"
          : d.status === "delivered"
            ? "success"
            : d.status === "cancelled"
              ? "secondary"
              : "info"
      }
    >
      {pendingId === d.id ? "Annulation prévue" : labels[d.status] || d.status}
    </Badge>
  );
  const menu = (d: T) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={"Options de " + d.reference}
        >
          <MoreVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={() => open(d)}>
            Voir les détails
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
  return (
    <>
      <div className="bw-delivery-toolbar">
        <Input
          aria-label="Rechercher une livraison"
          placeholder="Référence, destinataire, adresse…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <label>
          Statut
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">Tous les statuts</option>
            {Object.entries(labels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <span>
          {filtered.length} livraison{filtered.length > 1 ? "s" : ""}
        </span>
      </div>
      <div className="bw-delivery-desktop bw-table-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Livraison</TableHead>
              <TableHead>Destinataire</TableHead>
              <TableHead aria-sort={ascending ? "ascending" : "descending"}>
                <Button variant="ghost" onClick={() => setAscending((v) => !v)}>
                  Créée le
                  <ArrowUpDown />
                </Button>
              </TableHead>
              <TableHead>Dernière mise à jour</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((d) => (
              <TableRow key={d.id}>
                <TableCell>
                  <button className="bw-delivery-title" onClick={() => open(d)}>
                    <Package size={18} />
                    <span>
                      <strong>{d.reference}</strong>
                      <small>{d.dropoff_address}</small>
                    </span>
                  </button>
                </TableCell>
                <TableCell>{d.recipient_name}</TableCell>
                <TableCell>{date(d.created_at)}</TableCell>
                <TableCell>{date(d.updated_at)}</TableCell>
                <TableCell>{badge(d)}</TableCell>
                <TableCell>{menu(d)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="bw-delivery-mobile">
        {filtered.map((d) => (
          <article key={d.id} className="bw-delivery-mobile-card">
            <header>
              <span>{d.reference}</span>
              {menu(d)}
            </header>
            <button className="bw-delivery-title" onClick={() => open(d)}>
              <Package size={20} />
              <span>
                <strong>{d.recipient_name}</strong>
                <small>{d.dropoff_address}</small>
              </span>
            </button>
            <div>{badge(d)}</div>
            <dl>
              <dt>Créée le</dt>
              <dd>{date(d.created_at)}</dd>
              <dt>Mise à jour</dt>
              <dd>{date(d.updated_at)}</dd>
            </dl>
            <Button variant="outline" onClick={() => open(d)}>
              Voir les détails
            </Button>
          </article>
        ))}
      </div>
      {!filtered.length && (
        <p className="bw-empty">
          Aucune livraison ne correspond à votre recherche.
        </p>
      )}
      <Dialog
        open={!!selectedId}
        onOpenChange={(open) => {
          if (!open) onSelect(null);
        }}
      >
        <DialogContent
          className="bw-delivery-detail"
          onCloseAutoFocus={(e) => {
            if (origin.current?.isConnected) {
              e.preventDefault();
              origin.current.focus();
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>Livraison {selected?.reference || ""}</DialogTitle>
            <DialogDescription>
              Coordonnées, retrait et suivi de votre colis.
            </DialogDescription>
          </DialogHeader>
          {selected ? (
            <>
              {badge(selected)}
              <dl className="bw-delivery-facts">
                {[
                  ["Destinataire", selected.recipient_name],
                  ["Téléphone", selected.recipient_phone || "Non renseigné"],
                  ["Adresse de livraison", selected.dropoff_address],
                  [
                    "Point de retrait",
                    [selected.pickup_name, selected.pickup_address]
                      .filter(Boolean)
                      .join(" · ") || "Non renseigné",
                  ],
                  ["Colis", String(selected.package_count ?? 1)],
                  [
                    "Préparation",
                    selected.ready ? "Prêt pour le retrait" : "En préparation",
                  ],
                  ["Livreur", selected.courier_name || "Pas encore attribué"],
                  [
                    "Véhicule",
                    [selected.vehicle, selected.plate]
                      .filter(Boolean)
                      .join(" · ") || "Non renseigné",
                  ],
                  ["Créée le", date(selected.created_at)],
                  ["Mise à jour", date(selected.updated_at)],
                  ["Consignes", selected.instructions || "Aucune consigne"],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
              <div className="bw-detail-actions">{renderActions(selected)}</div>
            </>
          ) : (
            <p>
              Cette livraison n’est plus dans la liste chargée. Actualisez les
              livraisons.
            </p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
