import { useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowLeft, Eye, EyeOff, LoaderCircle, Check, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import logo from "@/assets/logo-yolo-black.png";
import "./auth-page.css";

export function AuthPage({ invitationToken = "", recovery = false, onRecovered }: { invitationToken?: string; recovery?: boolean; onRecovered: () => void }) {
  const [mode, setMode] = useState<"login" | "signup" | "reset">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [done, setDone] = useState(false);
  const lock = useRef(false);
  const feedback = useRef<HTMLParagraphElement>(null);
  useEffect(() => { if (error || notice) feedback.current?.focus(); }, [error, notice]);
  const title = recovery ? "Nouveau mot de passe" : mode === "reset" ? "Mot de passe oublié ?" : mode === "signup" ? "Rejoindre votre équipe" : "Connexion";
  function changeMode(next: typeof mode) { setMode(next); setError(""); setNotice(""); setPassword(""); setVisible(false); }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lock.current || !supabase) return;
    lock.current = true; setBusy(true); setError(""); setNotice("");
    try {
      if (recovery) {
        if (password.length < 12 || password !== confirmation) throw Error("Utilisez au moins 12 caractères et confirmez le même mot de passe.");
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw Error("Ce changement n’a pas abouti. Vérifiez votre connexion ou demandez un nouveau lien.");
        setPassword(""); setConfirmation(""); setDone(true); setNotice("Votre mot de passe a été modifié.");
      } else if (mode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: window.location.origin + "/connexion?reset=1" });
        if (error) throw Error("Impossible d’envoyer le lien pour le moment. Patientez quelques minutes puis réessayez.");
        setNotice("Si un compte correspond à cette adresse, vous recevrez un lien pour choisir un nouveau mot de passe.");
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email: email.trim(), password, options: { emailRedirectTo: window.location.origin + "/invitation?invitation=" + encodeURIComponent(invitationToken) } });
        if (error) throw Error("La création du compte n’a pas abouti. Vérifiez vos informations ou réessayez plus tard.");
        setPassword(""); setNotice("Consultez votre messagerie pour confirmer votre adresse, puis rouvrez votre invitation.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw Error(error.status === 429 ? "Trop de tentatives. Patientez quelques minutes avant de réessayer." : "Connexion impossible. Vérifiez votre e-mail, votre mot de passe et votre connexion.");
        setPassword("");
      }
    } catch (e) { setError(e instanceof Error ? e.message : "Une erreur est survenue. Veuillez réessayer."); }
    finally { lock.current = false; setBusy(false); }
  }
  return <div className="yolo-auth-shell">
    <section className="yolo-auth-card" aria-labelledby="auth-title">
      <a href="/" className="yolo-auth-brand" aria-label="Yolo Business, accueil"><img src={logo} alt="Yolo" /><span>BUSINESS</span></a>
      <h1 id="auth-title">{title}</h1>
      <p className="yolo-auth-intro">{recovery ? "Choisissez un mot de passe pour sécuriser votre espace." : mode === "reset" ? "Recevez un lien de réinitialisation par e-mail." : mode === "signup" ? "Utilisez l’adresse à laquelle votre invitation a été envoyée." : "Retrouvez vos livraisons et votre équipe."}</p>
      {(error || notice) && <p ref={feedback} tabIndex={-1} role={error ? "alert" : "status"} className={`yolo-auth-feedback ${error ? "is-error" : ""}`}>{error ? <AlertCircle size={18} /> : <Check size={18} />}<span>{error || notice}</span></p>}
      {done ? <button className="yolo-auth-submit" onClick={onRecovered}>Accéder à mon espace <ArrowRight size={18} /></button> : <form onSubmit={submit} aria-busy={busy}>
        <fieldset disabled={busy}>
          {!recovery && <label htmlFor="auth-email">Adresse e-mail <span aria-hidden="true">*</span><input id="auth-email" type="email" autoComplete="username" inputMode="email" autoCapitalize="none" spellCheck={false} required value={email} onChange={e => setEmail(e.target.value)} placeholder="vous@entreprise.com" /></label>}
          {(recovery || mode !== "reset") && <div className="yolo-auth-password-group"><label htmlFor="auth-password">{recovery ? "Nouveau mot de passe" : "Mot de passe"} <span aria-hidden="true">*</span></label><div className="yolo-auth-password"><input id="auth-password" type={visible ? "text" : "password"} autoComplete={recovery || mode === "signup" ? "new-password" : "current-password"} minLength={recovery || mode === "signup" ? 12 : undefined} aria-describedby={recovery || mode === "signup" ? "password-hint" : undefined} required value={password} onChange={e => setPassword(e.target.value)} placeholder="Votre mot de passe" /><button type="button" aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"} aria-pressed={visible} onClick={() => setVisible(v => !v)}>{visible ? <EyeOff size={19} /> : <Eye size={19} />}</button></div>{(recovery || mode === "signup") && <small id="password-hint">12 caractères minimum.</small>}</div>}
          {recovery && <label htmlFor="auth-confirm">Confirmer le mot de passe<input id="auth-confirm" type="password" autoComplete="new-password" required value={confirmation} onChange={e => setConfirmation(e.target.value)} /></label>}
          {!recovery && mode === "login" && <button type="button" className="yolo-auth-forgot" onClick={() => changeMode("reset")}>Mot de passe oublié ?</button>}
          <button className="yolo-auth-submit" type="submit">{busy ? <><LoaderCircle className="yolo-spin" size={18} /> Veuillez patienter…</> : <>{recovery ? "Enregistrer le mot de passe" : mode === "reset" ? "Recevoir le lien" : mode === "signup" ? "Créer mon compte" : "Se connecter"}<ArrowRight size={18} /></>}</button>
        </fieldset>
      </form>}
      {!recovery && <div className="yolo-auth-bottom">{mode !== "login" ? <button disabled={busy} onClick={() => changeMode("login")}><ArrowLeft size={15} /> Revenir à la connexion</button> : invitationToken ? <button disabled={busy} onClick={() => changeMode("signup")}>Créer mon compte pour rejoindre l’équipe</button> : <p>Vous découvrez Yolo ? <a href="/contact">Demander un accès</a></p>}</div>}
    </section>
    <footer className="yolo-auth-footer"><a href="/">Retour à l’accueil</a><a href="/confidentialite">Confidentialité</a><a href="/contact">Besoin d’aide ?</a></footer>
  </div>;
}
