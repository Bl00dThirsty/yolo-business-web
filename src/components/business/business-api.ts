import { supabase } from "@/lib/supabase";
export class BusinessFailure extends Error {
  constructor(
    message: string,
    readonly code: string,
  ) {
    super(message);
  }
}
export async function businessRequest<T>(
  locationId: string,
  action: string,
  payload: Record<string, unknown> = {},
): Promise<T> {
  if (!supabase) throw Error("Connexion indisponible.");
  const { data, error } = await supabase.rpc("business_workspace", {
    p_location_id: locationId,
    p_action: action,
    p_payload: payload,
  });
  if (error)
    throw new BusinessFailure(
      error.code === "PGRST202"
        ? "Ce service doit être activé par l’équipe Yolo."
        : error.message,
      error.code,
    );
  return data as T;
}
export const money = (amount: number) =>
  new Intl.NumberFormat("fr-CM", { maximumFractionDigits: 0 }).format(amount) +
  " FCFA";
export interface InvoiceLine {
  id?: string;
  label: string;
  quantity: number;
  unit_price: number;
}
export interface InvoiceContent {
  issuer: string;
  issuer_address: string;
  tax_id: string;
  customer: string;
  customer_address: string;
  customer_phone: string;
  date: string;
  notes: string;
  lines: InvoiceLine[];
}
export interface Invoice {
  id: string;
  number: string;
  issued_on: string;
  content: InvoiceContent;
  total: number;
  created_at: string;
}
export function invoiceTotal(lines: InvoiceLine[]) {
  return lines.reduce(
    (total, line) => total + line.quantity * line.unit_price,
    0,
  );
}
export function invoiceMessage(invoice: Invoice) {
  const c = invoice.content;
  return [
    `Bonjour ${c.customer},`,
    `Voici votre facture ${invoice.number} du ${c.date}.`,
    `Émetteur : ${c.issuer}`,
    "",
    ...c.lines.map(
      (l) =>
        `${l.label} : ${l.quantity} × ${money(l.unit_price)} = ${money(l.quantity * l.unit_price)}`,
    ),
    "",
    `Total : ${money(invoice.total)}`,
    c.notes,
  ]
    .filter(Boolean)
    .join("\n");
}
