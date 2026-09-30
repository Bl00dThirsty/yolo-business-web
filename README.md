# Yolo Business web

Interface Vite, React et TypeScript pour les points de retrait Yolo.

## Parcours disponibles

- `/` : accueil public de Yolo Business.
- `/connexion` (alias `/app`) : espace connecté existant.
- `/demo` : alias de compatibilité vers le même espace authentifié.
- `/invitation` : connexion ou inscription, puis acceptation d’une invitation nominative.

Copier `.env.example` vers `.env.local` et renseigner l'URL Supabase et sa clé publique. Aucune clé de service dans le navigateur.

`npm install`, puis `npm run dev`. Vérification : `npm run build` et `npm run lint`.

Le backend et ses migrations sont versionnés dans [yolo-delivery-mobile](https://github.com/Bl00dThirsty/yolo-delivery-mobile), dossier `supabase/migrations`. Les comptes web doivent être autorisés dans `operator_members` pour leurs points de retrait. Le navigateur ne peut pas s'attribuer ces droits. L'attribution automatique (dispatch) vers les livreurs mobiles recherche les coursiers disponibles dans un rayon de proximité géographique étendu à **20 km** autour du point de retrait (PostGIS).

La recherche initiale utilise un catalogue pilote de quartiers de Douala/Yaoundé. Les centres sont indicatifs ; chaque destination exige une épingle confirmée. Un fournisseur de géocodage étendu reste à intégrer. Les tuiles OpenStreetMap affichent leur attribution et peuvent être remplacées via `VITE_MAP_TILE_URL`. Voir la [politique des tuiles](https://operations.osmfoundation.org/policies/tiles/).

Cet espace connecté est destiné aux opérateurs habilités : devis commerciaux automatiques, rôles commerçants complets, paiements et reversements restent à développer. Les codes destinataires sont affichés une seule fois pour distribution contrôlée. Une réémission auditée invalide le code précédent.

## Publication

Vercel utilise `vercel.json`. Renseigner les deux variables publiques Supabase dans l'environnement de build. `.vercelignore` exclut secrets, caches et sorties locales.
Les branches sont publiées en aperçu ; la production doit provenir d'un tag annoté sur `main` après PR et recette, selon [CONTRIBUTING.md](./CONTRIBUTING.md).

## Site de présentation

Les pages publiques sont dans `src/components/marketing`. Les contenus sont regroupés dans `content.ts` et les animations GSAP respectent la préférence de mouvement réduit. Le header et le footer pointent vers des pages dédiées ; les trois guides et la FAQ sont consultables.

Le formulaire `/contact` valide les champs et prépare un fichier texte à télécharger, sans envoi externe. Les coordonnées officielles, les tarifs et les textes légaux restent à compléter.

Les cinq originaux restent dans `src/assets`. `npm run images:marketing` régénère leurs versions WebP dans `src/assets/optimized`.

## Espace commerçant

Tableau de bord des 100 dernières livraisons, opérations de livraison, factures clients, points de retrait, équipe et paramètres utilisent le compte connecté et ses autorisations serveur.

La migration backend `20260930102252_business_workspace_invoices_team.sql` ajoute les factures immuables, leur numérotation serveur, les invitations nominatives valables sept jours et les responsables de point de retrait. Un administrateur peut nommer un responsable dans Équipe. Les opérateurs ordinaires ne peuvent pas inviter ni retirer des membres. Les invitations se partagent par un lien à copier, sans envoi automatique d’e-mail. Leur acceptation exige une adresse e-mail confirmée correspondant au destinataire.

Les factures concernent les ventes du commerçant à ses clients. Elles comportent articles et frais de livraison, sans calcul automatique de taxes. L’aperçu permet l’impression ou l’enregistrement PDF. WhatsApp prépare un récapitulatif texte ; le PDF peut ensuite être joint manuellement. Une demande interrompue est conservée dans la session du navigateur avec sa référence pour éviter les doublons lors d’une nouvelle tentative.
