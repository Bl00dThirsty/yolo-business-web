# Versioning Yolo

Ce dépôt suit le « Guide interne Git » fourni par le propriétaire du projet.

- `develop` : intégration des changements validés.
- `feature/<domaine>-<action>` et `fix/<probleme>` partent de `develop` et y reviennent par Pull Request.
- `release/<version>` sert à la recette d'une version. `main` représente la production validée.
- `hotfix/<incident>` part de `main`, puis la correction revient également dans `develop`.
- Aucun développement direct sur `main` ou `develop`. Aucune réécriture forcée de ces branches.
- Commits courts : verbe d'action et objet. Une intention cohérente par commit.
- Les PR décrivent le besoin, les changements, les tests, les migrations et les limites connues.
- Une production provient d'un tag annoté `vMAJOR.MINOR.PATCH` sur `main` après validation. Les déploiements de branches sont des aperçus de recette.

Les dépôts étant initialement vides, `develop` est initialisé avec les règles d'exclusion ; l'import applicatif et les fonctionnalités sont proposés dans une première PR. `main` et le premier tag de production seront créés lors de la première release validée.

Ne jamais versionner `.local`, les fichiers `.env`, les mots de passe, clés privées, keystores, dossiers de compilation ou sessions de navigateur. Une clé publique Supabase est utilisable par le client ; les accès sont protégés par les autorisations du serveur.
