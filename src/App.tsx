import { lazy, Suspense } from "react";
const OperationsApp = lazy(
  () => import("@/components/operations/operations-app"),
);
const MarketingApp = lazy(() => import("./components/marketing/marketing-app"));
export default function App() {
  const path = window.location.pathname;
  return (
    <Suspense
      fallback={
        <div
          className="app-loading"
          role="progressbar"
          aria-label="Chargement"
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <span />
        </div>
      }
    >
      {path.startsWith("/demo") ||
      path === "/invitation" ||
      path === "/connexion" ||
      path === "/app" ||
      path.startsWith("/suivi") ? (
        <OperationsApp />
      ) : (
        <MarketingApp />
      )}
    </Suspense>
  );
}
