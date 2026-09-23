import React, { useState } from "react";
import {
  Users,
  UserPlus,
  ShieldCheck,
  Mail,
  Phone,
  Check,
  MoreHorizontal,
  Key,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/context/auth-context";
import { useStore } from "@/context/store-context";
import { UserRole } from "@/lib/types";

export function TeamView() {
  const { allUsers, currentUser } = useAuth();
  const { pickupSites } = useStore();

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Équipe & Droits d&apos;Accès ({allUsers.length})
          </h1>
          <p className="text-xs text-muted-foreground">
            Gestion des collaborateurs, des permissions par site et des profils métier selon le cahier des charges Yolo Business.
          </p>
        </div>

        <Button
          onClick={() => alert("Invitation envoyée par email avec token temporaire (A05)")}
          className="bg-yolo-ink text-yolo-lime hover:bg-yolo-ink/90 border border-yolo-lime/40 font-semibold gap-2 self-start sm:self-auto text-xs"
        >
          <UserPlus className="size-4" />
          Inviter un collaborateur
        </Button>
      </div>

      {/* Permissions Matrix Recap */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <Card className="p-4 space-y-2 border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-foreground">Propriétaire</span>
            <Badge variant="yolo">Admin</Badge>
          </div>
          <p className="text-muted-foreground text-[11px]">
            Création du commerce, gestion des sites et de l&apos;équipe, coordonnées bancaires et finances globales.
          </p>
        </Card>

        <Card className="p-4 space-y-2 border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-foreground">Gestionnaire</span>
            <Badge variant="secondary">Opérations</Badge>
          </div>
          <p className="text-muted-foreground text-[11px]">
            Pilotage quotidien des livraisons, supervision des retraits et suivi des incidents sur ses sites autorisés.
          </p>
        </Card>

        <Card className="p-4 space-y-2 border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-foreground">Préparateur</span>
            <Badge variant="outline">Comptoir</Badge>
          </div>
          <p className="text-muted-foreground text-[11px]">
            Création des courses, déclaration des colis prêts et remise physique au coursier (L04). Aucun accès finances.
          </p>
        </Card>

        <Card className="p-4 space-y-2 border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-foreground">Comptable</span>
            <Badge variant="outline">Trésorerie</Badge>
          </div>
          <p className="text-muted-foreground text-[11px]">
            Consultation des encaissements COD, factures de transport, reversements et exports comptables.
          </p>
        </Card>
      </div>

      {/* Team Table */}
      <Card className="overflow-hidden border shadow-xs">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Collaborateur</TableHead>
              <TableHead>Rôle Métier</TableHead>
              <TableHead>Coordonnées</TableHead>
              <TableHead>Accès aux Sites</TableHead>
              <TableHead className="text-right">Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8 rounded-lg">
                      <AvatarFallback className={`rounded-lg font-bold text-xs ${user.avatarColor}`}>
                        {user.avatarInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-bold text-xs text-foreground flex items-center gap-1.5">
                        <span>{user.name}</span>
                        {user.id === currentUser.id && (
                          <Badge variant="secondary" className="text-[9.5px] px-1.5 py-0.5">
                            Vous
                          </Badge>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground font-mono">{user.id}</span>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <Badge
                    variant={user.role === "owner" ? "yolo" : user.role === "accountant" ? "info" : "secondary"}
                    className="font-medium text-xs"
                  >
                    {user.roleLabel}
                  </Badge>
                </TableCell>

                <TableCell>
                  <div className="text-xs text-muted-foreground space-y-0.5">
                    <div className="flex items-center gap-1">
                      <Mail className="size-3" />
                      <span>{user.email}</span>
                    </div>
                    <div className="flex items-center gap-1 font-mono text-[11px]">
                      <Phone className="size-3" />
                      <span>{user.phone}</span>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="text-xs text-foreground">
                    {user.accessibleSiteIds.length === 0 ? (
                      <span className="text-muted-foreground font-medium">Tous les points de retrait</span>
                    ) : (
                      <span className="font-medium">
                        {user.accessibleSiteIds
                          .map((id) => pickupSites.find((s) => s.id === id)?.name || id)
                          .join(", ")}
                      </span>
                    )}
                  </div>
                </TableCell>

                <TableCell className="text-right">
                  <Badge variant="success">Actif</Badge>
                </TableCell>

                <TableCell className="text-right">
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => alert(`Modifier les droits de ${user.name}`)}
                  >
                    <MoreHorizontal className="size-4 text-muted-foreground" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
