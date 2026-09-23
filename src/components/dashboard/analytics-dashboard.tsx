import React, { useState } from "react";
import {
  PackageCheck,
  Clock,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  FileDown,
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
import {
  MONTHLY_DELIVERY_DATA,
  PICKUP_SITE_DISTRIBUTION,
  SITE_PERFORMANCE_METRICS,
} from "@/lib/mock-data";
import { useDeliveries } from "@/context/delivery-context";
import { useStore } from "@/context/store-context";
import { formatFCFA } from "@/lib/utils";

export function AnalyticsDashboard() {
  const { deliveries, setActiveView, setHandoverDeliveryId, viewDeliveryDetail } = useDeliveries();
  const { merchant, pickupSites } = useStore();
  const [selectedRange, setSelectedRange] = useState("last-4-weeks");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  // Urgent deliveries at pickup
  const urgentHandover = deliveries.filter((d) => d.status === "at_pickup");

  return (
    <div className="space-y-6">
      {/* 1. Header & Filtres (Inspiré de CFC /admin/analytics) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-4 md:p-6 rounded-xl border shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <Badge variant="yolo" className="px-2 py-0.5 text-[11px] font-bold">
              Supervision Yolo Business
            </Badge>
            <Badge variant="success" className="px-2 py-0.5 text-xs font-medium gap-1">
              <ShieldCheck className="size-3.5" />
              Dispatch PostGIS & Rapprochement J+0 Connecté
            </Badge>
            <Badge variant="outline" className="px-2 py-0.5 text-xs font-normal">
              {merchant.city} • {pickupSites.length} points de retrait
            </Badge>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
            Tableau de Bord & Indicateurs de Performance Logistique
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground">
            Suivi en temps réel des courses urbaines, de la cadence au retrait, de la collecte COD et des reversements commerçant.
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <Select value={selectedRange} onValueChange={setSelectedRange}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="today">Aujourd&apos;hui</SelectItem>
                <SelectItem value="last-7-days">7 derniers jours</SelectItem>
                <SelectItem value="last-4-weeks">4 dernières semaines</SelectItem>
                <SelectItem value="year-to-date">Année en cours</SelectItem>
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="outline" aria-label="Actions de supervision">
                <Ellipsis className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 text-xs">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Actions analytiques</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => alert("Rapport PDF généré pour " + merchant.name)}>
                  <FileDown className="size-3.5 mr-2" />
                  Exporter rapport PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => alert("Export comptable CSV généré")}>
                  <FileDown className="size-3.5 mr-2" />
                  Export des écritures CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveView("create_delivery")}>
                  <Truck className="size-3.5 mr-2" />
                  Créer une livraison
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
                {urgentHandover[0].assignedCourier?.name} attend au comptoir {urgentHandover[0].pickupSiteName} pour la course #{urgentHandover[0].reference}.
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

      {/* 2. KPI Strip (5 Métriques majeures inspirées du CFC) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-3.5">
        {/* KPI 1 : Volume des Livraisons */}
        <Card className="p-3 sm:p-4 space-y-1.5 sm:space-y-2.5 shadow-xs hover:border-yolo-ink/30 transition-colors">
          <div className="flex items-center justify-between text-[11px] sm:text-xs text-muted-foreground font-medium">
            <span className="truncate">Courses</span>
            <div className="flex size-6 sm:size-7 items-center justify-center rounded-lg border bg-yolo-ink/5 text-yolo-ink dark:bg-yolo-lime/10 dark:text-yolo-lime shrink-0">
              <PackageCheck className="size-3.5 sm:size-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold tracking-tight tabular-nums text-foreground">
            1 482
          </div>
          <div className="flex items-center gap-1 text-[10px] sm:text-xs text-emerald-600 font-medium">
            <ArrowUpRight className="size-3 sm:size-3.5 shrink-0" />
            <span className="truncate">+18.4% ce mois</span>
          </div>
        </Card>

        {/* KPI 2 : Taux de Succès & Ponctualité */}
        <Card className="p-3 sm:p-4 space-y-1.5 sm:space-y-2.5 shadow-xs hover:border-yolo-ink/30 transition-colors">
          <div className="flex items-center justify-between text-[11px] sm:text-xs text-muted-foreground font-medium">
            <span className="truncate">Taux Succès</span>
            <div className="flex size-6 sm:size-7 items-center justify-center rounded-lg border bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300 shrink-0">
              <ShieldCheck className="size-3.5 sm:size-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold tracking-tight tabular-nums text-foreground">
            98.2%
          </div>
          <div className="flex items-center gap-1 text-[10px] sm:text-xs text-emerald-600 font-medium">
            <ArrowUpRight className="size-3 sm:size-3.5 shrink-0" />
            <span className="truncate">Moyenne 32 min</span>
          </div>
        </Card>

        {/* KPI 3 : Temps Moyen au Retrait */}
        <Card className="p-3 sm:p-4 space-y-1.5 sm:space-y-2.5 shadow-xs hover:border-yolo-ink/30 transition-colors">
          <div className="flex items-center justify-between text-[11px] sm:text-xs text-muted-foreground font-medium">
            <span className="truncate">Au Retrait</span>
            <div className="flex size-6 sm:size-7 items-center justify-center rounded-lg border bg-yolo-lime/20 text-yolo-ink dark:bg-yolo-lime/15 dark:text-yolo-lime shrink-0">
              <Clock className="size-3.5 sm:size-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold tracking-tight tabular-nums text-foreground">
            3m 45s
          </div>
          <div className="flex items-center gap-1 text-[10px] sm:text-xs text-emerald-600 font-medium">
            <ArrowDownRight className="size-3 sm:size-3.5 shrink-0" />
            <span className="truncate">-42s vs M-1</span>
          </div>
        </Card>

        {/* KPI 4 : Fonds Encaissés (COD Marchandise) */}
        <Card className="p-3 sm:p-4 space-y-1.5 sm:space-y-2.5 shadow-xs hover:border-yolo-ink/30 transition-colors">
          <div className="flex items-center justify-between text-[11px] sm:text-xs text-muted-foreground font-medium">
            <span className="truncate">Collecté (COD)</span>
            <div className="flex size-6 sm:size-7 items-center justify-center rounded-lg border bg-amber-500/10 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 shrink-0">
              <Coins className="size-3.5 sm:size-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold tracking-tight tabular-nums text-foreground">
            14,85 M
          </div>
          <div className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground font-medium truncate">
            <span>68% MoMo / OM</span>
          </div>
        </Card>

        {/* KPI 5 : Reversements Disponibles J+0 */}
        <Card className="col-span-2 sm:col-span-1 lg:col-span-1 p-3 sm:p-4 space-y-1.5 sm:space-y-2.5 shadow-xs hover:border-yolo-ink/30 transition-colors">
          <div className="flex items-center justify-between text-[11px] sm:text-xs text-muted-foreground font-medium">
            <span className="truncate">Reversements Prêts</span>
            <div className="flex size-6 sm:size-7 items-center justify-center rounded-lg border bg-yolo-ink text-yolo-lime shadow-xs shrink-0">
              <Wallet className="size-3.5 sm:size-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold tracking-tight tabular-nums text-emerald-600">
            13,00 M
          </div>
          <div className="flex items-center gap-1 text-[10px] sm:text-xs text-emerald-600 font-medium truncate">
            <CheckCircle2 className="size-3 sm:size-3.5 shrink-0" />
            <span>Rapprochement J+0 validé</span>
          </div>
        </Card>
      </div>

      {/* 3. Onglets Analytiques (Inspirés des onglets CFC) */}
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
          {/* Graphiques 1 & 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Graphique 1 : Volume mensuel des courses & encaissements */}
            <Card className="lg:col-span-8 p-4 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-sm font-bold text-foreground">
                    Évolution Mensuelle des Courses & Fonds Encaissés (Millions FCFA)
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Volume des livraisons traitées avec réconciliation MoMo/OM et frais de transport Yolo.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3 text-xs flex-wrap">
                  <span className="flex items-center gap-1.5 font-medium text-foreground">
                    <span className="size-2.5 rounded-xs bg-yolo-ink"></span> Livraisons
                  </span>
                  <span className="flex items-center gap-1.5 font-medium text-amber-700">
                    <span className="size-2.5 rounded-xs bg-[#BC5F28]"></span> COD (M FCFA)
                  </span>
                  <span className="flex items-center gap-1.5 font-medium text-emerald-700">
                    <span className="size-2.5 rounded-xs bg-[#CAF76F]"></span> Taux (%)
                  </span>
                </div>
              </div>

              <div className="h-60 sm:h-68 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={MONTHLY_DELIVERY_DATA} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
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
                        fontSize: "11px",
                      }}
                      formatter={(value, name) => {
                        if (name === "codAmount") return [`${value} M FCFA`, "Fonds Collectés"];
                        if (name === "deliveries") return [`${value} courses`, "Total Livraisons"];
                        if (name === "fees") return [`${value} M FCFA`, "Frais Yolo"];
                        return [value, name];
                      }}
                    />
                    <Bar yAxisId="left" dataKey="deliveries" fill="#121317" radius={[4, 4, 0, 0]} name="deliveries" />
                    <Bar yAxisId="right" dataKey="codAmount" fill="#BC5F28" radius={[4, 4, 0, 0]} name="codAmount" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Graphique 2 : Répartition par Point de Retrait (Donut Chart) */}
            <Card className="lg:col-span-4 p-6 space-y-4">
              <div>
                <CardTitle className="text-sm font-bold text-foreground">
                  Répartition par Point de Retrait
                </CardTitle>
                <CardDescription className="text-xs">
                  Contribution de chaque boutique/atelier au volume global.
                </CardDescription>
              </div>

              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={PICKUP_SITE_DISTRIBUTION}
                      cx="50%"
                      cy="50%"
                      innerRadius={46}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {PICKUP_SITE_DISTRIBUTION.map((entry, index) => (
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
                {PICKUP_SITE_DISTRIBUTION.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <span className="size-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                      {item.name}
                    </span>
                    <span className="font-bold text-foreground">{item.value} %</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Tableau de Performance des Points de Retrait (Inspiré du tableau CFC) */}
          <Card className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <CardTitle className="text-sm font-bold text-foreground">
                  Performance & Efficacité Opérationnelle par Site
                </CardTitle>
                <CardDescription className="text-xs">
                  Analyse de la rapidité de préparation au comptoir, ponctualité livreur et trésorerie collectée.
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
                  {SITE_PERFORMANCE_METRICS.map((site, idx) => (
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
                        <Badge variant="success" className="font-bold">
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
              <div className="text-2xl font-bold text-foreground">3 min 48s</div>
              <p className="text-[11px] text-muted-foreground">Délai entre déclaration &quot;Colis prêts&quot; et acceptation coursier.</p>
            </Card>
            <Card className="p-4 space-y-2">
              <div className="text-xs text-muted-foreground font-medium">Rayon de recherche PostGIS</div>
              <div className="text-2xl font-bold text-foreground">4.2 km</div>
              <p className="text-[11px] text-muted-foreground">Élargissement automatique en cas d&apos;indisponibilité immédiate.</p>
            </Card>
            <Card className="p-4 space-y-2">
              <div className="text-xs text-muted-foreground font-medium">Courses actives en direct</div>
              <div className="text-2xl font-bold text-yolo-ink dark:text-yolo-lime">
                {deliveries.filter((d) => !["delivered", "cancelled"].includes(d.status)).length}
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
          </Card>
        </TabsContent>

        {/* Tab 3 : Finances & Rapprochement COD */}
        <TabsContent value="finances_tab" className="space-y-6 mt-0">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-4 space-y-1">
              <span className="text-xs text-muted-foreground font-medium">Total Collecté ce mois</span>
              <div className="text-2xl font-bold text-foreground">14 850 000 FCFA</div>
              <span className="text-xs text-emerald-600 font-medium">+21% vs Août</span>
            </Card>
            <Card className="p-4 space-y-1">
              <span className="text-xs text-muted-foreground font-medium">Frais de Transport Yolo</span>
              <div className="text-2xl font-bold text-foreground">1 850 000 FCFA</div>
              <span className="text-xs text-muted-foreground">Tarif moyen : 1 248 FCFA / course</span>
            </Card>
            <Card className="p-4 space-y-1">
              <span className="text-xs text-muted-foreground font-medium">Solde Net Reversé</span>
              <div className="text-2xl font-bold text-emerald-600 font-bold">13 000 000 FCFA</div>
              <span className="text-xs text-muted-foreground">Vers MTN MoMo (+237 677 00 11 22)</span>
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
                <Badge variant="success">99.8% instantané</Badge>
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
              <Badge variant="destructive" className="text-xs">
                1 incident en cours d&apos;arbitrage
              </Badge>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="size-4 text-destructive" />
                    <span className="font-bold text-xs text-foreground">Course #YLO-2026-09-8475 — Kotto</span>
                  </div>
                  <Badge variant="destructive">Client Injoignable</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Le livreur David Nganou est sur place depuis 20 min sans réponse aux appels.
                  Proposition de l&apos;exploitation : <strong>Mission de retour vers le Point Retrait Bonamoussadi</strong>.
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="yolo"
                    onClick={() => {
                      alert("Retour accepté. La marchandise reste sous la garde du livreur jusqu'à la remise à Bonamoussadi.");
                    }}
                    className="text-xs"
                  >
                    Valider le retour vers Bonamoussadi
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
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
