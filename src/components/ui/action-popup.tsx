import { useId, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./dialog";
import { Button } from "./button";

interface Action {
  title: string;
  description: string;
  confirm: string;
  destructive?: boolean;
  inputLabel?: string;
  minLength?: number;
  onConfirm: (value: string) => Promise<void> | void;
}
export function useActionPopup() {
  const [action, setAction] = useState<Action | null>(null);
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const lock = useRef(false),
    origin = useRef<HTMLElement | null>(null);
  const id = useId();
  function openAction(next: Action) {
    if (lock.current) return;
    origin.current =
      document.querySelector<HTMLElement>(
        'button[aria-haspopup="menu"][data-state="open"]',
      ) ??
      (document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null);
    setValue("");
    setError("");
    setAction(next);
  }
  const popup = (
    <Dialog
      open={!!action}
      onOpenChange={(open) => {
        if (!open && !lock.current) setAction(null);
      }}
    >
      <DialogContent
        closeDisabled={pending}
        className="w-[calc(100%-2rem)] max-h-[90dvh] overflow-y-auto motion-reduce:animate-none"
        onPointerDownOutside={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          if (origin.current?.isConnected) origin.current.focus();
        }}
      >
        <DialogHeader>
          <DialogTitle>{action?.title}</DialogTitle>
          <DialogDescription>{action?.description}</DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-5"
          aria-busy={pending}
          onSubmit={async (e) => {
            e.preventDefault();
            if (!action || lock.current) return;
            if (
              action.inputLabel &&
              value.trim().length < (action.minLength ?? 1)
            ) {
              setError(
                "Précisez le motif avec au moins " +
                  (action.minLength ?? 1) +
                  " caractères.",
              );
              return;
            }
            if (!navigator.onLine) {
              setError(
                "Vous êtes hors connexion. Reconnectez-vous puis réessayez.",
              );
              return;
            }
            lock.current = true;
            setPending(true);
            setError("");
            try {
              await action.onConfirm(value.trim());
              setAction(null);
            } catch (err) {
              setError(
                err instanceof Error
                  ? err.message
                  : "L’action n’a pas abouti. Veuillez réessayer.",
              );
            } finally {
              lock.current = false;
              setPending(false);
            }
          }}
        >
          {action?.inputLabel && (
            <div className="flex flex-col gap-2">
              <label htmlFor={id}>{action.inputLabel}</label>
              <textarea
                className="min-h-24 rounded-md border border-input bg-background p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                id={id}
                required
                maxLength={1000}
                value={value}
                disabled={pending}
                onChange={(e) => setValue(e.target.value)}
                aria-invalid={!!error}
                aria-describedby={error ? id + "-error" : undefined}
              />
            </div>
          )}
          {error && (
            <p id={id + "-error"} role="alert" className="text-destructive">
              {error}
            </p>
          )}
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => setAction(null)}
            >
              Revenir
            </Button>
            <Button
              type="submit"
              variant={action?.destructive ? "destructive" : "default"}
              disabled={pending}
            >
              {pending ? "En cours…" : action?.confirm}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
  return { openAction, popup };
}
