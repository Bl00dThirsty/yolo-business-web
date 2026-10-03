import { useEffect, useRef, useState } from "react";
import { UserPlus, Copy, Trash2 } from "lucide-react";
import { businessRequest } from "./business-api";
interface Team {
  can_manage: boolean;
  is_admin: boolean;
  members: { id: string; email: string; manager: boolean }[];
  invitations: {
    id: string;
    email: string;
    expires_at: string;
    accepted_at: string | null;
    revoked_at: string | null;
  }[];
}
export function BusinessTeam({
  locationId,
  userId,
}: {
  locationId: string;
  userId: string;
}) {
  const [team, setTeam] = useState<Team | null>(null),
    [email, setEmail] = useState(""),
    [link, setLink] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const lock = useRef(false);
  useEffect(() => {
    let active = true;
    businessRequest<Team>(locationId, "team")
      .then((t) => {
        if (active) setTeam(t);
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [locationId]);
  async function act(action: string, payload: Record<string, unknown>) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const result = await businessRequest<{ token?: string }>(
        locationId,
        action,
        payload,
      );
      if (result.token) {
        setLink(`${window.location.origin}/invitation#token=${result.token}`);
        setNotice(
          "Invitation créée pour cette adresse. Copiez le lien et transmettez-le au collaborateur.",
        );
        setEmail("");
      }
      if (!result.token) setNotice(action === "invite_revoke" ? "L’invitation a été révoquée." : action === "member_remove" ? "L’accès du collaborateur a été retiré." : "Le rôle du collaborateur a été mis à jour.");
      try { setTeam(await businessRequest<Team>(locationId, "team")); }
      catch { setError("La modification est enregistrée, mais la liste n’a pas pu être actualisée. Rouvrez cette page pour la vérifier."); }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Veuillez réessayer.");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <section aria-busy={busy}>
      <div className="bw-page-heading">
        <div>
          <span className="bw-kicker">TRAVAILLER ENSEMBLE</span>
          <h1>Votre équipe</h1>
          <p>Les accès sont limités au point de retrait sélectionné.</p>
        </div>
      </div>
      {error && (
        <p role="alert" className="bw-alert">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="bw-notice">
          {notice}
        </p>
      )}
      {!team && !error && <p role="status">Chargement de l’équipe…</p>}
      {team && (
        <>
          {team.can_manage ? (
            <form
              className="bw-card bw-invite-form"
              onSubmit={(e) => {
                e.preventDefault();
                void act("invite", { email });
              }}
            >
              <label>
                E-mail du collaborateur
                <input
                  type="email"
                  required
                  maxLength={254}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="prenom@entreprise.com"
                />
              </label>
              <button className="bw-primary" disabled={busy}>
                <UserPlus size={17} />
                Inviter un collaborateur
              </button>
              <p className="bw-hint">
                Accès aux livraisons de ce point. L’invitation
                expire après 7 jours et doit être acceptée avec cette adresse
                e-mail vérifiée. Elle n’est pas envoyée automatiquement.
              </p>
            </form>
          ) : (
            <p className="bw-hint">
              Les invitations sont gérées par un responsable du point de retrait
              ou un administrateur Yolo.
            </p>
          )}
          {link && (
            <div className="bw-card bw-invitation-link">
              <label>
                Lien d’invitation
                <input
                  readOnly
                  value={link}
                  onFocus={(e) => e.currentTarget.select()}
                />
              </label>
              <button
                className="bw-outline"
                onClick={() =>
                  void navigator.clipboard
                    .writeText(link)
                    .then(() => setNotice("Lien copié."))
                    .catch(() =>
                      setNotice("Sélectionnez et copiez le lien ci-dessus."),
                    )
                }
              >
                <Copy size={16} />
                Copier le lien
              </button>
            </div>
          )}
          <div className="bw-table-card">
            <table>
              <thead>
                <tr>
                  <th>Collaborateur</th>
                  <th>Accès</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {team.members.map((member) => (
                  <tr key={member.id}>
                    <td>
                      {member.email}
                      {member.id === userId && (
                        <span className="bw-badge">Vous</span>
                      )}
                    </td>
                    <td>{member.manager ? "Responsable" : "Opérateur"}</td>
                    <td>
                      <div className="bw-inline-actions">
                        {team.is_admin && (
                          <button
                            disabled={busy}
                            onClick={() =>
                              void act("manager_set", {
                                id: member.id,
                                enabled: !member.manager,
                              })
                            }
                          >
                            {member.manager
                              ? "Retirer le rôle responsable"
                              : "Nommer responsable"}
                          </button>
                        )}
                        {team.can_manage &&
                          member.id !== userId &&
                          (!member.manager || team.is_admin) && (
                            <button
                              disabled={busy}
                              onClick={() => {
                                if (
                                  window.confirm(
                                    `Retirer l’accès de ${member.email} à ce point de retrait ?`,
                                  )
                                )
                                  void act("member_remove", { id: member.id });
                              }}
                            >
                              <Trash2 size={15} />
                              Retirer
                            </button>
                          )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {team.members.length === 0 && (
              <p>Aucun collaborateur affecté à ce point.</p>
            )}
          </div>
          {team.can_manage && (
            <div className="bw-card">
              <h2>Invitations</h2>
              {team.invitations.length === 0 ? (
                <p>Aucune invitation en attente.</p>
              ) : (
                team.invitations.map((invite) => (
                  <div className="bw-invite-row" key={invite.id}>
                    <div>
                      <strong>{invite.email}</strong>
                      <p>
                        {invite.accepted_at
                          ? "Acceptée"
                          : invite.revoked_at
                            ? "Révoquée"
                            : new Date(invite.expires_at) < new Date()
                              ? "Expirée"
                              : `En attente, jusqu’au ${new Date(invite.expires_at).toLocaleDateString("fr-FR")}`}
                      </p>
                    </div>
                    {!invite.accepted_at && !invite.revoked_at && (
                      <button
                        disabled={busy}
                        onClick={() =>
                          void act("invite_revoke", { id: invite.id })
                        }
                      >
                        Révoquer
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
}
