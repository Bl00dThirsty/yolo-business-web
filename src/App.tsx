import { lazy, Suspense } from "react";
const OperationsApp = lazy(
  () => import("@/components/operations/operations-app"),
);
const DemoApp = lazy(() => import("./DemoApp"));
export default function App() {
  return (
    <Suspense fallback={<p className="p-8">Chargement de votre espace…</p>}>
      {window.location.pathname.startsWith("/demo") ? (
        <DemoApp />
      ) : (
        <OperationsApp />
      )}
    </Suspense>
  );
}
