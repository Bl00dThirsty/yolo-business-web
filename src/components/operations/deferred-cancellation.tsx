import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
type Pending = {
  id: string;
  reference: string;
  requestId: string;
  deadline: number;
};
export function useDeferredCancellation(
  userId: string | undefined,
  onCommit: (pending: Pending) => Promise<void>,
) {
  const [pending, setPending] = useState<Pending | null>(null),
    [seconds, setSeconds] = useState(15),
    [phase, setPhase] = useState("waiting"),
    [error, setError] = useState("");
  const current = useRef<Pending | null>(null),
    sending = useRef(false),
    commit = useRef(onCommit);
  useEffect(() => {
    commit.current = onCommit;
  }, [onCommit]);
  const key = "yolo.cancel.v1." + userId,
    toastId = "delivery-cancellation-" + (pending?.requestId ?? "idle");
  const clear = useCallback(() => {
    current.current = null;
    setPending(null);
    try {
      sessionStorage.removeItem(key);
    } catch {}
    toast.dismiss(toastId);
  }, [key, toastId]);
  useEffect(() => {
    current.current = null;
    setPending(null);
    setPhase("waiting");
    try {
      const value = JSON.parse(sessionStorage.getItem(key) || "null");
      if (
        userId &&
        value &&
        typeof value.id === "string" &&
        typeof value.requestId === "string" &&
        Number.isFinite(value.deadline)
      ) {
        current.current = value;
        setPending(value);
        setSeconds(
          Math.max(0, Math.ceil((value.deadline - Date.now()) / 1000)),
        );
      }
    } catch {}
  }, [key, userId]);
  useEffect(
    () => () => {
      toast.dismiss(toastId);
    },
    [toastId],
  );
  const send = useCallback(async () => {
    const item = current.current;
    if (!item || sending.current) return;
    sending.current = true;
    setPhase("sending");
    setError("");
    try {
      if (!navigator.onLine)
        throw Error("Hors connexion. L’annulation n’est pas confirmée.");
      await commit.current(item);
      clear();
      toast("Livraison " + item.reference + " annulée", { duration: 5000 });
    } catch (e) {
      setPhase("error");
      setError(e instanceof Error ? e.message : "L’annulation n’a pas abouti.");
    } finally {
      sending.current = false;
    }
  }, [clear]);
  useEffect(() => {
    if (!pending || phase !== "waiting") return;
    const tick = () => {
      const left = Math.max(
        0,
        Math.ceil((pending.deadline - Date.now()) / 1000),
      );
      setSeconds(left);
      if (left === 0) void send();
    };
    tick();
    const timer = setInterval(tick, 200);
    return () => clearInterval(timer);
  }, [pending, phase, send]);
  useEffect(() => {
    if (!pending) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [pending]);
  useEffect(() => {
    if (!pending) return;
    toast.custom(
      () => (
        <div className="bw-cancel-toast">
          <div>
            <strong>
              {phase === "waiting"
                ? "Annulation dans " + seconds + " s"
                : phase === "sending"
                  ? "Annulation en cours…"
                  : "Annulation à vérifier"}
            </strong>
            <p>
              {pending.reference}
              {error
                ? " · " + error
                : " · La livraison reste dans l’historique."}
            </p>
          </div>
          {phase === "waiting" ? (
            <Button
              variant="outline"
              onClick={() => {
                if (sending.current) return;
                clear();
                toast("Annulation abandonnée", { duration: 3000 });
              }}
            >
              Annuler
            </Button>
          ) : phase === "error" ? (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => void send()}>
                Réessayer
              </Button>
              <Button variant="ghost" onClick={clear}>
                Fermer
              </Button>
            </div>
          ) : null}
          <div
            className="bw-cancel-progress"
            style={{ width: (seconds / 15) * 100 + "%" }}
          />
        </div>
      ),
      { id: toastId, duration: Infinity, dismissible: false },
    );
  }, [pending, seconds, phase, error, send, clear, toastId]);
  return {
    pendingId: pending?.id,
    schedule: (id: string, reference: string) => {
      if (current.current) return;
      const item = {
        id,
        reference,
        requestId: crypto.randomUUID(),
        deadline: Date.now() + 15000,
      };
      current.current = item;
      setPending(item);
      setSeconds(15);
      setPhase("waiting");
      setError("");
      try {
        sessionStorage.setItem(key, JSON.stringify(item));
      } catch {}
    },
  };
}
