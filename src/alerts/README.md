# Alertes pièces rares (`src/alerts/`)

Le visiteur enregistre une pièce (description, référence constructeur facultative, prix maximum) et son e-mail.
Après confirmation par e-mail, le système interroge l'API officielle eBay (Browse API) et les flux CSV
d'affiliation déclarés, puis envoie un e-mail avec les liens affiliés dès qu'une annonce correspond.
Pas de Leboncoin ni de scraping : uniquement des sources officielles.

## Parcours

1. `/alertes` : formulaire (jeton anti-robot signé, champ piège, contrôle d'origine, limite par IP, 100 e-mails de confirmation par heure au maximum pour tout le site). Une alerte identique déjà active n'est pas recréée ; une alerte identique en attente reçoit un nouveau lien.
2. E-mail de confirmation (double opt-in). Sans clic sous 48 h, la demande et l'adresse sont effacées.
3. `/alertes/confirmer` : le lien affiche un bouton, seul le clic (POST) active l'alerte. Les scanners de liens des messageries ne peuvent donc pas confirmer à la place de la personne.
4. `POST /api/alertes/executer` (jeton Bearer) : vérifie les alertes dues, envoie un e-mail récapitulatif par abonné.
   - Une recherche identique (même pièce, référence et prix) n'est faite qu'une fois par passage, quel que soit le nombre d'abonnés.
   - Un passage dure au plus 50 secondes (`runBudgetMs`), avec 4 recherches en parallèle ; le reste est repris au passage suivant.
   - Première vérification d'une alerte : au plus 10 annonces déjà en ligne sont envoyées, les autres sont marquées comme vues. Pas de rafale d'e-mails.
   - Côté eBay comme côté flux, une annonce n'est retenue que si son titre contient tous les mots de la recherche, ou la référence.
5. Chaque e-mail contient `List-Unsubscribe` + `List-Unsubscribe-Post` (désinscription en un clic, RFC 8058) et un lien vers `/alertes/gerer` (prolonger, supprimer, tout effacer).
6. Une alerte s'arrête au bout de 6 mois. Un rappel part 7 jours avant, la prolongation se fait en un clic.

## Fichiers

| Fichier | Rôle |
|---|---|
| `config.ts` | Lecture et validation des variables d'environnement, limites par défaut, texte de consentement. |
| `tokens.ts` | Jetons signés HMAC-SHA256 (confirmation, gestion, formulaire), comparaison à temps constant. |
| `validation.ts`, `text.ts`, `csv.ts` | Validation du formulaire, normalisation, échappement HTML, lecture CSV. |
| `store.ts` | Stockage SQLite (`node:sqlite`, Node.js 22.13 ou plus récent), verrou, quota d'API. |
| `sources/ebay.ts` | Browse API : jeton OAuth applicatif mis en cache, en-tête d'affiliation, filtres, contrôle des URL. |
| `sources/feed.ts` | Flux CSV d'affiliation : taille plafonnée, cache, correspondance par mots-clés ou référence. |
| `emails.ts`, `mailer.ts` | Rendu des e-mails (HTML échappé + texte), envoi SMTP via nodemailer. |
| `runner.ts` | Passage complet : nettoyage, vérifications, envoi, rappels. |
| `handlers.ts`, `http.ts`, `service.ts` | Logique des pages et points d'accès, limite de débit, câblage. |

## Mise en route

1. **eBay Partner Network** : la promotion d'eBay par e-mail exige un accord écrit préalable de l'EPN (formulaire « Messaging »). Garde `EBAY_ENABLED=false` tant qu'il n'est pas obtenu. Note ton identifiant de campagne (10 chiffres, `campid`).
2. **Compte développeur eBay** : crée un jeu de clés de production. Dans « Alerts & Notifications », active « Not persisting eBay data » (le système ne stocke aucune donnée d'utilisateur eBay, seulement des identifiants d'annonces effacés avec l'alerte).
3. **SMTP** : utilise une adresse d'expédition dédiée (`alertes@…`) avec SPF, DKIM et DMARC configurés sur le domaine. Le chiffrement TLS est imposé vers tout serveur distant (`smtps://` port 465, ou `smtp://` avec STARTTLS obligatoire).
   `MAIL_POSTAL_ADDRESS` est obligatoire : l'adresse postale de l'expéditeur figure en bas de chaque e-mail (loi et eBay Partner Network).
4. **Variables** : copie `.env.example` et remplis-le dans l'hébergement. Génère les deux secrets avec `openssl rand -base64 48`.
5. **Docker** : monte un volume persistant sur `/usr/src/app/data` (par exemple `-v ttp-data:/usr/src/app/data`). Derrière nginx, mets `TRUST_PROXY=true`.
6. **Planification** : appelle `POST /api/alertes/executer` toutes les 15 à 30 minutes, au choix :
   - cron sur le serveur (recommandé) : `*/15 * * * * curl -fsS -X POST -H "Authorization: Bearer $ALERTS_RUN_TOKEN" https://trouve-ta-piece.fr/api/alertes/executer`
   - ou le workflow `.github/workflows/alertes.yml` (toutes les 30 minutes, environ 1 450 minutes d'Actions par mois, dans le quota gratuit d'un dépôt privé), avec les secrets de dépôt `ALERTS_RUN_URL` et `ALERTS_RUN_TOKEN`.
7. **Mentions légales** : la section « Protection des données » décrit déjà ce traitement.

Chaque alerte est vérifiée au plus une fois par heure, dans la limite de `EBAY_DAILY_BUDGET` appels par jour (le quota eBay par défaut est de 5 000).

## Flux d'affiliation

`FEEDS` est un tableau JSON. Vérifie d'abord que chaque programme autorise la promotion par e-mail. Amazon l'interdit : pas de flux Amazon.

```json
[{"name":"muc-off","url":"https://…/catalogue.csv","delimiter":",","columns":{"id":"SKU","title":"Product Name","url":"Product URL","price":"Price","image":"Image URL","availability":"Stock"},"refreshMinutes":360}]
```

## Données conservées

- Adresse e-mail, critères de l'alerte, dates de création, de confirmation et d'expiration, version du texte de consentement.
- Identifiants des annonces déjà envoyées, pour éviter les doublons. Le titre, le prix et le lien d'une annonce sont effacés dès l'envoi, et une annonce non envoyée sous 6 heures est écartée : l'accord de licence eBay interdit d'afficher des prix de plus de 6 heures.
- Journal des envois sur 48 heures, pour les plafonds anti-abus.
- Désinscription, suppression de la dernière alerte ou expiration : tout est effacé immédiatement.

## Tests

- `npm run test:unit` : tests unitaires (`tests/alertes*.test.ts`), dont des tests de propriétés `fast-check` (jetons, échappement HTML, en-têtes, CSV, prix, adresses) et des tests d'attaque (`tests/alertesDurcissement.test.ts`).
- `npm run build && node tests/alertesE2e.mjs` : test de bout en bout sur le serveur compilé, avec un faux eBay et un faux serveur SMTP (création, confirmation, passage, e-mail, CSRF, limite de débit, désinscription en un clic, service désactivé).

## Avant la mise en production

Le site utilise Astro 4 et `@astrojs/node` 8, qui ont des failles connues (`npm audit` : 1 critique et 24 élevées, toutes présentes avant ce module, qui n'en ajoute aucune). Les alertes ajoutent des pages dynamiques avec des données personnelles : fais d'abord la mise à jour d'Astro dans une branche séparée.
