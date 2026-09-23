import React, { useState } from "react";
import {
  Store,
  Wallet,
  ShieldCheck,
  Building2,
  Smartphone,
  Check,
  AlertTriangle,
  Lock,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useStore } from "@/context/store-context";

export function SettingsView() {
  const { merchant } = useStore();
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          Paramètres du Commerce & Facturation (C02 / C05)
        </h1>
        <p className="text-xs text-muted-foreground">
          Gérez l&apos;identité légale de votre entreprise, vos contrats de transport et vos coordonnées de reversement des fonds collectés (COD).
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Identité Commerciale */}
        <Card className="p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 border-b pb-3">
            <Store className="size-4 text-yolo-ink dark:text-yolo-lime" />
            <CardTitle className="text-sm font-bold">Identité Commerciale</CardTitle>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold block mb-1">Nom commercial affiché</label>
              <Input defaultValue={merchant.name} />
            </div>
            <div>
              <label className="font-semibold block mb-1">Raison sociale légale</label>
              <Input defaultValue={merchant.legalName} />
            </div>
            <div>
              <label className="font-semibold block mb-1">Numéro d&apos;Identifiant Fiscal (NIF)</label>
              <Input defaultValue={merchant.taxId} />
            </div>
            <div>
              <label className="font-semibold block mb-1">Catégorie d&apos;activité</label>
              <Input defaultValue={merchant.categoryLabel} disabled />
            </div>
            <div>
              <label className="font-semibold block mb-1">Email professionnel</label>
              <Input defaultValue={merchant.email} />
            </div>
            <div>
              <label className="font-semibold block mb-1">Téléphone de contact commercial</label>
              <Input defaultValue={merchant.phone} />
            </div>
          </div>
        </Card>

        {/* Coordonnées de Reversement (C05) */}
        <Card className="p-6 space-y-4 shadow-xs border-yolo-ink/20">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2">
              <Wallet className="size-4 text-emerald-600" />
              <CardTitle className="text-sm font-bold">Coordonnées de Reversement des Espèces & MoMo (COD)</CardTitle>
            </div>
            <Badge variant="success" className="text-[10px] gap-1">
              <ShieldCheck className="size-3" /> Coordonnées Vérifiées
            </Badge>
          </div>

          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-900 dark:text-amber-300 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <Lock className="size-3.5" />
              Sécurité renforcée (Section 12 du Userflow)
            </div>
            <p className="text-[11px]">
              Tout changement de compte de reversement requiert un code de vérification SMS et une validation de sécurité par l&apos;exploitation Yolo afin de protéger vos fonds marchands.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Mobile Money Account */}
            <div className="p-4 rounded-xl border bg-muted/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <Smartphone className="size-4 text-yolo-ink dark:text-yolo-lime" />
                  Reversement Principal Mobile Money
                </span>
                <Badge variant="yolo" className="text-[10px]">Actif J+0</Badge>
              </div>
              <div className="text-[11px] text-muted-foreground">Opérateur : MTN Cameroon</div>
              <Input defaultValue={merchant.mobileMoneyAccount.number} disabled />
              <p className="text-[10px] text-muted-foreground">
                Délai de reversement automatique : Quotidien à 18h00.
              </p>
            </div>

            {/* Bank Account */}
            <div className="p-4 rounded-xl border bg-muted/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <Building2 className="size-4" />
                  Compte Bancaire (Virements volumineux)
                </span>
                <Badge variant="outline" className="text-[10px]">Certifié</Badge>
              </div>
              <div className="text-[11px] text-muted-foreground">Banque : {merchant.bankAccount?.bankName}</div>
              <Input defaultValue={merchant.bankAccount?.ibanOrRib} disabled />
              <p className="text-[10px] text-muted-foreground">
                Délai de compensation SYSTAC : J+1 ouvré.
              </p>
            </div>
          </div>
        </Card>

        {/* Submit */}
        <div className="flex items-center justify-between pt-2">
          {saved ? (
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
              <Check className="size-4" /> Modifications enregistrées
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">
              Les modifications de profil prennent effet immédiatement sur vos bordereaux.
            </span>
          )}

          <Button type="submit" className="bg-yolo-ink text-yolo-lime font-bold text-xs">
            Enregistrer les paramètres
          </Button>
        </div>
      </form>
    </div>
  );
}
