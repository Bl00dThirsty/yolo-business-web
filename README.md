# Yolo Business web

Interface Vite, React et TypeScript pour les points de retrait Yolo.

## Parcours disponibles

- `/` : connexion Supabase, accès aux points de retrait autorisés, création d'une demande avec une destination par colis, point exact sur carte, suivi et double validation du retrait.
- `/demo` : prototype existant avec données fictives, finances et autres parcours simulés. Aucune mutation réelle depuis cette démonstration.

Copier `.env.example` vers `.env.local` et renseigner l'URL Supabase et sa clé publique. Aucune clé de service dans le navigateur.

`npm install`, puis `npm run dev`. Vérification : `npm run build` et `npm run lint`.

Le backend et ses migrations sont versionnés dans [yolo-delivery-mobile](https://github.com/Bl00dThirsty/yolo-delivery-mobile), dossier `supabase/migrations`. Les comptes web doivent être autorisés dans `operator_members` pour leurs points de retrait. Le navigateur ne peut pas s'attribuer ces droits. L'attribution automatique (dispatch) vers les livreurs mobiles recherche les coursiers disponibles dans un rayon de proximité géographique étendu à **20 km** autour du point de retrait (PostGIS).

La recherche initiale utilise un catalogue pilote de quartiers de Douala/Yaoundé. Les centres sont indicatifs ; chaque destination exige une épingle confirmée. Un fournisseur de géocodage étendu reste à intégrer. Les tuiles OpenStreetMap affichent leur attribution et peuvent être remplacées via `VITE_MAP_TILE_URL`. Voir la [politique des tuiles](https://operations.osmfoundation.org/policies/tiles/).

Cet espace connecté est destiné aux opérateurs habilités : devis commerciaux automatiques, rôles commerçants complets, paiements et reversements restent à développer. Les codes destinataires sont affichés une seule fois pour distribution contrôlée. Une réémission auditée invalide le code précédent.

## Publication

Vercel utilise `vercel.json`. Renseigner les deux variables publiques Supabase dans l'environnement de build. `.vercelignore` exclut secrets, caches et sorties locales.
Les branches sont publiées en aperçu ; la production doit provenir d'un tag annoté sur `main` après PR et recette, selon [CONTRIBUTING.md](./CONTRIBUTING.md).
