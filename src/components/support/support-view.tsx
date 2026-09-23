import React from "react";
import {
  HelpCircle,
  Phone,
  MessageSquare,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ExternalLink,
  Plus,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MOCK_SUPPORT_TICKETS } from "@/lib/mock-data";

export function SupportView() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Assistance & Support Exploitation (C06)
          </h1>
          <p className="text-xs text-muted-foreground">
            Contactez la supervision logistique Yolo pour les litiges, retards au retrait, colis endommagés ou réémissions de codes.
          </p>
        </div>

        <Button
          onClick={() => alert("Formulaire d'ouverture de ticket ouvert")}
          className="bg-yolo-ink text-yolo-lime hover:bg-yolo-ink/90 border border-yolo-lime/40 font-semibold gap-2 self-start sm:self-auto text-xs"
        >
          <Plus className="size-4" />
          Ouvrir un ticket
        </Button>
      </div>

      {/* Emergency Hotline Banner */}
      <div className="p-4 bg-yolo-lime/20 border border-yolo-lime rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-lg bg-yolo-ink text-yolo-lime flex items-center justify-center font-bold">
            <Phone className="size-5" />
          </div>
          <div>
            <div className="font-bold text-sm text-yolo-ink">Ligne Directe Dispatch & Urgences Comptoir</div>
            <div className="text-xs text-yolo-ink/80 font-mono">
              Douala : +237 699 00 11 22 • Yaoundé : +237 677 00 33 44 (7j/7, 07h - 22h)
            </div>
          </div>
        </div>
        <Button
          size="sm"
          onClick={() => window.open("https://wa.me/237699001122", "_blank")}
          className="bg-yolo-ink text-yolo-lime hover:bg-yolo-ink/90 text-xs font-semibold"
        >
          WhatsApp Support
        </Button>
      </div>

      {/* Tickets List */}
      <Card className="p-5 space-y-4 shadow-xs border">
        <CardTitle className="text-sm font-bold">Vos Demandes & Litiges Récents</CardTitle>

        <div className="space-y-3">
          {MOCK_SUPPORT_TICKETS.map((tck) => (
            <div
              key={tck.id}
              className="p-3.5 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant={tck.priority === "urgent" ? "destructive" : "secondary"} className="text-[10px]">
                    {tck.priority}
                  </Badge>
                  <span className="font-bold text-xs text-foreground">{tck.subject}</span>
                </div>
                <Badge variant={tck.status === "resolved" ? "success" : "warning"} className="text-[10px]">
                  {tck.status === "resolved" ? "Résolu" : "En cours"}
                </Badge>
              </div>

              <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                <span>Créé le {tck.createdAt} • Dernier message {tck.updatedAt}</span>
                <span className="flex items-center gap-1 font-medium">
                  <MessageSquare className="size-3" />
                  {tck.messagesCount} réponses
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
