import { AuthProvider } from "@/context/auth-context";
import { StoreProvider } from "@/context/store-context";
import { DeliveryProvider, useDeliveries } from "@/context/delivery-context";
import { AppShell } from "@/components/layout/app-shell";
import { AnalyticsDashboard } from "@/components/dashboard/analytics-dashboard";
import { DeliveryListView } from "@/components/deliveries/delivery-list-view";
import { DeliveryWizard } from "@/components/deliveries/delivery-wizard";
import { DeliveryDetailView } from "@/components/deliveries/delivery-detail-view";
import { PickupHandoverModal } from "@/components/deliveries/pickup-handover-modal";
import { FinancesView } from "@/components/finances/finances-view";
import { PickupSitesView } from "@/components/sites/pickup-sites-view";
import { TeamView } from "@/components/team/team-view";
import { SettingsView } from "@/components/settings/settings-view";
import { SupportView } from "@/components/support/support-view";
import { PublicTrackingView } from "@/components/tracking/public-tracking-view";

function MainContent() {
  const { activeView } = useDeliveries();

  switch (activeView) {
    case "dashboard":
      return <AnalyticsDashboard />;
    case "deliveries":
      return <DeliveryListView />;
    case "create_delivery":
      return <DeliveryWizard />;
    case "delivery_detail":
      return <DeliveryDetailView />;
    case "finances":
      return <FinancesView />;
    case "pickup_sites":
      return <PickupSitesView />;
    case "team":
      return <TeamView />;
    case "settings":
      return <SettingsView />;
    case "support":
      return <SupportView />;
    case "tracking_preview":
      return <PublicTrackingView />;
    default:
      return <AnalyticsDashboard />;
  }
}

function DemoApp() {
  return (
    <AuthProvider>
      <StoreProvider>
        <DeliveryProvider>
          <AppShell>
            <div role="status" className="border rounded-lg p-3 mb-4 text-xs bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span>
                <strong>Espace de Test Nettoyé</strong> — Données fictives supprimées. Les livraisons créées sont enregistrées localement dans votre navigateur.
              </span>
              <a href="/" className="text-xs font-semibold underline text-primary shrink-0">
                Ouvrir l’espace connecté Supabase (Mobile live) →
              </a>
            </div>
            <MainContent />
            {/* L04 Pickup Handover Modal */}
            <PickupHandoverModal />
          </AppShell>
        </DeliveryProvider>
      </StoreProvider>
    </AuthProvider>
  );
}

export default DemoApp;
