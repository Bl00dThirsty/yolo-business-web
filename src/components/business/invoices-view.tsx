import { useEffect, useRef, useState } from "react";
import { Plus, Printer, Save, Trash2, ArrowLeft } from "lucide-react";
import whatsapp from "@/assets/whatsapp.png";
import {
  BusinessFailure,
  businessRequest,
  invoiceTotal,
  invoiceMessage,
  money,
} from "./business-api";
import type { Invoice, InvoiceContent } from "./business-api";
const blank = (name: string, address: string): InvoiceContent => ({
  issuer: name,
  issuer_address: address,
  tax_id: "",
  customer: "",
  customer_address: "",
  customer_phone: "",
  date: new Date().toLocaleDateString("en-CA"),
  notes: "",
  lines: [{ id: crypto.randomUUID(), label: "", quantity: 1, unit_price: 0 }],
});
export function InvoicesView({
  locationId,
  userId,
  name,
  address,
}: {
  locationId: string;
  userId: string;
  name: string;
  address: string;
}) {
  const storageKey = `yolo.invoice.pending:${userId}:${locationId}`;
  const [pending] = useState<{ requestId: string; content: InvoiceContent } | null>(() => {
    try {
      const value = JSON.parse(sessionStorage.getItem(storageKey) || 'null');
      return value && typeof value.requestId === 'string' && value.content && Array.isArray(value.content.lines) ? value : null;
    } catch { return null; }
  });
  const [items, setItems] = useState<Invoice[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [editing, setEditing] = useState(Boolean(pending)),
    [saved, setSaved] = useState<Invoice | null>(null),
    [draft, setDraft] = useState(() => pending?.content || blank(name, address)),
    [busy, setBusy] = useState(false);
  const requestId = useRef(pending?.requestId || crypto.randomUUID());
  const lock = useRef(false);
  const [retry, setRetry] = useState(Boolean(pending));
  useEffect(() => {
    let active = true;
    businessRequest<Invoice[]>(locationId, "invoices")
      .then((data) => {
        if (active) setItems(data);
      })
      .catch((e) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [locationId]);
  const document = saved?.content || draft;
  const total = saved?.total ?? invoiceTotal(draft.lines);
  function update<K extends keyof InvoiceContent>(
    key: K,
    value: InvoiceContent[K],
  ) {
    setDraft((old) => ({ ...old, [key]: value }));
  }
  function start() {
    setSaved(null);
    setDraft(blank(name, address));
    requestId.current = crypto.randomUUID();
    setRetry(false);
    setEditing(true);
    setError("");
  }
  async function save() {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      if (
        !draft.issuer.trim() ||
        !draft.customer.trim() ||
        draft.lines.some(
          (l) =>
            !l.label.trim() ||
            !Number.isInteger(l.quantity) ||
            l.quantity < 1 ||
            !Number.isInteger(l.unit_price) ||
            l.unit_price < 0,
        )
      )
        throw Error(
          "Complétez le client et toutes les lignes avec des quantités et prix valides.",
        );
      const phone = draft.customer_phone.replace(/[^0-9]/g, '');
      if (phone && !/^[1-9][0-9]{7,14}$/.test(phone)) throw Error('Indiquez le numéro WhatsApp au format international, par exemple +237…');
      // Persist before submitting: retries after a reload use the same idempotency key.
      sessionStorage.setItem(storageKey, JSON.stringify({ requestId: requestId.current, content: draft }));
      setRetry(true);
      const result = await businessRequest<Invoice>(
        locationId,
        "invoice_create",
        { request_id: requestId.current, content: draft },
      );
      sessionStorage.removeItem(storageKey);
      setSaved(result);
      setRetry(false);
      setItems((old) => [result, ...old.filter((i) => i.id !== result.id)]);
    } catch (e) {
      if (e instanceof BusinessFailure && e.code && e.code !== "57014") {
        sessionStorage.removeItem(storageKey);
        setRetry(false);
      }
      setError(e instanceof Error ? e.message : "Enregistrement impossible.");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  function share() {
    if (!saved) return;
    const phone = saved.content.customer_phone.replace(/[^0-9]/g, "");
    if (phone && !/^[1-9][0-9]{7,14}$/.test(phone)) {
      setError(
        "Indiquez un numéro international, par exemple +237… avant d’émettre la facture.",
      );
      return;
    }
    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(invoiceMessage(saved))}`,
      "_blank",
      "noopener,noreferrer",
    );
  }
  return (
    <section className="bw-invoices">
      <div className="bw-page-heading">
        <div>
          <span className="bw-kicker">VOTRE ACTIVITÉ</span>
          <h1>Factures clients</h1>
          <p>Préparez vos factures et partagez-les avec vos clients.</p>
        </div>
        <button className="bw-primary" onClick={start} disabled={busy || retry}>
          <Plus size={17} />
          Créer une facture
        </button>
      </div>
      {error && (
        <p className="bw-alert" role="alert">
          {error}
        </p>
      )}
      {!editing ? (
        <>
          <div className="bw-table-card">
            {loading ? (
              <p role="status">Chargement des factures…</p>
            ) : items.length === 0 ? (
              <div className="bw-empty">
                <h2>Votre première facture commence ici.</h2>
                <p>
                  Ajoutez les articles vendus et les frais de livraison, puis
                  vérifiez l’aperçu.
                </p>
                <button onClick={start} className="bw-primary">
                  Créer une facture
                </button>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Facture</th>
                    <th>Client</th>
                    <th>Date</th>
                    <th>Montant</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {items.map((i) => (
                    <tr key={i.id}>
                      <td>{i.number}</td>
                      <td>{i.content.customer}</td>
                      <td>{i.issued_on}</td>
                      <td>{money(i.total)}</td>
                      <td>
                        <button
                          onClick={() => {
                            setSaved(i);
                            setEditing(true);
                          }}
                        >
                          Ouvrir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {items.length === 200 && (
            <p className="bw-hint">
              Les 200 dernières factures sont affichées.
            </p>
          )}
        </>
      ) : (
        <>
          <button
            className="bw-back"
            disabled={busy || retry}
            onClick={() => setEditing(false)}
          >
            <ArrowLeft size={16} />
            Toutes les factures
          </button>
          <div className="bw-invoice-layout">
            <div className="bw-invoice-editor">
              {saved ? (
                <div className="bw-card">
                  <span className="bw-badge">Enregistrée</span>
                  <h2>{saved.number}</h2>
                  <p>
                    Cette facture est enregistrée. Vous pouvez l’imprimer ou
                    partager son récapitulatif.
                  </p>
                  <div className="bw-stack">
                    <button
                      className="bw-primary"
                      onClick={() => window.print()}
                    >
                      <Printer size={17} />
                      Imprimer / Enregistrer en PDF
                    </button>
                    <button className="bw-outline" onClick={share}>
                      <img src={whatsapp} alt="" width={20} height={20} />
                      Partager sur WhatsApp
                    </button>
                  </div>
                  <p className="bw-hint">
                    WhatsApp ouvre le récapitulatif texte. Pour envoyer le PDF,
                    enregistrez-le avec le bouton d’impression, puis joignez-le
                    au message.
                  </p>
                </div>
              ) : (
                <form
                  className="bw-card bw-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void save();
                  }}
                >
                  <h2>Informations de la facture</h2>
                  <fieldset disabled={busy || retry}>
                    <label>
                      Votre entreprise
                      <input
                        required
                        maxLength={160}
                        value={draft.issuer}
                        onChange={(e) => update("issuer", e.target.value)}
                      />
                    </label>
                    <label>
                      Adresse de l’entreprise
                      <textarea
                        maxLength={500}
                        value={draft.issuer_address}
                        onChange={(e) =>
                          update("issuer_address", e.target.value)
                        }
                      />
                    </label>
                    <label>
                      Identifiant fiscal (facultatif)
                      <input
                        maxLength={100}
                        value={draft.tax_id}
                        onChange={(e) => update("tax_id", e.target.value)}
                      />
                    </label>
                    <div className="bw-form-row">
                      <label>
                        Client
                        <input
                          required
                          maxLength={160}
                          value={draft.customer}
                          onChange={(e) => update("customer", e.target.value)}
                        />
                      </label>
                      <label>
                        Date
                        <input
                          type="date"
                          required
                          value={draft.date}
                          onChange={(e) => update("date", e.target.value)}
                        />
                      </label>
                    </div>
                    <label>
                      Adresse du client
                      <textarea
                        maxLength={500}
                        value={draft.customer_address}
                        onChange={(e) =>
                          update("customer_address", e.target.value)
                        }
                      />
                    </label>
                    <label>
                      WhatsApp du client (facultatif)
                      <input
                        type="tel"
                        placeholder="+237…"
                        pattern="\+?[1-9][0-9 ]{7,20}"
                        value={draft.customer_phone}
                        onChange={(e) =>
                          update("customer_phone", e.target.value)
                        }
                      />
                    </label>
                    <h3>Articles et livraison</h3>
                    {draft.lines.map((line, index) => (
                      <div className="bw-line-editor" key={line.id || index}>
                        <label className="bw-line-name">
                          Désignation
                          <input
                            aria-label={`Désignation ${index + 1}`}
                            required
                            maxLength={200}
                            value={line.label}
                            onChange={(e) =>
                              update(
                                "lines",
                                draft.lines.map((l, i) =>
                                  i === index
                                    ? { ...l, label: e.target.value }
                                    : l,
                                ),
                              )
                            }
                          />
                        </label>
                        <label>
                          Quantité
                          <input
                            aria-label={`Quantité ${index + 1}`}
                            type="number"
                            min={1}
                            max={100000}
                            step={1}
                            required
                            value={line.quantity}
                            onChange={(e) =>
                              update(
                                "lines",
                                draft.lines.map((l, i) =>
                                  i === index
                                    ? { ...l, quantity: Number(e.target.value) }
                                    : l,
                                ),
                              )
                            }
                          />
                        </label>
                        <label>
                          Prix unitaire
                          <input
                            aria-label={`Prix ${index + 1}`}
                            type="number"
                            min={0}
                            max={1000000000}
                            step={1}
                            required
                            value={line.unit_price}
                            onChange={(e) =>
                              update(
                                "lines",
                                draft.lines.map((l, i) =>
                                  i === index
                                    ? {
                                        ...l,
                                        unit_price: Number(e.target.value),
                                      }
                                    : l,
                                ),
                              )
                            }
                          />
                        </label>
                        <button
                          type="button"
                          aria-label={`Supprimer la ligne ${index + 1}`}
                          disabled={draft.lines.length === 1}
                          onClick={() =>
                            update(
                              "lines",
                              draft.lines.filter((_, i) => i !== index),
                            )
                          }
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="bw-outline"
                      disabled={draft.lines.length >= 50}
                      onClick={() =>
                        update("lines", [
                          ...draft.lines,
                          {
                            id: crypto.randomUUID(),
                            label: "",
                            quantity: 1,
                            unit_price: 0,
                          },
                        ])
                      }
                    >
                      <Plus size={16} />
                      Ajouter une ligne
                    </button>
                    <button
                      type="button"
                      className="bw-text-button"
                      disabled={draft.lines.length >= 50}
                      onClick={() =>
                        update("lines", [
                          ...draft.lines,
                          {
                            id: crypto.randomUUID(),
                            label: "Frais de livraison",
                            quantity: 1,
                            unit_price: 0,
                          },
                        ])
                      }
                    >
                      Ajouter les frais de livraison
                    </button>
                    <label>
                      Conditions / note
                      <textarea
                        maxLength={2000}
                        placeholder="Conditions de règlement, renseignements utiles…"
                        value={draft.notes}
                        onChange={(e) => update("notes", e.target.value)}
                      />
                    </label>
                  </fieldset>
                  <p className="bw-hint">
                    Montants en FCFA. Aucune taxe n’est ajoutée automatiquement.
                    Vérifiez les informations avant émission ; une facture émise
                    n’est plus modifiable.
                  </p>
                  <button className="bw-primary" disabled={busy} type="submit">
                    <Save size={17} />
                    {busy
                      ? "Enregistrement…"
                      : retry
                        ? "Vérifier l’enregistrement"
                        : "Émettre et enregistrer"}
                  </button>
                  {retry && !busy && (
                    <p role="status" className="bw-hint">
                      La demande est conservée à l’identique pour éviter un
                      doublon. Relancez la vérification avant de modifier les
                      données.
                    </p>
                  )}
                </form>
              )}
            </div>
            <div className="bw-preview-wrap">
              <p className="bw-kicker">
                {saved ? "VOTRE FACTURE" : "APERÇU AVANT ÉMISSION"}
              </p>
              <article className="bw-invoice-paper" id="invoice-print">
                <header>
                  <div>
                    <h2>{document.issuer || "Votre entreprise"}</h2>
                    <p>{document.issuer_address}</p>
                    {document.tax_id && (
                      <p>Identifiant fiscal : {document.tax_id}</p>
                    )}
                  </div>
                  <div>
                    <h1>FACTURE</h1>
                    <strong>{saved?.number || "Brouillon"}</strong>
                    <p>Date : {document.date}</p>
                  </div>
                </header>
                <section>
                  <span>FACTURÉ À</span>
                  <h3>{document.customer || "Nom du client"}</h3>
                  <p>{document.customer_address}</p>
                  <p>{document.customer_phone}</p>
                </section>
                <table>
                  <thead>
                    <tr>
                      <th>Désignation</th>
                      <th>Qté</th>
                      <th>Prix unitaire</th>
                      <th>Montant</th>
                    </tr>
                  </thead>
                  <tbody>
                    {document.lines.map((line, i) => (
                      <tr key={i}>
                        <td>{line.label || "Article"}</td>
                        <td>{line.quantity}</td>
                        <td>{money(line.unit_price)}</td>
                        <td>{money(line.unit_price * line.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="bw-invoice-total">
                  <span>Total à régler</span>
                  <strong>{money(total)}</strong>
                </div>
                {document.notes && (
                  <section>
                    <span>INFORMATIONS</span>
                    <p>{document.notes}</p>
                  </section>
                )}
                <footer>Merci pour votre confiance.</footer>
              </article>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
