import { useId, useRef, useState } from "react";
import { Pencil, Check, X } from "lucide-react";
import { Input } from "./input";
export function InlineEdit({
  label,
  value,
  onSave,
  disabled = false,
  maxLength = 80,
}: {
  label: string;
  value: string;
  onSave: (value: string) => Promise<void>;
  disabled?: boolean;
  maxLength?: number;
}) {
  const [editing, setEditing] = useState(false),
    [draft, setDraft] = useState(value),
    [optimistic, setOptimistic] = useState<string | null>(null),
    [error, setError] = useState(""),
    [saved, setSaved] = useState(false);
  const lock = useRef(false),
    cancelled = useRef(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const id = useId();
  function cancel() {
    cancelled.current = true;
    setEditing(false);
    setError("");
    requestAnimationFrame(() => trigger.current?.focus());
  }
  async function save() {
    if (lock.current || cancelled.current) return;
    const next = draft.trim();
    if (next === value) {
      setEditing(false);
      return;
    }
    if (!next) {
      setError("Ce champ ne peut pas être vide.");
      return;
    }
    if (!navigator.onLine) {
      setError(
        "Hors connexion. Votre modification est conservée ; réessayez après reconnexion.",
      );
      return;
    }
    lock.current = true;
    setOptimistic(next);
    setEditing(false);
    setError("");
    setSaved(false);
    try {
      await onSave(next);
      setSaved(true);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Impossible d’enregistrer. Réessayez.",
      );
      setEditing(true);
    } finally {
      setOptimistic(null);
      lock.current = false;
    }
  }
  return (
    <div className="bw-inline-field">
      <span id={id + "-label"} className="bw-inline-label">
        {label}
      </span>
      {editing ? (
        <div className="bw-inline-controls">
          <Input
            autoFocus
            aria-labelledby={id + "-label"}
            aria-describedby={id + "-feedback"}
            aria-invalid={!!error}
            value={draft}
            maxLength={maxLength}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={(e) => {
              if (
                !e.currentTarget.parentElement?.contains(
                  e.relatedTarget as Node,
                )
              )
                void save();
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.preventDefault();
                cancel();
              }
              if (e.key === "Enter") {
                e.preventDefault();
                void save();
              }
            }}
          />
          <button
            type="button"
            aria-label={"Enregistrer : " + label}
            onClick={() => void save()}
          >
            <Check size={16} />
          </button>
          <button
            type="button"
            aria-label={"Annuler : " + label}
            onClick={cancel}
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <button
          ref={trigger}
          className="bw-ghost-value"
          type="button"
          disabled={disabled || optimistic !== null}
          aria-label={"Modifier : " + label}
          onClick={() => {
            cancelled.current = false;
            setDraft(value);
            setSaved(false);
            setEditing(true);
          }}
        >
          <span>{optimistic ?? (value || "Ajouter")}</span>
          <Pencil size={13} />
        </button>
      )}
      <span
        id={id + "-feedback"}
        className={error ? "bw-inline-error" : "bw-inline-feedback"}
        role={error ? "alert" : "status"}
      >
        {error ||
          (optimistic !== null
            ? "Enregistrement…"
            : saved
              ? "Enregistré"
              : editing
                ? "Entrée pour enregistrer · Échap pour annuler"
                : "")}
      </span>
    </div>
  );
}
