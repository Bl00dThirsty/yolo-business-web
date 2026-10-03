# Vérification de préparation au lancement

Date : 3 octobre 2026. Périmètre : Yolo Business, protections serveur de livraison et tests de Yolo Delivery.

## Conclusion

Le parcours web est amélioré et les contrôles ciblés passent. Ce constat ne vaut pas validation complète du lancement. L’envoi WhatsApp réel, les encaissements de frais de livraison, les retours, les tarifs serveur et la restauration de sauvegarde doivent encore être validés.

Yolo transporte et facture la livraison à l’expéditeur. Le paiement des marchandises ne fait pas partie du service.

## Résultats et limites

| Parcours | Éléments vérifiés | Reste avant lancement |
| --- | --- | --- |
| Connexion | Formulaire responsive, visibilité du mot de passe, erreur accessible, soumission verrouillée, requête de réinitialisation et retour après changement de mot de passe testés avec API simulée. | Vérifier l’envoi SMTP réel et les URL de retour autorisées pour `/connexion?reset=1` et les invitations. Aucun e-mail réel envoyé pendant les tests. |
| Isolation des entreprises | Tests PostgreSQL isolés : accès inter-sites refusé, tables privées inaccessibles directement, permissions d’invitation et réutilisation après retrait d’accès contrôlées. | Recette avec comptes de pilotage distincts sur l’environnement cible. |
| Création de livraison | Référence de requête conservée pour les demandes en attente. Champ de paiement produit retiré. Le point de retrait d’une demande restaurée est réutilisé s’il est accessible. | Parcours réel complet, repères/dimensions admissibles, cohérence des tarifs et reprise d’une création interrompue à tester avec le serveur local complet. |
| Encaissement des produits | Migration `20261003114018_delivery_transport_only.sql` appliquée au serveur : nouveaux montants non nuls interdits, modifications vers un montant non nul interdites, historique conservé. Cinq tests isolés passent et le déclencheur serveur est actif. | Les anciennes opérations ne sont pas réécrites. Les anciens brouillons contenant une collecte nécessitent une intervention pour vérifier leur état avant recréation. |
| Affectation | Relecture de la fonction distante : verrouillage de la livraison et du livreur, offre expirée refusée, disponibilité/approbation/capacité et position récente contrôlées. | Test concurrent avec plusieurs connexions PostgreSQL non relancé : Docker arrêté et base locale indisponible au port 55322. Une lecture de code ne prouve pas le comportement complet en production. |
| Récupération du colis | Fonction distante : code de retrait accepté par le livreur, confirmation de l’expéditeur, expiration et version d’affectation contrôlées. Tests Flutter de l’ordre des étapes réussis. | Essai terrain sur téléphone avec reprise réseau et changement de livreur. |
| Remise au destinataire | Fonction distante : livreur affecté, état `at_dropoff`, code à six chiffres et verrouillage après cinq tentatives ; gain enregistré lors de la remise. | Pas d’expiration temporelle du code destinataire constatée dans la fonction distante. Vérifier la clôture concurrente et les reprises serveur ; aucun code valide ne garantit à lui seul l’état physique du colis. |
| WhatsApp | Quatre tests du service d’envoi simulé passent. | Table `whatsapp_outbox` absente de l’environnement distant au contrôle. Migration locale non activée, worker et modèle approuvé à configurer. Réception réelle, suivi des messages et procédure de secours non validés. Le code reste distribué manuellement par l’opérateur dans le parcours actuel. |
| Tarification | Aucun changement trompeur de libellé : `courier_fee` reste la rémunération du livreur saisie manuellement. | Tarif de transport calculé et figé côté serveur, règles de zones, annulation/tentative/retour et prix présenté à l’expéditeur manquants. Ne pas présenter `courier_fee` comme le prix final facturé par Yolo. |
| Paiement de la livraison | Le paiement des produits est exclu. | Pas de confirmation de versement Mobile Money intégrée ni de rapprochement complet cash/transport validé. `earned` correspond à un gain acquis, pas à une preuve de paiement du livreur. Table distante `payment_accounts` absente au contrôle. |
| Incidents et retours | Signalement d’incident présent côté serveur, avec contrôle d’affectation et référence de requête. | Workflow retour/réessai/restitution et traitement support à finaliser ; signaler un incident ne clôt pas son traitement. |
| Tableau de bord | Données conservées après échec d’actualisation, absence de faux zéro après erreur initiale, horodatage, avertissement hors ligne, confirmation distincte du rafraîchissement. Tests navigateur avec panne réseau simulée réussis. | Contrôler la latence et la fraîcheur des informations pendant un pilote réel. Le polling reste à 15 secondes. |
| Sauvegarde et exploitation | Aucun test de restauration ni de supervision de production effectué dans cette intervention. | Restaurer une sauvegarde sur un environnement séparé, tester les alertes et prévoir un responsable d’exploitation. |

## Changement d’interface

Connexion : carte centrée, fond clair, logo Yolo, formulaire accessible et responsive. Aucune option Apple/Google/SSO non configurée affichée. Le retour après réinitialisation est explicite.

Dashboard : confirmations visibles et fermables, focus sur les erreurs, états de chargement, indication de dernière actualisation, protection contre les réponses de lecture anciennes. Les animations respectent la réduction de mouvement.

Les factures de produits sont masquées dans la navigation, pas supprimées de la base ni de leur code source. Les textes publics ne les présentent plus comme un service de lancement.

## Contrôles exécutés

- `npm run build` : réussi.
- Analyse ciblée des composants : aucune erreur, avertissements de synchronisation d’état React dans le composant opérationnel existant.
- Tests navigateur : `scripts/verify-auth.mjs` et `scripts/verify-workspace.mjs`. Services Supabase simulés, aucune donnée client réelle, aucun e-mail ni WhatsApp envoyé.
- Affichages connexion ordinateur et mobile contrôlés ; focus des erreurs, réduction des animations, verrouillage du formulaire, panne de lecture après mutation et récupération de mot de passe vérifiés.
- `flutter test` : 15 tests réussis. Tests logiciels uniquement ; ne remplace pas la recette sur Android/iOS réels.
- Tests PostgreSQL isolés de l’espace entreprise : 12 contrôles réussis.
- Tests PostgreSQL isolés du refus des collectes de produits : 5 contrôles réussis.
- Service WhatsApp simulé : 4 tests réussis.
- Suite PostgreSQL complète : non exécutée, connexion locale refusée car Docker n’est pas démarré.

Pour relancer les essais navigateur depuis le dépôt web, avec Chrome installé et l’aperçu sur le port 5181 :

```powershell
npm install --prefix .local/business-ui-tests --no-package-lock playwright@1.63.0
node scripts/verify-auth.mjs
node scripts/verify-workspace.mjs
```

Les captures et dépendances des tests restent dans `.local`, hors du dépôt. Les services réseau sont interceptés avant toute interaction de test.

## Conditions de validation restantes

1. Définir et implémenter le tarif de transport, le règlement de l’expéditeur et celui du livreur.
2. Activer et vérifier la réception WhatsApp réelle et le secours en cas de non-réception.
3. Achever les retours et la console de résolution des incidents.
4. Relancer la suite serveur concurrente et une recette de bout en bout sur téléphones réels.
5. Vérifier SMTP, redirections d’authentification, sauvegarde/restauration et alertes.

Les pages publiques doivent promettre uniquement les services effectivement disponibles pendant le pilote.

## Contrôle de sécurité distant

Le contrôle Supabase effectué après la migration ne signale pas d’erreur. Il conserve une alerte de configuration : la protection contre les mots de passe compromis est désactivée. À traiter avant ouverture : [configuration Supabase](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).

Les 25 informations « RLS activé sans politique » concernent des tables privées dont l’accès direct est révoqué et dont les opérations passent par des fonctions contrôlées. Ne pas ajouter de politiques publiques pour simplement faire disparaître ces messages. [Explication du contrôle](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy).
