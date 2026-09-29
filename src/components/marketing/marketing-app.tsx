import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "@fontsource-variable/manrope";
import logo from "@/assets/logo-yolo-black.png";
import {
  articles,
  pages,
  faq,
  steps,
  handoff,
  customer,
  city,
} from "./content";
import "./marketing.css";
gsap.registerPlugin(ScrollTrigger);
const navLinks = [
  ["La solution", "/solution"],
  ["Pour qui ?", "/entreprises"],
  ["Comment ça marche", "/fonctionnement"],
  ["Ressources", "/ressources"],
  ["Tarifs", "/tarifs"],
];
const footerLinks = [
  {
    title: "La solution",
    links: [
      ["Découvrir Yolo", "/solution"],
      ["Comment ça marche", "/fonctionnement"],
      ["Les tarifs", "/tarifs"],
      ["Explorer la démo", "/demo"],
    ],
  },
  {
    title: "Votre activité",
    links: [
      ["Commerces & e-commerce", "/entreprises"],
      ["Zones de livraison", "/zones"],
      ["Devenir partenaire", "/partenaires"],
      ["Se connecter", "/connexion"],
    ],
  },
  {
    title: "À découvrir",
    links: [
      ["À propos de Yolo", "/a-propos"],
      ["Guides pratiques", "/ressources"],
      ["Questions fréquentes", "/faq"],
      ["Nous contacter", "/contact"],
    ],
  },
];
function Arrow({
  direction = "up-right",
}: {
  direction?: "up-right" | "right" | "left" | "down";
}) {
  const paths = {
    "up-right": "M7 17 17 7M7 7h10v10",
    right: "M5 12h14m-6-6 6 6-6 6",
    left: "M19 12H5m6-6-6 6 6 6",
    down: "M12 5v14m-6-6 6 6 6-6",
  };
  return (
    <svg
      className="m-arrow"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={paths[direction]} />
    </svg>
  );
}
function CTA({
  href = "/demo",
  children = "Explorer la démo",
}: {
  href?: string;
  children?: React.ReactNode;
}) {
  return (
    <a className="m-button" href={href}>
      {children}
      <Arrow />
    </a>
  );
}
function FAQ() {
  return (
    <div className="m-faq">
      {faq.map(([q, a]) => (
        <details key={q}>
          <summary>
            {q}
            <span aria-hidden="true">+</span>
          </summary>
          <p>{a}</p>
        </details>
      ))}
    </div>
  );
}
function Process() {
  const [active, setActive] = useState(0);
  return (
    <div className="m-process">
      <div>
        {steps.map((s, i) => (
          <button
            key={s.title}
            className={active === i ? "active" : ""}
            onClick={() => setActive(i)}
            aria-expanded={active === i}
            aria-controls={`step-${i}`}
          >
            <span>0{i + 1}</span>
            <div>
              <h3>{s.title}</h3>
              <p id={`step-${i}`} hidden={active !== i}>
                {s.description}
              </p>
            </div>
          </button>
        ))}
      </div>
      <figure>
        <img
          src={steps[active].image}
          alt={
            active === 0
              ? "Colis organisés dans un entrepôt"
              : active === 1
                ? "Livreur Yolo à moto en ville"
                : "Cliente recevant son colis Yolo"
          }
          loading="lazy"
        />
        <figcaption>{steps[active].label}</figcaption>
      </figure>
    </div>
  );
}
function Resources() {
  return (
    <div className="m-resources">
      {articles.map((a) => (
        <a href={`/ressources/${a.slug}`} key={a.slug}>
          <div className="m-image-wrap">
            <img src={a.image} alt="" loading="lazy" />
          </div>
          <span className="m-eyebrow">{a.category}</span>
          <h3>{a.title}</h3>
          <span className="m-text-link">
            Lire le guide <Arrow />
          </span>
        </a>
      ))}
    </div>
  );
}
function Contact() {
  const [draft, setDraft] = useState("");
  return (
    <section className="m-contact m-container">
      <div>
        <span className="m-eyebrow">PARLONS DE VOS LIVRAISONS</span>
        <h1>
          Un bon départ <br />
          commence ici.
        </h1>
        <p>Présentez-nous votre activité et vos besoins.</p>
        <div className="m-contact-note">
          Le formulaire prépare votre demande sans l’envoyer. Le canal de
          contact officiel sera ajouté prochainement.
        </div>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const d = new FormData(e.currentTarget);
          setDraft(
            `Demande Yolo Business\n\nNom : ${d.get("name")}\nEntreprise : ${d.get("company")}\nE-mail : ${d.get("email")}\nBesoin : ${d.get("message")}`,
          );
        }}
      >
        <label>
          Votre nom
          <input name="name" required autoComplete="name" maxLength={100} />
        </label>
        <label>
          Votre entreprise
          <input
            name="company"
            required
            autoComplete="organization"
            maxLength={150}
          />
        </label>
        <label>
          Votre e-mail
          <input name="email" type="email" required autoComplete="email" />
        </label>
        <label>
          Comment pouvons-nous vous aider ?
          <textarea
            name="message"
            required
            rows={4}
            maxLength={3000}
            placeholder="Vos quartiers, votre volume de colis, vos questions…"
          />
        </label>
        <button className="m-button" type="submit">
          Préparer ma demande <Arrow />
        </button>
        {draft && (
          <div className="m-draft" role="status">
            <strong>Votre demande est prête. Elle n’a pas été envoyée.</strong>
            <pre>{draft}</pre>
            <a
              download="demande-yolo-business.txt"
              href={`data:text/plain;charset=utf-8,${encodeURIComponent(draft)}`}
            >
              Télécharger mon récapitulatif <Arrow direction="down" />
            </a>
          </div>
        )}
      </form>
    </section>
  );
}
function Home() {
  return (
    <>
      <section className="m-hero m-container">
        <div className="m-hero-copy" data-reveal>
          <span className="m-eyebrow">
            <i /> VOTRE COMMERCE. PLUS LOIN.
          </span>
          <h1>
            Vous faites <br />
            du business. <br />
            <em>Nous livrons.</em>
          </h1>
          <p>
            De votre boutique à la porte de vos clients.
            <br className="m-desktop-break" /> Une façon plus simple d’organiser
            vos livraisons, à Yaoundé.
          </p>
          <div className="m-actions">
            <CTA />
            <a className="m-text-link" href="/fonctionnement">
              Comment ça marche <Arrow direction="right" />
            </a>
          </div>
          <div className="m-hero-foot">
            <span className="m-small-line" />
            Pensé pour les commerces d’ici.
          </div>
        </div>
        <div className="m-hero-visual" data-reveal>
          <img
            className="m-hero-photo"
            src={handoff}
            alt="Une cliente reçoit son colis des mains d’un livreur Yolo"
            fetchPriority="high"
          />
          <div className="m-photo-label">
            <span>Le dernier kilomètre.</span>
            <strong>Le premier sourire.</strong>
          </div>
          <div className="m-photo-inset">
            <img src={city} alt="Livreur Yolo parcourant la ville à moto" />
            <span>En mouvement, pour vous.</span>
          </div>
          <span className="m-vertical-label">
            DE VOTRE BOUTIQUE À LEUR PORTE — YOLO BUSINESS
          </span>
        </div>
      </section>
      <div className="m-audience m-container">
        <span>
          À chaque activité, <br />
          <strong>son prochain départ.</strong>
        </span>
        <span>Boutiques & commerces</span>
        <span>E-commerce</span>
        <span>Vente sur les réseaux</span>
        <span>Distribution</span>
      </div>
      <section className="m-section m-container" data-reveal>
        <div className="m-section-heading">
          <span className="m-eyebrow">MOINS DE COMPLICATIONS</span>
          <h2>
            Vous avez déjà beaucoup à faire. <br />
            <span>La livraison peut être plus simple.</span>
          </h2>
        </div>
        <div className="m-benefits">
          {[
            [
              "01",
              "Tout au même endroit.",
              "Vos colis, vos destinataires et vos opérations. Un espace commun pour y voir plus clair.",
            ],
            [
              "02",
              "Un départ bien organisé.",
              "Préparez les informations utiles et facilitez la prise en charge depuis votre commerce.",
            ],
            [
              "03",
              "Jusqu’à votre client.",
              "Un parcours pensé pour garder le lien, de la préparation du colis à sa réception.",
            ],
          ].map(([n, t, d]) => (
            <div key={n}>
              <span>{n}</span>
              <h3>{t}</h3>
              <p>{d}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="m-platform m-container" data-reveal>
        <div>
          <span className="m-eyebrow">VOTRE NOUVEAU POINT DE DÉPART</span>
          <h2>
            Un espace clair. <br />
            L’esprit plus libre.
          </h2>
          <p>
            Retrouvez l’essentiel de vos livraisons dans Yolo Business. Prenez
            quelques minutes pour découvrir la plateforme.
          </p>
          <CTA>Visiter l’espace démo</CTA>
          <small>Aperçu illustratif · données fictives</small>
        </div>
        <div className="m-dashboard">
          <div className="m-dashboard-top">
            <strong>
              yolo<span>business</span>
            </strong>
            <span>Bonjour, Léa.</span>
          </div>
          <div className="m-dashboard-title">
            <h3>Vos livraisons</h3>
            <span>Aujourd’hui</span>
          </div>
          <div className="m-metrics">
            <div>
              <span>Colis du jour</span>
              <strong>12</strong>
            </div>
            <div>
              <span>En livraison</span>
              <strong>04</strong>
            </div>
            <div>
              <span>Livrés</span>
              <strong>08</strong>
            </div>
          </div>
          <div className="m-rows">
            {[
              ["YL-0248", "Bastos", "En livraison"],
              ["YL-0247", "Mvan", "Livré"],
              ["YL-0246", "Essos", "Livré"],
            ].map(([r, a, s]) => (
              <div key={r}>
                <strong>{r}</strong>
                <span>{a}</span>
                <span className={s === "Livré" ? "m-delivered" : "m-transit"}>
                  {s}
                </span>
              </div>
            ))}
          </div>
          <div className="m-dashboard-bottom">
            Chaque colis, une étape de plus. <Arrow />
          </div>
        </div>
      </section>
      <section className="m-section m-container" data-reveal>
        <div className="m-section-heading m-heading-row">
          <div>
            <span className="m-eyebrow">DU DÉPART AU SOURIRE</span>
            <h2>Simple, à chaque étape.</h2>
          </div>
          <a className="m-text-link" href="/fonctionnement">
            Découvrir le parcours <Arrow />
          </a>
        </div>
        <Process />
      </section>
      <section className="m-business" data-reveal>
        <div className="m-container m-business-inner">
          <img
            src={customer}
            alt="Une cliente et un livreur Yolo lors d’une remise de colis"
            loading="lazy"
          />
          <div>
            <span className="m-eyebrow">LE COMMERCE A MILLE VISAGES</span>
            <h2>
              Il y a votre façon <br />
              de vendre. <br />
              <em>Et Yolo pour livrer.</em>
            </h2>
            <p>
              Une boutique de quartier, une marque sur Instagram, une activité
              qui grandit. Chaque commerce mérite une livraison à sa mesure.
            </p>
            <a href="/entreprises" className="m-text-link">
              Une solution pour mon activité <Arrow />
            </a>
          </div>
        </div>
      </section>
      <section className="m-section m-container" data-reveal>
        <div className="m-section-heading m-heading-row">
          <div>
            <span className="m-eyebrow">UN PEU D’INSPIRATION</span>
            <h2>Le coin des commerçants.</h2>
          </div>
          <a className="m-text-link" href="/ressources">
            Tous les guides <Arrow />
          </a>
        </div>
        <Resources />
      </section>
      <section className="m-section m-container m-faq-section" data-reveal>
        <div>
          <span className="m-eyebrow">ON VOUS RÉPOND</span>
          <h2>
            Avant de <br />
            vous lancer.
          </h2>
          <a className="m-text-link" href="/contact">
            Une autre question ? <Arrow />
          </a>
        </div>
        <FAQ />
      </section>
    </>
  );
}
function PageContent({ path }: { path: string }) {
  if (path === "/") return <Home />;
  if (path === "/contact") return <Contact />;
  const article = articles.find((a) => path === `/ressources/${a.slug}`);
  if (article)
    return (
      <article className="m-article m-container">
        <a className="m-text-link" href="/ressources">
          <Arrow direction="left" /> Tous les guides
        </a>
        <span className="m-eyebrow">{article.category}</span>
        <h1>{article.title}</h1>
        <img src={article.image} alt="" />
        <div>
          {article.paragraphs.map((p, i) => (
            <section key={p}>
              <span className="m-eyebrow">0{i + 1}</span>
              <p>{p}</p>
            </section>
          ))}
        </div>
      </article>
    );
  if (["/fonctionnement", "/ressources", "/faq"].includes(path))
    return (
      <section className="m-container m-subpage">
        <span className="m-eyebrow">YOLO BUSINESS</span>
        <h1>
          {path === "/fonctionnement"
            ? "Votre colis. Trois étapes."
            : path === "/faq"
              ? "Vos questions, simplement."
              : "Des idées pour aller plus loin."}
        </h1>
        <p className="m-page-intro">
          {path === "/fonctionnement"
            ? "Un parcours pensé pour vous, votre livreur et votre client."
            : path === "/faq"
              ? "Les informations utiles avant votre premier départ."
              : "Des conseils pratiques pour vos livraisons et votre commerce."}
        </p>
        {path === "/fonctionnement" ? (
          <Process />
        ) : path === "/faq" ? (
          <FAQ />
        ) : (
          <Resources />
        )}
      </section>
    );
  const page = pages[path];
  if (!page)
    return (
      <section className="m-container m-subpage">
        <span className="m-eyebrow">404 · MAUVAISE ADRESSE</span>
        <h1>
          Cette page a pris <br />
          un autre chemin.
        </h1>
        <p className="m-page-intro">Retrouvons le bon point de départ.</p>
        <CTA href="/">Retour à l’accueil</CTA>
      </section>
    );
  return (
    <section className="m-container m-subpage">
      <span className="m-eyebrow">{page.eyebrow}</span>
      <h1>{page.title}</h1>
      <p className="m-page-intro">{page.intro}</p>
      {page.image && (
        <img
          className="m-page-photo"
          src={page.image}
          alt="L’univers de la livraison Yolo"
        />
      )}
      <div className="m-page-sections">
        {page.sections.map(([t, b], i) => (
          <section key={t}>
            <span className="m-eyebrow">0{i + 1}</span>
            <h2>{t}</h2>
            <p>{b}</p>
          </section>
        ))}
      </div>
      {[
        "/solution",
        "/entreprises",
        "/tarifs",
        "/zones",
        "/partenaires",
      ].includes(path) && <CTA href="/contact">Parlons de votre activité</CTA>}
    </section>
  );
}
export default function MarketingApp() {
  const root = useRef<HTMLDivElement>(null);
  const [menu, setMenu] = useState(false);
  const path = window.location.pathname.replace(/\/$/, "") || "/";
  useEffect(() => {
    const old = document.title;
    document.title =
      path === "/"
        ? "Yolo Business — Vous faites du business. Nous livrons."
        : `${pages[path]?.title || { "/contact": "Contact", "/ressources": "Guides pratiques", "/fonctionnement": "Comment ça marche", "/faq": "Questions fréquentes" }[path] || articles.find((a) => path.endsWith(a.slug))?.title || "Page introuvable"} · Yolo Business`;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.utils
        .toArray<HTMLElement>("[data-reveal]", root.current)
        .forEach((el) => {
          gsap.from(el, {
            opacity: 0,
            y: 28,
            duration: 0.85,
            ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 94%", once: true },
          });
        });
    });
    return () => {
      mm.revert();
      document.title = old;
    };
  }, [path]);
  useEffect(() => {
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenu(false);
        document.getElementById("m-menu-toggle")?.focus();
      }
    };
    if (menu) window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [menu]);
  return (
    <div className="marketing" ref={root}>
      <a className="m-skip" href="#main">
        Aller au contenu
      </a>
      <header className="m-header m-container">
        <a className="m-logo" href="/" aria-label="Yolo Business, accueil">
          <img src={logo} alt="Yolo" />
          <span>business</span>
        </a>
        <nav
          aria-label="Navigation principale"
          className={menu ? "m-nav is-open" : "m-nav"}
          id="m-navigation"
        >
          {navLinks.map(([l, h]) => (
            <a href={h} key={h} aria-current={path === h ? "page" : undefined}>
              {l}
            </a>
          ))}
        </nav>
        <a href="/connexion" className="m-login">
          Se connecter <Arrow />
        </a>
        <button
          id="m-menu-toggle"
          className="m-menu-toggle"
          aria-label={menu ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={menu}
          aria-controls="m-navigation"
          onClick={() => setMenu(!menu)}
        >
          {menu ? "Fermer" : "Menu"}
        </button>
      </header>
      <main id="main">
        <PageContent path={path} />
        <section className="m-final-cta m-container" data-reveal>
          <span className="m-eyebrow">ON FAIT LE CHEMIN ENSEMBLE ?</span>
          <h2>
            Votre prochain colis. <br />
            <em>Notre prochain départ.</em>
          </h2>
          <CTA href="/connexion">Accéder à mon espace</CTA>
          <a className="m-text-link" href="/contact">
            Nouveau chez Yolo ? Parlons-en <Arrow />
          </a>
        </section>
      </main>
      <footer className="m-footer">
        <div className="m-container">
          <div className="m-footer-top">
            <a className="m-logo" href="/">
              <img src={logo} alt="Yolo" />
              <span>business</span>
            </a>
            <p>
              Le commerce avance. <br />
              Nous faisons le chemin.
            </p>
            <span>
              Yaoundé, Cameroun <br />
              <small>Proche de vous. Jusqu’à vos clients.</small>
            </span>
          </div>
          <div className="m-footer-columns">
            <div>
              <span className="m-eyebrow">FAISONS CONNAISSANCE</span>
              <h3>
                Votre activité. <br />
                Nos prochains échanges.
              </h3>
              <a className="m-text-link" href="/contact">
                Préparer une demande <Arrow />
              </a>
              <small>
                Service en préparation. <br />
                Disponibilité à confirmer selon votre zone.
              </small>
            </div>
            {footerLinks.map((group) => (
              <div key={group.title}>
                <h4>{group.title}</h4>
                {group.links.map(([l, h]) => (
                  <a href={h} key={h}>
                    {l}
                  </a>
                ))}
              </div>
            ))}
          </div>
          <div className="m-footer-bottom">
            <span>© {new Date().getFullYear()} Yolo Business</span>
            <div>
              <a href="/mentions-legales">Mentions légales</a>
              <a href="/confidentialite">Confidentialité</a>
              <a href="/conditions">Conditions</a>
              <a href="/cookies">Cookies</a>
            </div>
            <span>
              Fait pour aller plus loin. <Arrow />
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
