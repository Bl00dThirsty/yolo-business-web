import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
export function AcceptInvitation({ onAccepted }: { onAccepted: () => void }) {
  const [token] = useState(
    () =>
      new URLSearchParams(window.location.hash.slice(1)).get("token") ||
      sessionStorage.getItem("yolo.business.invitation") ||
      "",
  );
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    if (token) {
      sessionStorage.setItem("yolo.business.invitation", token);
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, [token]);
  return (
    <section className="bw-card bw-accept">
      <h1>Rejoindre votre équipe</h1>
      <p>
        Cette invitation donne accès aux livraisons et factures du point de
        retrait concerné.
      </p>
      {error && (
        <p role="alert" className="bw-alert">
          {error}
        </p>
      )}
      <button
        className="bw-primary"
        disabled={busy || !token}
        onClick={async () => {
          setBusy(true);
          setError("");
          try {
            const { error } = await supabase!.rpc(
              "business_accept_invitation",
              { p_token: token },
            );
            if (error) throw error;
            sessionStorage.removeItem("yolo.business.invitation");
            onAccepted();
          } catch (e) {
            setError(
              e instanceof Error
                ? e.message
                : (e as { message?: string }).message ||
                    "Invitation indisponible.",
            );
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? "Validation…" : "Accepter l’invitation"}
      </button>
      {!token && (
        <p>Ouvrez le lien reçu de votre responsable pour continuer.</p>
      )}
    </section>
  );
}
