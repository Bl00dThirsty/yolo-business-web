import React, { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  MapPin,
  User,
  Package,
  Coins,
  Receipt,
  Clock,
  ShieldCheck,
} from "lucide-react";
import confetti from "canvas-confetti";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useDeliveries } from "@/context/delivery-context";
import { useStore } from "@/context/store-context";
import { formatFCFA } from "@/lib/utils";

export function DeliveryWizard() {
  const { createDelivery, setActiveView, viewDeliveryDetail } = useDeliveries();
  const { pickupSites } = useStore();

  const [step, setStep] = useState<number>(1);
  const [createdDeliveryId, setCreatedDeliveryId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Pickup
    pickupSiteId: pickupSites[0]?.id || "site_akwa",
    isReadyNow: true,
    scheduledTime: "",
    pickupInstructions: "Entrée comptoir Yolo, demander Samuel.",

    // Step 2: Recipient
    recipientName: "",
    recipientPhone: "+237 ",
    recipientCity: "Douala" as "Douala" | "Yaoundé",
    recipientNeighborhood: "",
    recipientAddress: "",
    recipientInstructions: "",

    // Step 3: Cargo
    category: "food" as "food" | "general_goods" | "electronics" | "fragile" | "documents",
    itemName: "Menu Traiteur Gourmet",
    packageCount: 1,
    estimatedWeightKg: 2.0,
    declaredValue: 15000,
    isFragile: false,

    // Step 4: Payment
    paymentMode: "cash_on_delivery" as "prepaid" | "cash_on_delivery",
    goodsAmount: 15000,
    transportPayer: "merchant" as "merchant" | "recipient",
  });

  // Calculate Instant Server Quote (Simulation)
  const calculateQuote = () => {
    let base = 1200;
    if (formData.estimatedWeightKg > 3) base += (formData.estimatedWeightKg - 3) * 300;
    if (formData.isFragile) base += 300;
    if (formData.packageCount > 2) base += (formData.packageCount - 2) * 200;
    return base;
  };

  const transportFee = calculateQuote();
  const totalToCollect =
    formData.paymentMode === "cash_on_delivery"
      ? formData.goodsAmount + (formData.transportPayer === "recipient" ? transportFee : 0)
      : formData.transportPayer === "recipient"
      ? transportFee
      : 0;

  const selectedSite = pickupSites.find((s) => s.id === formData.pickupSiteId);

  const handleConfirmOrder = () => {
    const created = createDelivery({
      pickupSiteId: formData.pickupSiteId,
      pickupSiteName: selectedSite?.name || "Boutique Centrale",
      pickupAddress: selectedSite?.address || "Douala",
      pickupNeighborhood: selectedSite?.neighborhood || "Akwa",
      recipientName: formData.recipientName.trim() || "Client Particulier",
      recipientPhone: formData.recipientPhone.trim() || "+237 690 00 00 00",
      recipientCity: formData.recipientCity,
      recipientNeighborhood: formData.recipientNeighborhood || "Bonanjo",
      recipientAddress: formData.recipientAddress || "Rue de la Joie",
      recipientInstructions: formData.recipientInstructions,
      items: [
        {
          id: `it_${Date.now()}`,
          name: formData.itemName,
          quantity: formData.packageCount,
          category: formData.category,
          weightKg: formData.estimatedWeightKg,
        },
      ],
      packageCount: formData.packageCount,
      estimatedWeightKg: formData.estimatedWeightKg,
      declaredValue: formData.declaredValue,
      isFragile: formData.isFragile,
      paymentMode: formData.paymentMode,
      goodsAmount: formData.goodsAmount,
      transportFee,
      transportPayer: formData.transportPayer,
      totalToCollect,
    });

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#CAF76F", "#121317", "#BC5F28"],
      });
    } catch {
      // ignore
    }

    setCreatedDeliveryId(created.id);
    setStep(6); // Success Step
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Header & Back button */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setActiveView("deliveries")}
          className="gap-2 text-xs"
        >
          <ArrowLeft className="size-4" />
          Retour aux livraisons
        </Button>
        <span className="text-xs text-muted-foreground font-mono">Assistant L02 • Yolo Business</span>
      </div>

      {/* Stepper Progress Header */}
      {step <= 5 && (
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2 text-xs">
          {[
            { id: 1, label: "Retrait", shortLabel: "1", icon: MapPin },
            { id: 2, label: "Client", shortLabel: "2", icon: User },
            { id: 3, label: "Colis", shortLabel: "3", icon: Package },
            { id: 4, label: "Paiement", shortLabel: "4", icon: Coins },
            { id: 5, label: "Devis", shortLabel: "5", icon: Receipt },
          ].map((st) => {
            const isCurrent = step === st.id;
            const isCompleted = step > st.id;
            return (
              <div
                key={st.id}
                className={`p-1.5 sm:p-2 rounded-lg border text-center transition-all ${
                  isCurrent
                    ? "border-yolo-ink bg-yolo-ink text-yolo-lime font-bold shadow-xs"
                    : isCompleted
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold"
                    : "border-border bg-card text-muted-foreground opacity-60"
                }`}
              >
                <div className="flex items-center justify-center gap-1 sm:gap-1.5 truncate">
                  {isCompleted ? <Check className="size-3 text-emerald-600 shrink-0" /> : <st.icon className="size-3 shrink-0" />}
                  <span className="hidden md:inline truncate">{st.id}. {st.label}</span>
                  <span className="hidden sm:inline md:hidden truncate">{st.label}</span>
                  <span className="sm:hidden text-[11px] font-bold">{st.shortLabel}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* STEP 1: RETRAIT */}
      {step === 1 && (
        <Card className="p-6 space-y-5">
          <div>
            <CardTitle className="text-base">Étape 1 : Choix du Point de Retrait & Disponibilité</CardTitle>
            <CardDescription className="text-xs">
              Indiquez d&apos;où le coursier Yolo Delivery doit récupérer les marchandises.
            </CardDescription>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold block mb-1.5 text-foreground">
                Sélectionner le magasin / atelier de départ
              </label>
              <select
                value={formData.pickupSiteId}
                onChange={(e) => setFormData({ ...formData, pickupSiteId: e.target.value })}
                className="w-full text-xs rounded-md border bg-background py-2 px-3 outline-hidden focus:ring-1 focus:ring-ring"
              >
                {pickupSites.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.name} — {site.address} ({site.city})
                  </option>
                ))}
              </select>
            </div>

            {selectedSite && (
              <div className="p-3 rounded-lg bg-muted/40 border text-xs space-y-1">
                <div className="font-semibold text-foreground">{selectedSite.name}</div>
                <div className="text-muted-foreground">{selectedSite.address}</div>
                <div className="text-[11px] text-muted-foreground">
                  Contact au comptoir : <strong>{selectedSite.contactName}</strong> ({selectedSite.contactPhone})
                </div>
              </div>
            )}

            <div className="space-y-2 pt-2 border-t">
              <label className="text-xs font-semibold block text-foreground">Disponibilité des colis</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isReadyNow: true })}
                  className={`p-3 rounded-lg border text-left cursor-pointer transition-colors ${
                    formData.isReadyNow
                      ? "border-yolo-ink bg-yolo-lime/20 text-yolo-ink font-semibold"
                      : "border-border bg-card text-muted-foreground hover:bg-muted/30"
                  }`}
                >
                  <div className="font-bold text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="size-3.5 text-emerald-600" />
                    Colis prêts immédiatement
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Le dispatch PostGIS commence la recherche dès confirmation.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isReadyNow: false })}
                  className={`p-3 rounded-lg border text-left cursor-pointer transition-colors ${
                    !formData.isReadyNow
                      ? "border-yolo-ink bg-yolo-lime/20 text-yolo-ink font-semibold"
                      : "border-border bg-card text-muted-foreground hover:bg-muted/30"
                  }`}
                >
                  <div className="font-bold text-xs flex items-center gap-1.5">
                    <Clock className="size-3.5 text-amber-600" />
                    Course programmée
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Départ différé (ex: commande en cours de cuisson/préparation).
                  </p>
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold block mb-1 text-foreground">
                Consignes pour le livreur au retrait
              </label>
              <Input
                value={formData.pickupInstructions}
                onChange={(e) => setFormData({ ...formData, pickupInstructions: e.target.value })}
                placeholder="Ex: Entrée latérale coursier, sonner à la cloche Yolo"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button onClick={() => setStep(2)} className="gap-2 text-xs font-semibold">
              Suivant : Destinataire
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 2: DESTINATAIRE */}
      {step === 2 && (
        <Card className="p-6 space-y-5">
          <div>
            <CardTitle className="text-base">Étape 2 : Coordonnées du Destinataire</CardTitle>
            <CardDescription className="text-xs">
              Contact et repères nécessaires pour assurer la remise du premier coup (Douala ou Yaoundé).
            </CardDescription>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold block mb-1 text-foreground">Nom complet ou Entreprise *</label>
                <Input
                  value={formData.recipientName}
                  onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                  placeholder="Ex: Mme Carole Tientcheu"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1 text-foreground">Téléphone destinataire (MTN/Orange) *</label>
                <Input
                  value={formData.recipientPhone}
                  onChange={(e) => setFormData({ ...formData, recipientPhone: e.target.value })}
                  placeholder="+237 6XX XX XX XX"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold block mb-1 text-foreground">Ville desservie</label>
                <select
                  value={formData.recipientCity}
                  onChange={(e) => setFormData({ ...formData, recipientCity: e.target.value as "Douala" | "Yaoundé" })}
                  className="w-full text-xs rounded-md border bg-background py-2 px-3 outline-hidden focus:ring-1 focus:ring-ring"
                >
                  <option value="Douala">Douala (Couverture complète Wouri)</option>
                  <option value="Yaoundé">Yaoundé (Mfoundi)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1 text-foreground">Quartier de livraison *</label>
                <Input
                  value={formData.recipientNeighborhood}
                  onChange={(e) => setFormData({ ...formData, recipientNeighborhood: e.target.value })}
                  placeholder="Ex: Bonanjo, Akwa, Bonapriso, Bastos..."
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold block mb-1 text-foreground">Adresse & Repère précis *</label>
              <Input
                value={formData.recipientAddress}
                onChange={(e) => setFormData({ ...formData, recipientAddress: e.target.value })}
                placeholder="Ex: Immeuble Krystal 3ème étage, face Direction Générale MTN"
              />
            </div>

            <div>
              <label className="text-xs font-semibold block mb-1 text-foreground">Consignes de sonnette ou portail (optionnel)</label>
              <Input
                value={formData.recipientInstructions}
                onChange={(e) => setFormData({ ...formData, recipientInstructions: e.target.value })}
                placeholder="Ex: Demander Carole à l'accueil, portail marron avec vigile"
              />
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={() => setStep(1)} className="gap-2 text-xs">
              <ArrowLeft className="size-4" />
              Précédent
            </Button>
            <Button onClick={() => setStep(3)} className="gap-2 text-xs font-semibold">
              Suivant : Marchandise & Colis
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 3: MARCHANDISE */}
      {step === 3 && (
        <Card className="p-6 space-y-5">
          <div>
            <CardTitle className="text-base">Étape 3 : Marchandise & Conditionnement</CardTitle>
            <CardDescription className="text-xs">
              Ces paramètres déterminent le type de véhicule affecté (Moto, Scooter ou Van) et le tarif.
            </CardDescription>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold block mb-1 text-foreground">Catégorie de marchandise</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full text-xs rounded-md border bg-background py-2 px-3 outline-hidden focus:ring-1 focus:ring-ring"
                >
                  <option value="food">Restauration & Traiteur (Sac isotherme requis)</option>
                  <option value="fragile">Pâtisserie & Pièces Fragiles</option>
                  <option value="general_goods">Épicerie & Colis Standard</option>
                  <option value="electronics">Électronique & High-Tech</option>
                  <option value="documents">Plis & Documents Express</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1 text-foreground">Description du contenu</label>
                <Input
                  value={formData.itemName}
                  onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                  placeholder="Ex: Coffret Pâtisseries & Jus Naturels"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold block mb-1 text-foreground">Nombre de colis</label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.packageCount}
                  onChange={(e) => setFormData({ ...formData, packageCount: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1 text-foreground">Poids estimé (kg)</label>
                <Input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="50"
                  value={formData.estimatedWeightKg}
                  onChange={(e) => setFormData({ ...formData, estimatedWeightKg: parseFloat(e.target.value) || 1 })}
                />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1 text-foreground">Valeur déclarée (FCFA)</label>
                <Input
                  type="number"
                  step="1000"
                  value={formData.declaredValue}
                  onChange={(e) => setFormData({ ...formData, declaredValue: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="p-3 bg-muted/30 rounded-lg border flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-foreground block">Marchandise très fragile</span>
                <span className="text-[11px] text-muted-foreground">
                  Gâteau monté, verrines ou bouteilles de verre nécessitant un transport sans secousses.
                </span>
              </div>
              <input
                type="checkbox"
                checked={formData.isFragile}
                onChange={(e) => setFormData({ ...formData, isFragile: e.target.checked })}
                className="size-4 accent-yolo-lime cursor-pointer"
              />
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={() => setStep(2)} className="gap-2 text-xs">
              <ArrowLeft className="size-4" />
              Précédent
            </Button>
            <Button onClick={() => setStep(4)} className="gap-2 text-xs font-semibold">
              Suivant : Encaissement & Trésorerie
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 4: ENCAISSEMENT (COD) */}
      {step === 4 && (
        <Card className="p-6 space-y-5">
          <div>
            <CardTitle className="text-base">Étape 4 : Mode d&apos;Encaissement & Payeur du Transport</CardTitle>
            <CardDescription className="text-xs">
              Conformité Userflow Section 12 : Règle stricte de séparation entre prix de marchandise et frais de course.
            </CardDescription>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold block mb-1 text-foreground">Statut de la marchandise</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, paymentMode: "cash_on_delivery" })}
                  className={`p-3 rounded-lg border text-left cursor-pointer transition-colors ${
                    formData.paymentMode === "cash_on_delivery"
                      ? "border-yolo-ink bg-yolo-lime/20 text-yolo-ink font-semibold"
                      : "border-border bg-card text-muted-foreground hover:bg-muted/30"
                  }`}
                >
                  <div className="font-bold text-xs flex items-center gap-1.5">
                    <Coins className="size-3.5 text-amber-700" />
                    Paiement à la livraison (COD)
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Le livreur Yolo perçoit le montant (Espèces ou Mobile Money) avant remise.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, paymentMode: "prepaid" })}
                  className={`p-3 rounded-lg border text-left cursor-pointer transition-colors ${
                    formData.paymentMode === "prepaid"
                      ? "border-yolo-ink bg-yolo-lime/20 text-yolo-ink font-semibold"
                      : "border-border bg-card text-muted-foreground hover:bg-muted/30"
                  }`}
                >
                  <div className="font-bold text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="size-3.5 text-emerald-600" />
                    Marchandise déjà payée
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Client ayant réglé d&apos;avance (aucun encaissement marchandise).
                  </p>
                </button>
              </div>
            </div>

            {formData.paymentMode === "cash_on_delivery" && (
              <div>
                <label className="text-xs font-semibold block mb-1 text-foreground">
                  Montant de la marchandise à collecter (FCFA) *
                </label>
                <Input
                  type="number"
                  step="500"
                  value={formData.goodsAmount}
                  onChange={(e) => setFormData({ ...formData, goodsAmount: parseInt(e.target.value) || 0 })}
                />
              </div>
            )}

            <div className="pt-2 border-t">
              <label className="text-xs font-semibold block mb-1 text-foreground">Qui prend en charge les frais de transport Yolo ?</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, transportPayer: "merchant" })}
                  className={`p-3 rounded-lg border text-left cursor-pointer transition-colors ${
                    formData.transportPayer === "merchant"
                      ? "border-yolo-ink bg-muted/60 text-foreground font-semibold"
                      : "border-border bg-card text-muted-foreground"
                  }`}
                >
                  <div className="font-bold text-xs">Le Commerce (Moi)</div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Frais facturés sur le compte marchand mensuel.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, transportPayer: "recipient" })}
                  className={`p-3 rounded-lg border text-left cursor-pointer transition-colors ${
                    formData.transportPayer === "recipient"
                      ? "border-yolo-ink bg-muted/60 text-foreground font-semibold"
                      : "border-border bg-card text-muted-foreground"
                  }`}
                >
                  <div className="font-bold text-xs">Le Destinataire (Client)</div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Le montant du transport sera ajouté au total à percevoir chez le client.
                  </p>
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={() => setStep(3)} className="gap-2 text-xs">
              <ArrowLeft className="size-4" />
              Précédent
            </Button>
            <Button onClick={() => setStep(5)} className="gap-2 text-xs font-semibold">
              Suivant : Calcul du Devis & Résumé
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 5: DEVIS SERVEUR & CONFIRMATION */}
      {step === 5 && (
        <Card className="p-6 space-y-5">
          <div>
            <CardTitle className="text-base">Étape 5 : Devis Serveur Yolo & Confirmation</CardTitle>
            <CardDescription className="text-xs">
              Devis calculé en temps réel selon la distance, le volume et les options. Valable 15 minutes.
            </CardDescription>
          </div>

          {/* Devis Card Breakdown */}
          <div className="p-4 rounded-xl border bg-muted/20 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b">
              <span className="font-bold text-sm text-foreground">Récapitulatif Financier</span>
              <Badge variant="yolo" className="text-xs">Devis Certifié Serveur</Badge>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Frais de course Yolo Delivery :</span>
                <span className="font-mono font-bold text-foreground">{formatFCFA(transportFee)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pris en charge par :</span>
                <span className="font-semibold text-foreground">
                  {formData.transportPayer === "merchant" ? "Le Commerce (Facturation bimensuelle)" : "Le Destinataire (À l'arrivée)"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Montant marchandise à percevoir (COD) :</span>
                <span className="font-mono font-bold text-foreground">
                  {formData.paymentMode === "cash_on_delivery" ? formatFCFA(formData.goodsAmount) : "0 FCFA (Déjà payé)"}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t text-sm font-bold">
                <span className="text-foreground">Total à encaisser auprès du client :</span>
                <span className="font-mono text-emerald-600 font-extrabold">{formatFCFA(totalToCollect)}</span>
              </div>
            </div>
          </div>

          {/* Details Summary */}
          <div className="grid grid-cols-2 gap-3 text-xs p-3 rounded-lg border">
            <div>
              <span className="text-muted-foreground block text-[11px]">Point de Retrait :</span>
              <strong className="text-foreground">{selectedSite?.name}</strong>
              <div className="text-muted-foreground">{selectedSite?.address}</div>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Destinataire :</span>
              <strong className="text-foreground">{formData.recipientName || "Non renseigné"}</strong>
              <div className="text-muted-foreground">{formData.recipientNeighborhood}, {formData.recipientCity}</div>
              <div className="text-[11px] font-mono text-muted-foreground">{formData.recipientPhone}</div>
            </div>
          </div>

          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs text-emerald-800 dark:text-emerald-300 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <ShieldCheck className="size-4" />
              Garantie anti-doublon & Idempotence
            </div>
            <p className="text-[11px]">
              La confirmation verrouille le tarif accepté. Un code de sécurité de retrait et un code destinataire secret seront générés immédiatement.
            </p>
          </div>

          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={() => setStep(4)} className="gap-2 text-xs">
              <ArrowLeft className="size-4" />
              Précédent
            </Button>
            <Button
              onClick={handleConfirmOrder}
              className="bg-yolo-ink text-yolo-lime hover:bg-yolo-ink/90 border border-yolo-lime/50 font-bold gap-2 text-xs px-5 shadow-xs"
            >
              <Check className="size-4" />
              Confirmer la commande de transport ({formatFCFA(transportFee)})
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 6: SUCCÈS & CRÉATION EFFECTIVE */}
      {step === 6 && (
        <Card className="p-8 text-center space-y-5 border-emerald-500/30 shadow-md">
          <div className="size-16 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-500/20">
            <CheckCircle2 className="size-10" />
          </div>

          <div className="space-y-1">
            <Badge variant="success" className="mb-2">Demande Confirmée & Transmise au Dispatch</Badge>
            <h2 className="text-xl font-bold text-foreground">Livraison créée avec succès !</h2>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              La recherche de livreurs à proximité de <strong>{selectedSite?.name}</strong> est lancée. Vous serez notifié dès qu&apos;un coursier accepte la course.
            </p>
          </div>

          <div className="p-4 bg-muted/30 rounded-xl border max-w-md mx-auto text-xs space-y-2 text-left font-mono">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Destinataire :</span>
              <span className="font-bold text-foreground">{formData.recipientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total à encaisser (COD) :</span>
              <span className="font-bold text-emerald-600">{formatFCFA(totalToCollect)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Frais Yolo :</span>
              <span className="font-bold text-foreground">{formatFCFA(transportFee)}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setActiveView("deliveries")}
              className="text-xs"
            >
              Voir la liste des courses
            </Button>
            {createdDeliveryId && (
              <Button
                onClick={() => viewDeliveryDetail(createdDeliveryId)}
                className="bg-yolo-ink text-yolo-lime hover:bg-yolo-ink/90 font-semibold text-xs"
              >
                Consulter la livraison
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
