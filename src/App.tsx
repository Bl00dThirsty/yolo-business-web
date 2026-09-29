import { lazy, Suspense } from "react";
const OperationsApp = lazy(
  () => import("@/components/operations/operations-app"),
);
const DemoApp = lazy(() => import("./DemoApp"));
const MarketingApp = lazy(() => import("./components/marketing/marketing-app"));
export default function App() {
  const path = window.location.pathname;
  return (
    <Suspense fallback={<p className="p-8">Chargement de votre espace…</p>}>
      {path.startsWith("/demo") ? (
        <DemoApp />
      ) : path === "/connexion" ||
        path === "/app" ||
        path.startsWith("/suivi") ? (
        <OperationsApp />
      ) : (
        <MarketingApp />
      )}
    </Suspense>
  );
}
