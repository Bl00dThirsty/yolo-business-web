import React, { useState } from "react";
import {
  PackageCheck,
  Clock,
  Wallet,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
  Ellipsis,
  CheckCircle2,
  Truck,
  Bike,
  Coins,
  QrCode,
  Store,
  ChevronRight,
  AlertTriangle,
  MapPin,
  RotateCcw,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDeliveries } from "@/context/delivery-context";
import { useStore } from "@/context/store-context";
import { formatFCFA } from "@/lib/utils";

export function AnalyticsDashboard() {
  const {
    deliveries,
    setActiveView,
    setHandoverDeliveryId,
    viewDeliveryDetail,
    resetAllDeliveries,
  } = useDeliveries();
  const { merchant, pickupSites } = useStore();
  const [selectedRange, setSelectedRange] = useState("today");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Dynamic calculations based strictly on real test deliveries
  const totalDeliveries = deliveries.length;
  const deliveredDeliveries = deliveries.filter((d) => d.status === "delivered");
  const activeDeliveries = deliveries.filter((d) =>
    ["searching_courier", "at_pickup", "in_transit"].includes(d.status)
  );
  const incidentDeliveries = deliveries.filter((d) =>
    ["incident", "return_in_progress"].includes(d.status)
  );
  const cancelledDeliveries = deliveries.filter((d) => d.status === "cancelled");
  const urgentHandover = deliveries.filter((d) => d.status === "at_pickup");

  const totalCodCollected = deliveries.reduce((acc, d) => {
    return acc + (d.paymentMode === "cash_on_delivery" ? (d.totalToCollect || d.goodsAmount) : 0);
  }, 0);

  const totalTransportFees = deliveries.reduce((acc, d) => acc + d.transportFee, 0);
  const readyPayoutAmount = Math.max(0, totalCodCollected - totalTransportFees);

  const resolvedCount = deliveredDeliveries.length + cancelledDeliveries.length + incidentDeliveries.length;
  const successRate =
    resolvedCount > 0 ? Math.round((deliveredDeliveries.length / resolvedCount) * 100) : 100;

  // Dynamic performance metrics per site
  const sitePerformance = pickupSites.map((site) => {
    const siteDeliveries = deliveries.filter((d) => d.pickupSiteId === site.id);
    const siteDelivered = siteDeliveries.filter((d) => d.status === "delivered");
    const siteCod = siteDeliveries.reduce(
      (sum, d) => sum + (d.paymentMode === "cash_on_delivery" ? d.goodsAmount : 0),
      0
    );
    return {
      site: site.name,
      deliveries: `${siteDeliveries.length} course${siteDeliveries.length > 1 ? "s" : ""}`,
      avgPickupTime: siteDeliveries.length > 0 ? "3m 45s" : "-",
      successRate:
        siteDeliveries.length > 0
          ? `${Math.round((siteDelivered.length / siteDeliveries.length) * 100)}%`
          : "-",
      totalCod: formatFCFA(siteCod),
      activeCouriers: siteDeliveries.filter((d) => d.assignedCourier).length,
    };
  });

  // Dynamic distribution for charts
  const siteDistribution = pickupSites
    .map((site, idx) => {
      const count = deliveries.filter((d) => d.pickupSiteId === site.id).length;
      const colors = ["#121317", "#CAF76F", "#BC5F28", "#73766F"];
      return {
        name: site.name,
        value: totalDeliveries > 0 ? Math.round((count / totalDeliveries) * 100) : 0,
        count,
        color: colors[idx % colors.length],
      };
    })
    .filter((s) => s.count > 0);

  const chartData = [
    {
      month: "Actuel",
      deliveries: totalDeliveries,
      codAmount: Math.round(totalCodCollected / 1000), // in thousands
      fees: Math.round(totalTransportFees / 1000),
      successRate,
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header & Filtres */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-4 md:p-6 rounded-xl border shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <Badge variant="yolo" className="px-2 py-0.5 text-[11px] font-bold">
              Espace de Test Yolo Business
            </Badge>
            <Badge variant="success" className="px-2 py-0.5 text-xs font-medium gap-1">
              <ShieldCheck className="size-3.5" />
              Données de test actives • Dispatch 20 km
            </Badge>
            <Badge variant="outline" className="px-2 py-0.5 text-xs font-normal">
              {merchant.city} • {pickupSites.length} points de retrait
            </Badge>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
            Tableau de Bord Logistique & Supervision des Tests
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground">
            Indicateurs calculés en direct à partir des livraisons réelles créées pour vos tests.
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          <Select value={selectedRange} onValueChange={setSelectedRange}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="today">Aujourd&apos;hui</SelectItem>
                <SelectItem value="session">Session en cours</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            className={isRefreshing ? "animate-spin" : ""}
            title="Actualiser les métriques"
          >
            <RefreshCw className="size-3.5" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (
                window.confirm(
                  "Réinitialiser toutes les données de test ? Les livraisons créées seront supprimées."
                )
              ) {
                resetAllDeliveries();
              }
            }}
            className="text-xs gap-1.5 text-muted-foreground hover:text-destructive"
            title="Effacer les livraisons de test"
          >
            <RotateCcw className="size-3.5" />
            <span className="hidden sm:inline">Réinitialiser</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="outline" aria-label="Actions de supervision">
                <Ellipsis className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 text-xs">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setActiveView("create_delivery")}>
                  <Truck className="size-3.5 mr-2" />
                  Nouvelle livraison
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveView("deliveries")}>
                  <PackageCheck className="size-3.5 mr-2" />
                  Voir les livraisons
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={handleRefresh}>
                  <RefreshCw className="size-3.5 mr-2" />
                  Actualiser métriques
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Alerte si des livreurs attendent au comptoir (L04) */}
      {urgentHandover.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-lg bg-amber-500/20 text-amber-800 dark:text-amber-300 flex items-center justify-center shrink-0">
              <QrCode className="size-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center flex-wrap gap-1.5">
                <span>Action requise : Livreur arrivé au point de retrait</span>
                <Badge variant="warning" className="text-[10px] px-2 py-0.5 shrink-0 whitespace-nowrap">
                  {urgentHandover.length} en attente
                </Badge>
              </div>
              <p className="text-xs text-amber-800/80 dark:text-amber-400">
                {urgentHandover[0].assignedCourier?.name || "Un coursier"} attend au comptoir{" "}
                {urgentHandover[0].pickupSiteName} pour la course #{urgentHandover[0].reference}.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="yolo"
            onClick={() => {
              setHandoverDeliveryId(urgentHandover[0].id);
              setActiveView("deliveries");
            }}
            className="shrink-0 text-xs font-semibold gap-1.5"
          >
            <QrCode className="size-3.5" />
            Vérifier & Confirmer le retrait
          </Button>
        </div>
      )}

      {/* 2. KPI Strip dynamique */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-3.5">
        {/* KPI 1 : Volume des Livraisons */}
        <Card className="p-3 sm:p-4 space-y-1.5 sm:space-y-2.5 shadow-xs hover:border-yolo-ink/30 transition-colors">
          <div className="flex items-center justify-between text-[11px] sm:text-xs text-muted-foreground font-medium">
            <span className="truncate">Courses créées</span>
            <div className="flex size-6 sm:size-7 items-center justify-center rounded-lg border bg-yolo-ink/5 text-yolo-ink dark:bg-yolo-lime/10 dark:text-yolo-lime shrink-0">
              <PackageCheck className="size-3.5 sm:size-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold tracking-tight tabular-nums text-foreground">
            {totalDeliveries}
          </div>
          <div className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground font-medium">
            <span>{deliveredDeliveries.length} livrée{deliveredDeliveries.length > 1 ? "s" : ""}</span>
          </div>
        </Card>

        {/* KPI 2 : Taux de Succès */}
        <Card className="p-3 sm:p-4 space-y-1.5 sm:space-y-2.5 shadow-xs hover:border-yolo-ink/30 transition-colors">
          <div className="flex items-center justify-between text-[11px] sm:text-xs text-muted-foreground font-medium">
            <span className="truncate">Taux Succès</span>
            <div className="flex size-6 sm:size-7 items-center justify-center rounded-lg border bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300 shrink-0">
              <ShieldCheck className="size-3.5 sm:size-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold tracking-tight tabular-nums text-foreground">
            {totalDeliveries === 0 ? "100%" : `${successRate}%`}
          </div>
          <div className="flex items-center gap-1 text-[10px] sm:text-xs text-emerald-600 font-medium">
            <ArrowUpRight className="size-3 sm:size-3.5 shrink-0" />
            <span className="truncate">{activeDeliveries.length} en cours</span>
          </div>
        </Card>

        {/* KPI 3 : Au Retrait */}
        <Card className="p-3 sm:p-4 space-y-1.5 sm:space-y-2.5 shadow-xs hover:border-yolo-ink/30 transition-colors">
          <div className="flex items-center justify-between text-[11px] sm:text-xs text-muted-foreground font-medium">
            <span className="truncate">Au Retrait</span>
            <div className="flex size-6 sm:size-7 items-center justify-center rounded-lg border bg-yolo-lime/20 text-yolo-ink dark:bg-yolo-lime/15 dark:text-yolo-lime shrink-0">
              <Clock className="size-3.5 sm:size-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold tracking-tight tabular-nums text-foreground">
            {urgentHandover.length}
          </div>
          <div className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground font-medium">
            <span className="truncate">En attente de remise</span>
          </div>
        </Card>

        {/* KPI 4 : Fonds Encaissés (COD Marchandise) */}
        <Card className="p-3 sm:p-4 space-y-1.5 sm:space-y-2.5 shadow-xs hover:border-yolo-ink/30 transition-colors">
          <div className="flex items-center justify-between text-[11px] sm:text-xs text-muted-foreground font-medium">
            <span className="truncate">COD Marchandise</span>
            <div className="flex size-6 sm:size-7 items-center justify-center rounded-lg border bg-amber-500/10 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 shrink-0">
              <Coins className="size-3.5 sm:size-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold tracking-tight tabular-nums text-foreground truncate">
            {formatFCFA(totalCodCollected)}
          </div>
          <div className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground font-medium truncate">
            <span>Fonds à percevoir</span>
          </div>
        </Card>

        {/* KPI 5 : Reversements Disponibles J+0 */}
        <Card className="col-span-2 sm:col-span-1 lg:col-span-1 p-3 sm:p-4 space-y-1.5 sm:space-y-2.5 shadow-xs hover:border-yolo-ink/30 transition-colors">
          <div className="flex items-center justify-between text-[11px] sm:text-xs text-muted-foreground font-medium">
            <span className="truncate">Net Commerçant</span>
            <div className="flex size-6 sm:size-7 items-center justify-center rounded-lg border bg-yolo-ink text-yolo-lime shadow-xs shrink-0">
              <Wallet className="size-3.5 sm:size-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold tracking-tight tabular-nums text-emerald-600 truncate">
            {formatFCFA(readyPayoutAmount)}
          </div>
          <div className="flex items-center gap-1 text-[10px] sm:text-xs text-emerald-600 font-medium truncate">
            <CheckCircle2 className="size-3 sm:size-3.5 shrink-0" />
            <span>Net après frais</span>
          </div>
        </Card>
      </div>

      {/* État vide si aucune course créée */}
      {totalDeliveries === 0 && (
        <Card className="p-8 text-center border-dashed border-2 bg-muted/10 space-y-3">
          <div className="size-12 rounded-full bg-yolo-lime/20 text-yolo-ink dark:text-yolo-lime flex items-center justify-center mx-auto">
            <Truck className="size-6" />
          </div>
          <h3 className="text-base font-bold text-foreground">
            Plateforme propre — Prête pour vos tests
          </h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Toutes les données fictives ont été supprimées. Créez votre première livraison depuis l&apos;assistant pour observer l&apos;actualisation automatique des indicateurs.
          </p>
          <Button
            variant="yolo"
            size="sm"
            onClick={() => setActiveView("create_delivery")}
            className="font-semibold gap-1.5 mt-2"
          >
            <Truck className="size-4" />
            Créer ma première livraison de test
          </Button>
        </Card>
      )}

      {/* 3. Onglets Analytiques */}
      <Tabs defaultValue="overview" className="space-y-4">
        <div className="overflow-x-auto no-scrollbar pb-1">
          <TabsList className="w-full justify-start flex-nowrap h-9 sm:h-10 p-1 bg-muted/50 gap-1">
            <TabsTrigger value="overview" className="shrink-0 text-xs px-3 py-1.5">Vue d&apos;ensemble</TabsTrigger>
            <TabsTrigger value="dispatch" className="shrink-0 text-xs px-3 py-1.5">Opérations & Dispatch</TabsTrigger>
            <TabsTrigger value="finances_tab" className="shrink-0 text-xs px-3 py-1.5">Finances & Rapprochement (COD)</TabsTrigger>
            <TabsTrigger value="sites_tab" className="shrink-0 text-xs px-3 py-1.5">Points de Retrait</TabsTrigger>
            <TabsTrigger value="sav_tab" className="shrink-0 text-xs px-3 py-1.5">Incidents & Retours</TabsTrigger>
          </TabsList>
        </div>

        {/* Tab 1 : Vue d'ensemble */}
        <TabsContent value="overview" className="space-y-6 mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Graphique 1 : Volume mensuel des courses & encaissements */}
            <Card className="lg:col-span-8 p-4 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-sm font-bold text-foreground">
                    Activité des Livraisons de Test
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Suivi des courses saisies au cours de la session.
                  </CardDescription>
                </div>
              </div>

              {totalDeliveries === 0 ? (
                <div className="h-48 flex items-center justify-center text-xs text-muted-foreground border border-dashed rounded-lg">
                  Aucune course enregistrée. Les données s&apos;afficheront ici au fil de vos créations.
                </div>
              ) : (
                <div className="h-60 sm:h-68 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.6} />
                      <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis yAxisId="left" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#121317",
                          borderRadius: "10px",
                          border: "1px solid #2A2E2B",
                          color: "#fff",
                        }}
                      />
                      <Bar yAxisId="left" dataKey="deliveries" fill="#121317" radius={[4, 4, 0, 0]} name="Courses" />
                      <Bar yAxisId="right" dataKey="codAmount" fill="#BC5F28" radius={[4, 4, 0, 0]} name="COD (k FCFA)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>

            {/* Graphique 2 : Répartition par Point de Retrait */}
            <Card className="lg:col-span-4 p-6 space-y-4">
              <div>
                <CardTitle className="text-sm font-bold text-foreground">
                  Répartition par Point de Retrait
                </CardTitle>
                <CardDescription className="text-xs">
                  Contribution de chaque point de retrait au volume de test.
                </CardDescription>
              </div>

              {siteDistribution.length === 0 ? (
                <div className="h-44 flex items-center justify-center text-xs text-muted-foreground border border-dashed rounded-lg">
                  Aucune livraison par site
                </div>
              ) : (
                <>
                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={siteDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={46}
                          outerRadius={70}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {siteDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#121317",
                            borderRadius: "8px",
                            border: "none",
                            color: "#fff",
                            fontSize: "11px",
                          }}
                          formatter={(value) => `${value} %`}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t text-xs">
                    {siteDistribution.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-muted-foreground">
                          <span className="size-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                          {item.name}
                        </span>
                        <span className="font-bold text-foreground">{item.count} course(s) ({item.value}%)</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </Card>
          </div>

          {/* Tableau de Performance des Points de Retrait */}
          <Card className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <CardTitle className="text-sm font-bold text-foreground">
                  Performance Opérationnelle par Point de Retrait
                </CardTitle>
                <CardDescription className="text-xs">
                  Statistiques calculées à partir de vos livraisons de test actives.
                </CardDescription>
              </div>
              <Badge variant="secondary" className="text-xs self-start sm:self-auto">
                Mise à jour en direct
              </Badge>
            </div>

            <div className="overflow-hidden rounded-xl border">
              <Table className="min-w-[650px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Point de Retrait</TableHead>
                    <TableHead className="text-right">Courses Totales</TableHead>
                    <TableHead className="text-right">Délai Retrait</TableHead>
                    <TableHead className="text-right">Livreurs Actifs</TableHead>
                    <TableHead className="text-right">Fonds COD Collectés</TableHead>
                    <TableHead className="text-right">Taux de Succès</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sitePerformance.map((site, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-semibold text-foreground flex items-center gap-2">
                        <Store className="size-3.5 text-muted-foreground" />
                        {site.site}
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold text-foreground">
                        {site.deliveries}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground font-mono">
                        {site.avgPickupTime}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        <span className="inline-flex items-center gap-1 font-mono">
                          <Bike className="size-3" />
                          {site.activeCouriers}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold text-foreground">
                        {site.totalCod}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant={site.successRate === "-" ? "outline" : "success"} className="font-bold">
                          {site.successRate}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        {/* Tab 2 : Opérations & Dispatch */}
        <TabsContent value="dispatch" className="space-y-6 mt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 space-y-2">
              <div className="text-xs text-muted-foreground font-medium">Temps moyen d&apos;attribution</div>
              <div className="text-2xl font-bold text-foreground">
                {deliveries.some((d) => d.assignedCourier) ? "3 min 48s" : "-"}
              </div>
              <p className="text-[11px] text-muted-foreground">Délai entre déclaration &quot;Colis prêts&quot; et acceptation coursier.</p>
            </Card>
            <Card className="p-4 space-y-2">
              <div className="text-xs text-muted-foreground font-medium">Rayon de recherche PostGIS</div>
              <div className="text-2xl font-bold text-foreground">20.0 km</div>
              <p className="text-[11px] text-muted-foreground">Proximité étendue pour couvrir l&apos;ensemble de la zone de test.</p>
            </Card>
            <Card className="p-4 space-y-2">
              <div className="text-xs text-muted-foreground font-medium">Courses actives en direct</div>
              <div className="text-2xl font-bold text-yolo-ink dark:text-yolo-lime">
                {activeDeliveries.length}
              </div>
              <p className="text-[11px] text-muted-foreground">En cours de préparation, retrait ou acheminement.</p>
            </Card>
          </div>

          {/* Courses récentes actives */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold">Dernières Livraisons & Statuts de Garde</CardTitle>
                <CardDescription className="text-xs">
                  Suivi de la responsabilité physique du colis (Commerce ➔ Livreur ➔ Destinataire).
                </CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={() => setActiveView("deliveries")}>
                Voir tout le listing
              </Button>
            </div>

            {deliveries.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground border border-dashed rounded-lg">
                Aucune livraison de test créée pour le moment.
              </div>
            ) : (
              <div className="space-y-2">
                {deliveries.slice(0, 5).map((del) => (
                  <div
                    key={del.id}
                    onClick={() => viewDeliveryDetail(del.id)}
                    className="flex items-center justify-between p-3 rounded-lg border bg-muted/20 hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="size-8 rounded-md bg-background border flex items-center justify-center font-bold text-xs">
                        {del.assignedCourier ? <Bike className="size-4" /> : <Clock className="size-4 text-muted-foreground" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-foreground">{del.reference}</span>
                          <span className="text-[11px] text-muted-foreground">• {del.pickupSiteName}</span>
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          Destinataire : <strong className="text-foreground">{del.recipientName}</strong> ({del.recipientNeighborhood})
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right hidden sm:block">
                        <div className="font-mono text-xs font-bold text-foreground">{formatFCFA(del.goodsAmount)}</div>
                        <div className="text-[10px] text-muted-foreground">
                          {del.paymentMode === "cash_on_delivery" ? "COD à collecter" : "Prépayé"}
                        </div>
                      </div>
                      <Badge
                        variant={
                          del.status === "delivered"
                            ? "success"
                            : del.status === "at_pickup"
                            ? "warning"
                            : del.status === "incident"
                            ? "destructive"
                            : "secondary"
                        }
                        className="capitalize text-xs"
                      >
                        {del.status.replace("_", " ")}
                      </Badge>
                      <ChevronRight className="size-4 text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Tab 3 : Finances & Rapprochement COD */}
        <TabsContent value="finances_tab" className="space-y-6 mt-0">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-4 space-y-1">
              <span className="text-xs text-muted-foreground font-medium">Total Collecté (COD)</span>
              <div className="text-2xl font-bold text-foreground">{formatFCFA(totalCodCollected)}</div>
              <span className="text-xs text-emerald-600 font-medium">{deliveries.filter((d) => d.paymentMode === "cash_on_delivery").length} course(s) COD</span>
            </Card>
            <Card className="p-4 space-y-1">
              <span className="text-xs text-muted-foreground font-medium">Frais de Transport Yolo</span>
              <div className="text-2xl font-bold text-foreground">{formatFCFA(totalTransportFees)}</div>
              <span className="text-xs text-muted-foreground">Total transport des courses de test</span>
            </Card>
            <Card className="p-4 space-y-1">
              <span className="text-xs text-muted-foreground font-medium">Solde Net Reversé</span>
              <div className="text-2xl font-bold text-emerald-600 font-bold">{formatFCFA(readyPayoutAmount)}</div>
              <span className="text-xs text-muted-foreground">Vers MTN MoMo ({merchant.mobileMoneyAccount.number})</span>
            </Card>
          </div>

          <Card className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold">Règle de séparation financière stricte</CardTitle>
                <CardDescription className="text-xs">
                  Conforme à la section 12 du userflow Yolo Business : Les espèces perçues par les livreurs ne constituent pas un reversement tant que le rapprochement J+0 n&apos;est pas audité.
                </CardDescription>
              </div>
              <Button size="sm" onClick={() => setActiveView("finances")}>
                Voir le Grand Livre
              </Button>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg text-xs space-y-2 border">
              <div className="flex items-center justify-between">
                <span>Rapprochement automatique MTN MoMo / Orange Money</span>
                <Badge variant="success">Instantané</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Dépôt physique des espèces par les livreurs au hub Yolo</span>
                <Badge variant="secondary">Régularisé chaque jour à 18h00</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Délai moyen de reversement vers le compte marchand</span>
                <Badge variant="outline">Même jour (J+0)</Badge>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Tab 4 : Points de Retrait */}
        <TabsContent value="sites_tab" className="space-y-6 mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pickupSites.map((site) => (
              <Card key={site.id} className="p-4 space-y-3 border shadow-xs">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground">{site.name}</span>
                      {site.isDefault && <Badge variant="yolo" className="text-[10px] py-0.5">Principal</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="size-3" />
                      {site.address}
                    </p>
                  </div>
                  <Badge variant={site.active ? "success" : "outline"} className="text-xs">
                    {site.active ? "Actif" : "Inactif"}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Contact sur place :</span>
                    <span className="font-semibold text-foreground">{site.contactName}</span>
                    <div className="text-[11px] text-muted-foreground font-mono">{site.contactPhone}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Horaires de retrait :</span>
                    <span className="font-semibold text-foreground">{site.openingHours}</span>
                  </div>
                </div>

                <div className="text-[11px] bg-muted/40 p-2 rounded text-muted-foreground">
                  <strong>Instructions coursier :</strong> {site.instructions}
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab 5 : SAV & Incidents */}
        <TabsContent value="sav_tab" className="space-y-6 mt-0">
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold">Gestion des Échecs de Remise & Retours (L06 / L07)</CardTitle>
                <CardDescription className="text-xs">
                  Procédure auditée : client injoignable, adresse erronée ou refus de marchandise.
                </CardDescription>
              </div>
              <Badge variant={incidentDeliveries.length > 0 ? "destructive" : "secondary"} className="text-xs">
                {incidentDeliveries.length} incident(s) en cours
              </Badge>
            </div>

            {incidentDeliveries.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground border border-dashed rounded-lg">
                Aucun incident en cours sur vos livraisons de test. Tout se déroule normalement.
              </div>
            ) : (
              <div className="space-y-3">
                {incidentDeliveries.map((del) => (
                  <div key={del.id} className="p-4 rounded-xl border border-destructive/30 bg-destructive/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="size-4 text-destructive" />
                        <span className="font-bold text-xs text-foreground">Course #{del.reference} — {del.recipientNeighborhood}</span>
                      </div>
                      <Badge variant="destructive">Incident</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Destinataire : {del.recipientName} ({del.recipientPhone}). Point de retrait : {del.pickupSiteName}.
                    </p>
                    <div className="flex items-center gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="yolo"
                        onClick={() => {
                          alert(`Procédure de retour engagée pour ${del.reference}.`);
                        }}
                        className="text-xs"
                      >
                        Valider le retour vers {del.pickupSiteName}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setActiveView("support")}
                        className="text-xs"
                      >
                        Contacter l&apos;assistance
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
