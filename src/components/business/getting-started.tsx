import { useState } from "react";
import { Check, ArrowRight, X } from "lucide-react";
export function GettingStarted({
  userId,
  request,
  active,
  hasDeliveries,
  locked,
  onNavigate,
  onCreate,
}: {
  userId: string;
  request: number;
  active: boolean;
  hasDeliveries: boolean;
  locked: boolean;
  onNavigate: (view: string) => void;
  onCreate: () => void;
}) {
  const key = "yolo.onboarding.v1." + userId;
  const [hidden, setHidden] = useState(() => {
    try {
      return localStorage.getItem(key) === "dismissed";
    } catch {
      return false;
    }
  });
  const [dismissedRequest, setDismissedRequest] = useState(0);
  if (hidden && request === dismissedRequest) return null;
  function dismiss() {
    setHidden(true);
    setDismissedRequest(request);
    try {
      localStorage.setItem(key, "dismissed");
    } catch {
      /* Browsing without storage remains supported. */
    }
  }
  return (
    <section className="bw-onboarding" aria-label="Vos premiers pas">
      <div className="bw-onboarding-heading">
        <div>
          <span className="bw-kicker">BIEN DÉMARRER</span>
          <h2>Votre prochaine livraison commence ici.</h2>
          <p>
            Quelques repères pour prendre votre espace en main, à votre rythme.
          </p>
        </div>
        <button
          onClick={dismiss}
          className="bw-guide-dismiss"
          aria-label="Masquer le guide de démarrage"
        >
          <X size={17} />
        </button>
      </div>
      <ol className="bw-guide-steps">
        <li>
          <span className={active ? "is-done" : ""}>
            {active ? <Check size={15} /> : "01"}
          </span>
          <div>
            <h3>Vérifiez votre point de retrait</h3>
            <p>
              {active
                ? "Votre point est actif. Vérifiez l’adresse de départ."
                : "Confirmez la position où le livreur récupérera vos colis."}
            </p>
            <button onClick={() => onNavigate("sites")}>
              Voir mes points <ArrowRight size={14} />
            </button>
          </div>
        </li>
        <li>
          <span className={hasDeliveries ? "is-done" : ""}>
            {hasDeliveries ? <Check size={15} /> : "02"}
          </span>
          <div>
            <h3>Préparez votre livraison</h3>
            <p>
              Prévoyez le numéro du destinataire, son adresse et les détails du
              colis.
            </p>
            <button disabled={!active || locked} onClick={onCreate}>
              Créer une livraison <ArrowRight size={14} />
            </button>
            {!active && <small>Un point actif est nécessaire.</small>}
          </div>
        </li>
        <li>
          <span>03</span>
          <div>
            <h3>Suivez chaque remise</h3>
            <p>
              Marquez le colis prêt, vérifiez le livreur puis confirmez la
              remise physique. Le code destinataire confirme la réception.
            </p>
            <button onClick={() => onNavigate("deliveries")}>
              Voir les livraisons <ArrowRight size={14} />
            </button>
          </div>
        </li>
      </ol>
      <div className="bw-guide-footer">
        <span>
          Yolo facture le transport. Le paiement des produits reste entre vous
          et votre client.
        </span>
        <button onClick={dismiss}>J’ai compris</button>
      </div>
    </section>
  );
}
