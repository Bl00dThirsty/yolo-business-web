import React, { useState } from "react";
import {
  Wallet,
  ArrowUpRight,
  Coins,
  FileText,
  FileDown,
  Clock,
  Download,
  ShieldCheck,
  Building2,
  Smartphone,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatFCFA } from "@/lib/utils";
import { useStore } from "@/context/store-context";
import { useDeliveries } from "@/context/delivery-context";
import { FinanceMovement, Invoice, Payout } from "@/lib/types";

export function FinancesView() {
  const { merchant } = useStore();
  const { deliveries } = useDeliveries();
  const [activeTab, setActiveTab] = useState("movements");

  // Dynamic calculations from test deliveries
  const codDeliveries = deliveries.filter((d) => d.paymentMode === "cash_on_delivery");
  const totalCod = codDeliveries.reduce((sum, d) => sum + (d.totalToCollect || d.goodsAmount), 0);
  const totalTransport = deliveries.reduce((sum, d) => sum + d.transportFee, 0);
  const netAvailable = Math.max(0, totalCod - totalTransport);

  // Dynamic movements generated from test deliveries
  const dynamicMovements: FinanceMovement[] = [];
  deliveries.forEach((d) => {
    if (d.paymentMode === "cash_on_delivery") {
      dynamicMovements.push({
        id: `mov_cod_${d.id}`,
        date: d.createdAt
          ? new Date(d.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
          : "Aujourd'hui",
        reference: `MOV-COD-${d.reference.slice(-4)}`,
        deliveryReference: d.reference,
        type: "cod_collection",
        typeLabel: "Collecte Marchandise (COD)",
        amount: d.goodsAmount,
        isCredit: true,
        channel: "MTN MoMo",
        status: d.status === "delivered" ? "effectué" : "en_cours",
        description: `Encaissement destinataire : ${d.recipientName} (${d.recipientNeighborhood})`,
      });
    }
    dynamicMovements.push({
      id: `mov_tf_${d.id}`,
      date: d.createdAt
        ? new Date(d.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
        : "Aujourd'hui",
      reference: `MOV-TF-${d.reference.slice(-4)}`,
      deliveryReference: d.reference,
      type: "transport_fee_debit",
      typeLabel: "Frais de transport course",
      amount: d.transportFee,
      isCredit: false,
      channel: "Compte Yolo",
      status: "effectué",
      description: `Transport ${d.pickupNeighborhood} ➔ ${d.recipientNeighborhood}`,
    });
  });

  const payouts: Payout[] = [];
  const invoices: Invoice[] = [];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Gestion Financière & Rapprochement des Fonds (COD)
            </h1>
            <Badge variant="success" className="text-[10px] gap-1">
              <ShieldCheck className="size-3" /> Rapprochement J+0 Actif
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Séparation stricte : Transport facturé • Collecte de marchandise auprès des clients • Reversements commerçant.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => alert("Relevé de trésorerie exporté")}
          className="gap-2 text-xs self-start sm:self-auto"
        >
          <FileDown className="size-3.5" />
          Exporter le Grand Livre
        </Button>
      </div>

      {/* 4 Financial Metric Cards (F01) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 space-y-2 shadow-xs border-yolo-ink/20">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span>Solde Net Disponible</span>
            <div className="size-7 rounded-lg bg-yolo-ink text-yolo-lime flex items-center justify-center font-bold">
              <Wallet className="size-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 font-mono">
            {formatFCFA(netAvailable)}
          </div>
          <div className="text-[11px] text-muted-foreground">
            Vers MTN MoMo : <strong>{merchant.mobileMoneyAccount.number}</strong>
          </div>
        </Card>

        <Card className="p-4 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span>Fonds Collectés (COD)</span>
            <div className="size-7 rounded-lg bg-amber-500/10 text-amber-700 flex items-center justify-center">
              <Coins className="size-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground font-mono">
            {formatFCFA(totalCod)}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
            <ArrowUpRight className="size-3" />
            {codDeliveries.length} course(s) COD
          </div>
        </Card>

        <Card className="p-4 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span>Transport Facturé Yolo</span>
            <div className="size-7 rounded-lg bg-muted text-muted-foreground flex items-center justify-center">
              <FileText className="size-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground font-mono">
            {formatFCFA(totalTransport)}
          </div>
          <div className="text-[11px] text-muted-foreground">
            {deliveries.length} course(s) enregistrée(s)
          </div>
        </Card>

        <Card className="p-4 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span>Reversement du Jour (J+0)</span>
            <div className="size-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Clock className="size-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground font-mono">
            {formatFCFA(netAvailable)}
          </div>
          <div className="text-[11px] text-amber-600 font-semibold">
            Rapprochement à la remise
          </div>
        </Card>
      </div>

      {/* Tabs: Mouvements, Factures, Reversements */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="overflow-x-auto no-scrollbar pb-1">
          <TabsList className="bg-muted/50 p-1 inline-flex w-auto min-w-max">
            <TabsTrigger value="movements">Grand Livre des Écritures ({dynamicMovements.length})</TabsTrigger>
            <TabsTrigger value="payouts">Historique des Reversements ({payouts.length})</TabsTrigger>
            <TabsTrigger value="invoices">Factures de Transport ({invoices.length})</TabsTrigger>
          </TabsList>
        </div>

        {/* Tab 1 : Mouvements */}
        <TabsContent value="movements" className="space-y-4 mt-0">
          <Card className="overflow-hidden border shadow-xs">
            <Table className="min-w-[720px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Réf</TableHead>
                  <TableHead>Type d&apos;Écriture</TableHead>
                  <TableHead>Course Liée</TableHead>
                  <TableHead>Canal</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                  <TableHead className="text-right">Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dynamicMovements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground text-xs">
                      Aucun mouvement financier enregistré pour le moment.
                      Les écritures se créeront automatiquement au fil de vos livraisons de test.
                    </TableCell>
                  </TableRow>
                ) : (
                  dynamicMovements.map((mov) => (
                    <TableRow key={mov.id} className="hover:bg-muted/30">
                      <TableCell>
                        <div className="font-mono text-xs font-semibold text-foreground">{mov.reference}</div>
                        <div className="text-[10px] text-muted-foreground">{mov.date}</div>
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">
                          {mov.typeLabel}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        {mov.deliveryReference ? (
                          <span className="font-mono text-xs text-foreground font-semibold">
                            {mov.deliveryReference}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </TableCell>

                      <TableCell>
                        <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                          {mov.channel.includes("MoMo") || mov.channel.includes("Orange") ? (
                            <Smartphone className="size-3 text-yolo-ink dark:text-yolo-lime" />
                          ) : (
                            <Building2 className="size-3" />
                          )}
                          {mov.channel}
                        </span>
                      </TableCell>

                      <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                        {mov.description}
                      </TableCell>

                      <TableCell className="text-right font-mono font-bold text-xs">
                        <span className={mov.isCredit ? "text-emerald-600" : "text-foreground"}>
                          {mov.isCredit ? "+" : "-"} {formatFCFA(mov.amount)}
                        </span>
                      </TableCell>

                      <TableCell className="text-right">
                        <Badge variant="success" className="text-[10px]">
                          {mov.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Tab 2 : Reversements */}
        <TabsContent value="payouts" className="space-y-4 mt-0">
          <Card className="overflow-hidden border shadow-xs">
            <Table className="min-w-[700px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Référence & Date</TableHead>
                  <TableHead>Période</TableHead>
                  <TableHead>Compte de Destination</TableHead>
                  <TableHead className="text-right">Fonds Bruts COD</TableHead>
                  <TableHead className="text-right">Frais Déduits</TableHead>
                  <TableHead className="text-right">Net Reversé</TableHead>
                  <TableHead className="text-right">Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payouts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground text-xs">
                      Aucun reversement généré pour le moment.
                    </TableCell>
                  </TableRow>
                ) : (
                  payouts.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div className="font-mono text-xs font-bold text-foreground">{p.reference}</div>
                        <div className="text-[10px] font-mono text-muted-foreground">{p.traceId}</div>
                      </TableCell>
                      <TableCell className="text-xs font-medium text-foreground">{p.period}</TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono">
                        {p.method} • {p.accountNumber}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs text-foreground">
                        {formatFCFA(p.grossCodAmount)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs text-muted-foreground">
                        {formatFCFA(p.deductedFees)}
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold text-sm text-emerald-600">
                        {formatFCFA(p.netPayoutAmount)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant={p.status === "virement_effectué" ? "success" : "warning"}>
                          {p.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Tab 3 : Factures */}
        <TabsContent value="invoices" className="space-y-4 mt-0">
          <Card className="overflow-hidden border shadow-xs">
            <Table className="min-w-[700px]">
              <TableHeader>
                <TableRow>
                  <TableHead>N° Facture</TableHead>
                  <TableHead>Période</TableHead>
                  <TableHead className="text-right">Volume Courses</TableHead>
                  <TableHead className="text-right">Frais Transport HT</TableHead>
                  <TableHead className="text-right">TVA (19.25%)</TableHead>
                  <TableHead className="text-right">Total TTC</TableHead>
                  <TableHead className="text-right">Statut</TableHead>
                  <TableHead className="text-right">Document</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-muted-foreground text-xs">
                      Aucune facture de transport émise pour le moment.
                    </TableCell>
                  </TableRow>
                ) : (
                  invoices.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell className="font-mono font-bold text-xs text-foreground">
                        {inv.number}
                      </TableCell>
                      <TableCell className="text-xs font-medium text-foreground">{inv.period}</TableCell>
                      <TableCell className="text-right font-mono text-xs text-foreground">
                        {inv.totalDeliveries}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs text-foreground">
                        {formatFCFA(inv.totalTransportFees)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs text-muted-foreground">
                        {formatFCFA(inv.taxAmount)}
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold text-xs text-foreground">
                        {formatFCFA(inv.netPayable)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="success">{inv.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => alert(`Téléchargement de la facture ${inv.number} en PDF`)}
                          className="gap-1 text-[11px] h-7 px-2"
                        >
                          <Download className="size-3" />
                          PDF
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
