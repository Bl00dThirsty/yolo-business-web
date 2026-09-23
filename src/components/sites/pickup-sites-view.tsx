import React, { useState } from "react";
import {
  MapPin,
  Plus,
  Clock,
  Phone,
  User,
  CheckCircle2,
  Store,
  Edit2,
  Power,
  Compass,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useStore } from "@/context/store-context";
import { PickupSite } from "@/lib/types";

export function PickupSitesView() {
  const { pickupSites, addPickupSite, updatePickupSite } = useStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [newSite, setNewSite] = useState({
    name: "",
    address: "",
    city: "Douala" as "Douala" | "Yaoundé",
    neighborhood: "",
    lat: 4.0511,
    lng: 9.7085,
    contactName: "",
    contactPhone: "+237 ",
    instructions: "Présentez-vous au comptoir de retrait.",
    openingHours: "Lun - Sam : 08h00 - 20h00",
    active: true,
    isDefault: false,
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSite.name || !newSite.address) return;
    addPickupSite(newSite);
    setIsAddModalOpen(false);
    setNewSite({
      name: "",
      address: "",
      city: "Douala",
      neighborhood: "",
      lat: 4.0511,
      lng: 9.7085,
      contactName: "",
      contactPhone: "+237 ",
      instructions: "Présentez-vous au comptoir de retrait.",
      openingHours: "Lun - Sam : 08h00 - 20h00",
      active: true,
      isDefault: false,
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Points de Retrait & Magasins ({pickupSites.length})
          </h1>
          <p className="text-xs text-muted-foreground">
            Gérez vos boutiques, ateliers et entrepôts où les livreurs Yolo Delivery viennent récupérer les colis.
          </p>
        </div>

        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-yolo-ink text-yolo-lime hover:bg-yolo-ink/90 border border-yolo-lime/40 font-semibold gap-2 self-start sm:self-auto text-xs"
        >
          <Plus className="size-4" />
          Ajouter un point de retrait
        </Button>
      </div>

      {/* Sites Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {pickupSites.map((site) => (
          <Card key={site.id} className="p-5 space-y-4 shadow-xs border">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Store className="size-4 text-yolo-ink dark:text-yolo-lime" />
                  <span className="font-bold text-sm text-foreground">{site.name}</span>
                  {site.isDefault && (
                    <Badge variant="yolo" className="text-[10px] px-1.5 py-0.5 font-semibold">
                      Principal
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="size-3.5 text-muted-foreground shrink-0" />
                  <span>{site.address} ({site.neighborhood}, {site.city})</span>
                </div>
              </div>

              <Badge variant={site.active ? "success" : "outline"} className="text-xs">
                {site.active ? "Actif" : "Désactivé"}
              </Badge>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-3 text-xs p-3 rounded-lg bg-muted/30 border">
              <div>
                <span className="text-[10px] text-muted-foreground block">Contact sur place :</span>
                <span className="font-bold text-foreground">{site.contactName}</span>
                <div className="text-[11px] font-mono text-muted-foreground">{site.contactPhone}</div>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground block">Horaires d&apos;ouverture :</span>
                <span className="font-semibold text-foreground flex items-center gap-1 mt-0.5">
                  <Clock className="size-3 text-muted-foreground" />
                  {site.openingHours}
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded bg-muted/20 border text-[11px] text-muted-foreground">
              <strong className="text-foreground">Consignes livreur :</strong> {site.instructions}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t text-xs">
              <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                <Compass className="size-3" />
                Lat: {site.lat.toFixed(4)}, Lng: {site.lng.toFixed(4)}
              </span>

              <Button
                size="sm"
                variant="outline"
                onClick={() => updatePickupSite(site.id, { active: !site.active })}
                className="h-7 px-2.5 text-[11px] gap-1"
              >
                <Power className="size-3" />
                {site.active ? "Désactiver" : "Activer"}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal Ajout Point de Retrait */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-md p-6 space-y-4">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Nouveau Point de Retrait</DialogTitle>
            <DialogDescription className="text-xs">
              Enregistrez un nouveau magasin ou entrepôt pour le dispatch Yolo.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
            <div>
              <label className="font-semibold block mb-1">Nom du point de retrait *</label>
              <Input
                value={newSite.name}
                onChange={(e) => setNewSite({ ...newSite, name: e.target.value })}
                placeholder="Ex: Comptoir Makepe, Dépôt Logbaba"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1">Ville</label>
                <select
                  value={newSite.city}
                  onChange={(e) => setNewSite({ ...newSite, city: e.target.value as "Douala" | "Yaoundé" })}
                  className="w-full text-xs rounded-md border bg-background py-2 px-3 outline-hidden focus:ring-1 focus:ring-ring"
                >
                  <option value="Douala">Douala</option>
                  <option value="Yaoundé">Yaoundé</option>
                </select>
              </div>
              <div>
                <label className="font-semibold block mb-1">Quartier *</label>
                <Input
                  value={newSite.neighborhood}
                  onChange={(e) => setNewSite({ ...newSite, neighborhood: e.target.value })}
                  placeholder="Ex: Makepe, Bali"
                  required
                />
              </div>
            </div>

            <div>
              <label className="font-semibold block mb-1">Adresse précise & Repère *</label>
              <Input
                value={newSite.address}
                onChange={(e) => setNewSite({ ...newSite, address: e.target.value })}
                placeholder="Ex: Face Collège Chevreul"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1">Responsable sur place</label>
                <Input
                  value={newSite.contactName}
                  onChange={(e) => setNewSite({ ...newSite, contactName: e.target.value })}
                  placeholder="Ex: Jacques Bello"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Téléphone contact</label>
                <Input
                  value={newSite.contactPhone}
                  onChange={(e) => setNewSite({ ...newSite, contactPhone: e.target.value })}
                  placeholder="+237 6XX XX XX XX"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold block mb-1">Horaires d&apos;ouverture</label>
              <Input
                value={newSite.openingHours}
                onChange={(e) => setNewSite({ ...newSite, openingHours: e.target.value })}
                placeholder="Ex: Lun - Sam : 08h00 - 21h00"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">Instructions pour le livreur</label>
              <Input
                value={newSite.instructions}
                onChange={(e) => setNewSite({ ...newSite, instructions: e.target.value })}
                placeholder="Ex: Sonner à la porte arrière, demander le chef d'équipe"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" className="bg-yolo-ink text-yolo-lime font-bold">
                Enregistrer le site
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
