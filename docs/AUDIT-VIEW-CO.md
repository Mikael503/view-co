# VIEW.co — Documentation de l'audit complet

**Projet :** site one-page VIEW.co — branding, communication & marketing digital
**Type de document :** rapport d'audit + documentation de référence
**Périmètre :** `index.html`, `assets/styles.css`, `assets/main.js`, `assets/*` (images), dossier `tools/`
**Date de l'audit :** novembre 2026
**Statut :** document d'analyse uniquement — aucune ligne de code, de style ou de contenu du site n'a été modifiée pour produire ce rapport.

---

## 0. Comment lire ce document

Chaque constat porte un **statut de preuve** :

| Statut | Signification |
|---|---|
| **Testé** | Comportement reproduit et mesuré dans le navigateur (aperçu local), valeurs chiffrées relevées dans le DOM vivant. |
| **Inspecté** | Vérifié par lecture directe du code source ou des fichiers, sans exécution. |
| **Non vérifiable** | Ne peut pas être établi dans les conditions actuelles (serveur de dev local, pas de production, pas de compte mail, appareils réels non testés). |

Un élément présent à l'écran n'est jamais considéré comme fonctionnel par défaut : il doit être **testé**.

**Environnement de test**

- Serveur statique local Node sur `http://127.0.0.1:4173` (aucune compression, aucun cache, aucun en-tête de sécurité — voir §7).
- Navigateur Chromium du poste, aperçu non focalisé : `scroll-behavior: smooth` et `IntersectionObserver` ne s'exécutent pas normalement. Les mesures ont donc été prises avec `window.scrollTo({behavior:'instant'})` + `dispatchEvent(new Event('scroll'))`, et les blocs `.is-in` forcés dans le DOM vivant pour inspecter les sections basses. **Aucun fichier n'a été modifié pour cela.**
- Machine de test : Intel UHD Graphics 620, WebGL 1 + 2 disponibles, DPR 1,5, 8 cœurs, 8 Go de RAM.

---

## 1. Synthèse exécutive

Le site est **propre, léger et cohérent avec son identité** (noir profond, blanc cassé, géométrie, typographie éditoriale Montserrat). Aucune dépendance, aucun framework, aucun script tiers : 3 fichiers et 5 requêtes pour ~63 Ko.

Il souffre néanmoins de **trois défauts réels** qui doivent être corrigés avant toute animation 3D :

1. **Bloquant — le menu mobile est inutilisable dès qu'on a défilé.** Cause identifiée et reproduite : `backdrop-filter` sur l'en-tête collant crée un bloc conteneur, ce qui casse le `position: fixed` du panneau de navigation.
2. **Bloquant conditionnel — sans JavaScript, 17 des 19 blocs révélés restent invisibles** (`opacity: 0` sans repli).
3. **Majeur — les ancres ne tiennent pas compte de l'en-tête fixe** : `scroll-margin-top` vaut `0px` partout, les titres de section sont masqués à l'arrivée.

Le reste relève de l'optimisation (images surdimensionnées ~10×, graisses de police inutiles, `will-change` permanent, absence d'Open Graph / portfolio / mentions légales).

**Conclusion :** la base est saine et peut accueillir une animation 3D, mais **pas avant** la Phase 1 (correctifs sans impact visuel) et la Phase 2 (poids et rendu). Une scène WebGL unique dans le hero, en monochrome, sur un budget < 150 Ko, est réaliste sur ce matériel.

---

## 2. État général du projet

### 2.1 Inventaire des fichiers

| Fichier | Poids | Rôle | Statut |
|---|---|---|---|
| `index.html` | 17 Ko | Page complète (header, hero, marquee, 5 services, méthode, mission, slogan, contact, footer) | Utilisé |
| `assets/styles.css` | 21,1 Ko | Feuille de style unique | Utilisé |
| `assets/main.js` | 4,5 Ko | IIFE, interactions (header, menu, accordéon, révélations, formulaire, année) | Utilisé |
| `assets/logo.png` | 608×416 | Logo encre (header) | Utilisé |
| `assets/logo-light.png` | 608×416 | Logo clair (hero, footer) | Utilisé |
| `assets/favicon.png` | 64×64 | Favicon + apple-touch-icon | Utilisé |
| `assets/monogramme.png` | 357×633, ~30 Ko | — | **Jamais référencé (code mort)** |
| `assets/monogramme-light.png` | 357×633 | — | **Jamais référencé (code mort)** |
| `assets/source/*.jpg` | — | Photos WhatsApp d'origine | Sources, non servies |
| `tools/make-logo.ps1` | — | Détourage PowerShell du logo | Outil hors production |

**Aucun `package.json`, aucun gestionnaire de paquets, aucune dépendance, aucune bibliothèque d'animation** (pas de GSAP, pas de Three.js, rien). Le site est du HTML/CSS/JS natif.

**Aucun dépôt Git, aucune sauvegarde versionnée.** Conséquence directe : toute intervention doit être manuelle et réversible à la main, ce qui plaide pour des modifications par lots courts et vérifiés.

### 2.2 Structure de la page (ordre réel du document)

1. `a.skip` — lien d'évitement « Aller au contenu »
2. `header.site-header#siteHeader` — logo, `nav#primaryNav` (4 liens + CTA), `button#burger`
3. `main#main`
   - `section.hero#top` — grille 2 colonnes : copie (titre, lead, 2 CTA, méta `dl`) et visuel (tuile noire + logo)
   - `div.marquee` (décoratif, `aria-hidden`)
   - `section.services#services` — colonne sticky + 5 accordéons `.service`
   - `section.method#methode` — 4 `.step`
   - `section.mission#agence` — déclaration, 2 paragraphes, 3 piliers
   - `section.slogan` — « Change the way brands are seen. »
   - `section.contact#contact` — coordonnées + `form#contactForm`
4. `footer.site-footer` — logo clair, nav secondaire, mentions, `#year`

### 2.3 Identité de référence (à préserver)

- **Palette :** `--ink #0a0a0a`, `--ink-soft #1a1a1a`, `--paper #f3f2ee`, `--paper-2 #e9e7e1`, `--muted #6c6b64`, `--muted-light #9b9a93`.
- **Typographie :** Montserrat uniquement, titres en 500, corps en 400, interlettrage négatif sur les grandes tailles (`-0.03em` à `-0.05em`).
- **Logo :** image PNG matricielle fournie, jamais retouchée en 3D ni remplacée par du texte.
- **Contacts réels :** `viewco205@gmail.com`, Instagram `view_co1`, Facebook (lien de partage fourni).
- **Ton :** éditorial, sobre, affirmations courtes, pas de superlatifs.

### 2.4 Hygiène du code (inspecté)

- Aucun secret, aucune clé, aucun token dans les fichiers.
- Aucun `eval`, aucun `innerHTML`, aucun gestionnaire `on*=` inline.
- Aucun ID dupliqué.
- 80 classes utilisées dans le HTML, 81 définies dans le CSS (écart normal : une classe peut être posée dynamiquement).
- 189 règles CSS, 4 media queries (1080 / 860 / 620 px + `prefers-reduced-motion`), 3 `@keyframes` (`underline`, `scroll`, `markIn`).
- JavaScript encapsulé dans une IIFE `"use strict"`, `scroll` en `{ passive: true }`, `IntersectionObserver` avec `unobserve` après révélation.
- `prefers-reduced-motion` correctement pris en compte **dans le CSS** (durées neutralisées, révélations forcées visibles, marquee arrêté).

---

## 3. Audit technique

### 3.1 Poids et requêtes (testé, réseau de l'aperçu)

| Métrique | Valeur |
|---|---|
| Poids total transféré | **~63 Ko** |
| Requêtes | **5** (HTML, CSS, JS, logo clair, favicon ; le logo encre est réutilisé depuis le cache) |
| Nœuds DOM | **267** |
| DOMContentLoaded | **401 ms** |
| `load` | **407 ms** |

Très bon niveau de départ : le budget de la plupart des sites vitrines est déjà respecté, alors même que le serveur de dev n'applique **ni gzip ni cache**.

### 3.2 Chaîne de rendu

- CSS bloquant unique (21 Ko) en `<head>` : correct à cette taille.
- Google Fonts chargé en `<link>` bloquant avec `preconnect` sur `fonts.googleapis.com` et `fonts.gstatic.com` : correct, mais **une requête tierce supplémentaire** et un risque de FOUT (pas de `font-display` contrôlable ici : `&display=swap` est bien présent, donc FOUT assumé et acceptable).
- JavaScript en fin de `<body>`, sans `defer` : sans incidence à cet emplacement, mais un `defer` serait plus explicite.
- Aucune image `loading="lazy"` : inutile ici (5 images, dont 2 visibles immédiatement), mais à revoir si un portfolio est ajouté.

### 3.3 Dépendances et compatibilité

- Aucune dépendance → aucune dette de mise à jour, aucun risque de vulnérabilité transitive.
- API utilisées : `classList`, `FormData`, `IntersectionObserver`, `matchMedia`, `encodeURIComponent`, `URL` implicite via `mailto:`. Toutes disponibles sur les navigateurs modernes (≥ 2019). Aucun polyfill nécessaire.
- `backdrop-filter` : supporté partout sauf Firefox ancien (repli = fond opaque à 82 %, acceptable) — mais voir le défaut **D1**, c'est précisément lui qui casse le menu.
- `:user-invalid` : supporté par les navigateurs récents ; sur les anciens, seule la validation JS s'applique (message rouge), donc pas de régression bloquante.

### 3.4 Accessibilité technique

| Point | État | Preuve |
|---|---|---|
| `lang="fr"` | OK | Inspecté |
| Titre de page unique et descriptif | OK | Inspecté |
| Hiérarchie de titres h1 → h2 → h3 | OK, un seul `h1` | Inspecté |
| Lien d'évitement | OK, visible au focus | Inspecté |
| `alt` sur les images | OK (logo redondant avec le lien, `aria-label` présent) | Inspecté |
| `aria-expanded` / `aria-controls` sur burger et accordéons | OK, synchronisés en JS | Testé |
| `role="status"` + `aria-live="polite"` sur le retour de formulaire | OK | Inspecté |
| Menu fermé encore focusable au clavier | **Défaut** | Testé (voir D4) |
| Cibles tactiles | **Défaut** | Mesuré (voir D5) |
| Focus visible | OK (`:focus-visible` 2 px, offset 3 px) | Inspecté |
| Ordre de tabulation | Cohérent avec l'ordre visuel | Inspecté |

---

## 4. Audit fonctionnel — ce qui marche réellement

### 4.1 Tableau des fonctionnalités

| Fonctionnalité | Statut | Détail de la vérification |
|---|---|---|
| Ancres de navigation (`#services`, `#methode`, `#agence`, `#contact`, `#top`) | **Testé — fonctionne, mais mal positionné** | 0 cible manquante ; l'arrivée laisse le titre sous l'en-tête (D2) |
| En-tête qui change d'état au scroll | **Testé** | `.is-scrolled` ajoutée à `scrollY > 12`, retirée en dessous |
| Menu burger mobile | **Testé — cassé après défilement** | Voir D1 : hauteur du panneau 72 px au lieu de 844 px, liens en `top` négatif, page verrouillée |
| Fermeture du menu (lien, Échap, resize > 860 px) | **Testé — OK à `scrollY = 0`** | Les trois chemins fonctionnent quand le panneau est correctement dimensionné |
| Accordéon services | **Testé — OK** | Un seul panneau ouvert à la fois, `aria-expanded` synchronisé, panneau ouvert mesuré à **265 px**, fermeture du panneau actif possible |
| Révélations au scroll | **Testé — OK avec JS, cassé sans JS** | IntersectionObserver révèle et se désinscrit ; 17/19 blocs invisibles si JS absent (D3) |
| Formulaire — champs vides | **Testé — OK** | Message « Merci de renseigner votre nom, votre email et votre projet. » + classe `is-error` (rouge) |
| Formulaire — envoi réel | **Non vérifié volontairement** | L'envoi déclenche `mailto:` ; le test aurait ouvert un client mail. Code inspecté : sujet et corps correctement encodés via `encodeURIComponent` |
| Lien email du bloc contact | **Inspecté** | `mailto:viewco205@gmail.com` statique, correct |
| Réseaux sociaux | **Inspecté** | `target="_blank"` + `rel="noopener noreferrer"` sur les deux liens |
| Année du footer | **Testé** | Injectée par `new Date().getFullYear()` |
| Lien « Retour en haut » | **Testé** | Cible `#top` valide |
| Console navigateur | **Testé — propre** | Aucune erreur, aucun avertissement |
| Réseau | **Testé — propre** | Aucune requête en échec (hors police si hors ligne) |

### 4.2 Défauts fonctionnels priorisés

#### D1 — Menu mobile inutilisable après défilement (BLOQUANT)

- **Symptôme testé :** en vue ≤ 860 px, dès que `scrollY > 12`, l'ouverture du burger affiche un panneau de **72 px de haut** au lieu de **844 px**, avec les liens positionnés à `top: -156 / -81 / -6 / 69 / 165` px. `body.is-locked` empêche de défiler : la page est figée sur un menu vide.
- **Cause (inspectée) :** `.site-header.is-scrolled` applique `backdrop-filter`. Un filtre crée un **bloc conteneur** ; le `nav` en `position: fixed; inset: 0` se positionne donc par rapport à l'en-tête (72/84 px de haut) et non par rapport à la fenêtre.
- **Preuve du diagnostic :** à `scrollY = 0` (pas de `.is-scrolled`, donc pas de filtre), le panneau mesure bien **844 px** et fonctionne.
- **Correctifs possibles (non appliqués) :** déplacer le `backdrop-filter` sur un pseudo-élément `::before` de l'en-tête ; ou sortir le `nav` du header dans le DOM ; ou déplacer le filtre sur `.site-header__inner`. La première option est la moins invasive.

#### D2 — Les ancres passent sous l'en-tête fixe (MAJEUR)

- **Mesuré :** `scroll-margin-top` = **0 px** sur toutes les sections ; en-tête de **84 px** (desktop) / **73 px** (mobile).
- **Conséquence :** après un clic sur « Services » ou « Méthode », le titre de section est partiellement ou totalement caché.
- **Correctif :** `scroll-margin-top: calc(var(--header-h) + 16px)` sur les cibles d'ancre (ou sur `section[id]`).

#### D3 — Contenu invisible sans JavaScript (MAJEUR)

- **Mesuré :** `[data-reveal] { opacity: 0 }` s'applique à **19 blocs** ; le JS en révèle 19, mais **sans JS, 17 restent invisibles** (seuls le hero et un bloc au-dessus de la ligne de flottaison échappent au problème selon la position).
- **Conséquence :** page à moitié vide pour un crawler qui n'exécute pas JS, pour un blocage de script, ou en cas d'erreur JS.
- **Correctif :** classe `js` posée par un script inline très tôt dans `<head>`, et règle `[data-reveal]` conditionnée à `.js` — le contenu est alors visible par défaut.

#### D4 — Menu fermé encore focusable (MODÉRÉ)

- **Testé :** avec `opacity: 0; pointer-events: none`, les 5 liens du menu restent dans l'ordre de tabulation. Au clavier, le focus part dans un menu invisible.
- **Correctif :** `inert` + `aria-hidden="true"` sur le `nav` fermé (ou `visibility: hidden` en complément de l'opacité), retirés à l'ouverture.

#### D5 — Cibles tactiles trop petites (MODÉRÉ)

- **Mesuré :** liens de navigation desktop 20–25 px de haut, liens du footer ~19 px, pastilles `.tags` ~26 px.
- **Référence :** 44 × 44 px (WCAG 2.5.5 / Apple HIG).
- **Correctif :** padding vertical sur `.nav > a`, `.site-footer__nav a`, et hauteur minimale des pastilles sur mobile.

#### D6 — Aucune présence hors du viewport (MAJEUR, produit)

- Pas de **portfolio / réalisations**, alors que c'est la preuve attendue d'une agence branding.
- Pas de **mentions légales** ni de **politique de confidentialité** (obligatoires pour un site français, même vitrine, dès qu'un formulaire existe).
- Pas d'**Open Graph / Twitter Card** : aucun aperçu riche au partage.
- Pas de `robots.txt` ni de `sitemap.xml`.

#### D7 — Formulaire non fiable (MODÉRÉ)

- Le formulaire dépend entièrement de `mailto:` : si aucun client mail n'est configuré (très fréquent sur mobile et sur poste bureau), **la demande est perdue** et le message de succès s'affiche quand même.
- Aucune conservation, aucune confirmation côté serveur, aucun anti-spam.
- Pas de marquage `required` sur les champs : l'utilisateur ne découvre l'exigence qu'après soumission.

---

## 5. Audit visuel et UX

### 5.1 Grille, rythme, composition

- Largeur maximale 1480 px, gouttières `clamp(20px, 5vw, 72px)` : composition large et respirante, cohérente à toutes les tailles.
- Alternance clair / sombre maîtrisée : hero clair → marquee noir → services clairs → méthode claire → mission noire → slogan clair → contact clair → footer noir. Bon rythme de lecture.
- Grille hero 1,12 / 0,62 avec `align-items: end` : le visuel noir s'aligne sur la base du texte, effet éditorial souhaitable.
- Colonne « Services » en `position: sticky` : correct sur desktop, neutralisée à ≤ 1080 px.

### 5.2 Typographie

- Montserrat en une seule famille, trois usages distincts (display 500, corps 400, labels uppercase 0,72 rem à `letter-spacing: 0.22em`) : identité nette.
- Grands titres en `letter-spacing` négatif : lisible, contemporain, sans effet « gratuit ».
- **Défaut mesuré :** le `<link>` Google Fonts demande les graisses **300, 400, 500, 600, 700**, mais l'interface n'utilise réellement que **400 et 500** ; le navigateur ne charge que ces deux fichiers. Les graisses 300/600/700 sont demandées pour rien (poids de la CSS distante et consigne inutile).

### 5.3 Couleurs et contrastes (mesurés)

| Combinaison | Rapport | Verdict |
|---|---|---|
| `#6c6b64` sur `#f3f2ee` (texte secondaire) | **4,78 : 1** | Conforme AA (texte normal) |
| `#0a0a0a` sur `#f3f2ee` (texte principal) | > 17 : 1 | Excellent |
| Blanc cassé sur bouton noir (CTA principal) | **17,7 : 1** | Excellent |
| `rgba(243,242,238,0.55)` sur noir (légende du visuel hero) | ≈ 5,6 : 1 calculé | Limite mais conforme pour du texte décoratif |
| `rgba(243,242,238,0.5)` sur noir (bas de footer) | ≈ 5,2 : 1 | Conforme, à surveiller si le texte rapetisse |

Aucun texte porteur d'information ne tombe sous le seuil AA.

### 5.4 Animations existantes (inventaire)

| Animation | Déclencheur | Durée / easing | Remarque |
|---|---|---|---|
| Soulignement du mot « seen. » | Chargement | 1 s, délai 0,65 s, `--ease` | `@keyframes underline`, `scaleX` |
| Entrée du logo dans la tuile | Chargement | 1,2 s, délai 0,2 s | `markIn` (opacité + translation + échelle) |
| Marquee | Boucle infinie | 34 s linéaire | Pause au survol, coupé en `prefers-reduced-motion` |
| Apparitions `[data-reveal]` | IntersectionObserver | 0,85 s, décalage `--d` par étape (0 → 0,24 s) | `will-change` permanent (voir §6) |
| Accordéon services | Clic | 0,5 s sur `grid-template-rows` | Technique moderne, sans mesure de hauteur en JS |
| Micro-interactions | Survol | 0,3–0,4 s | Flèche des boutons, soulignés de nav, croix des services |

**Cohérence :** toutes les animations partagent le même easing `cubic-bezier(0.22, 0.7, 0.2, 1)` et une grammaire sobre (translation courte, opacité, échelle légère). C'est un bon socle pour greffer de la 3D sans dissonance.

### 5.5 UX — points forts / points faibles

**Fort :** hiérarchie évidente, CTA « Démarrer un projet » répété trois fois, formulaire court, retour d'erreur explicite, aucune pop-up, aucune surcharge.

**Faible :** pas de portfolio (crédibilité), pas de preuve chiffrée ni de témoignage, menu mobile cassé (D1), ancres masquées (D2), retour de formulaire fragile (D7), absence de page de mentions légales.

---

## 6. Audit responsive (mesuré)

### 6.1 Méthode

Cinq largeurs testées : **390, 768, 1024, 1440, 1920 px**. Mesures relevées en `preview_evaluate` (les captures sont agrandies ~1,5× et recadrées : elles ne servent qu'à l'appréciation visuelle, jamais à la mesure).

### 6.2 Résultats

| Largeur | h1 calculé | Lignes du h1 | Débordement horizontal | Points de rupture actifs |
|---|---|---|---|---|
| 390 px | **40,95 px** | 2 | Aucun | 620 + 860 |
| 768 px | **52,99 px** | 2 | Aucun | 860 |
| 1024 px | **70,66 px** | 2 | Aucun | 1080 |
| 1440 px | **99,36 px** | 2 | Aucun | aucun |
| 1920 px | **100,8 px** | 2 | Aucun | aucun (plafond `clamp`) |

- **Aucun débordement horizontal** à aucune largeur : `overflow-x: hidden` sur `body` masque un éventuel résidu, mais les mesures de `scrollWidth` confirment l'absence de contenu coupé.
- Le titre tient sur **deux lignes partout**, ce qui est exactement la composition prévue (deux `<span>`).
- **Tuile hero à 1024 px : 905 × 622 px** — la bascule en `aspect-ratio: 16/11` au-dessus de 1080 px donne une tuile très large, presque aussi haute que la moitié de l'écran. À surveiller si une scène 3D y est intégrée (budget de pixels important).
- Empilements corrects : hero, services, étapes (4 → 2 → 1), piliers, formulaire (2 → 1), footer.
- `--header-h` passe de 84 à 72 px sous 860 px, et l'en-tête reste fixe.

### 6.3 Limites de l'audit responsive

- Non testé sur **appareils physiques** (encoches, barres d'URL mobiles, `dvh`).
- Non testé en **orientation paysage** sur petit mobile (hauteur < 400 px), où le menu plein écran pourrait déborder.
- Le zoom navigateur à 200 % n'a pas été testé (le layout est en `rem`/`clamp`, donc a priori robuste).

---

## 7. Audit performance

### 7.1 Mesures

| Indicateur | Valeur | Commentaire |
|---|---|---|
| Poids | ~63 Ko | Excellent |
| Requêtes | 5 | Excellent |
| DCL / load | 401 / 407 ms | Correct sur serveur local sans cache |
| Nœuds DOM | 267 | Très raisonnable |
| `will-change` permanent | **19 éléments** | Voir 7.3 |
| Logo affiché | **61 × 42 px** pour un fichier **608 × 416** | **~10× la taille utile** |
| Graisses de police | 300/600/700 demandées, 2 chargées | Requête distante inutilement lourde |
| Images non utilisées | 2 monogrammes, **~30 Ko** | Poids mort dans le dossier |

### 7.2 Points d'optimisation

1. **Images :** servir le logo à sa taille d'affichage (ou en `srcset` 1x/2x), et fournir le logo en **SVG** si le fichier vectoriel existe — gain immédiat de plusieurs dizaines de Ko et netteté parfaite. `width`/`height` sont déjà présents (bon point : pas de décalage de mise en page).
2. **Polices :** ne demander que `wght@400;500` ; envisager l'auto-hébergement (`woff2`) pour supprimer deux connexions tierces et gagner en confidentialité.
3. **`backdrop-filter` :** coûteux à chaque frame de défilement sur GPU intégré. À conserver visuellement, mais avec parcimonie (voir D1 pour la correction structurelle).
4. **`will-change` :** appliqué en permanence sur 19 éléments, ce qui force des couches de composition et consomme de la mémoire GPU. À réserver au moment de l'animation (`will-change` posé puis retiré), ou à supprimer au profit de `transform`/`opacity` seuls.
5. **Minification / compression :** absentes du serveur de dev ; à activer côté hébergement (gzip/brotli + `Cache-Control` long sur `assets/`, HTML en `no-cache`).
6. **CSS inutilisé :** faible (189 règles pour une page qui les utilise toutes ou presque) ; pas de chantier prioritaire.

### 7.3 Capacité matérielle pour la 3D (mesurée)

| Élément | Valeur |
|---|---|
| GPU | Intel UHD Graphics 620 (intégré) |
| WebGL | 1 **et** 2 disponibles |
| DPR | 1,5 |
| Cœurs | 8 |
| RAM | 8 Go |

**Lecture :** la 3D temps réel est possible, mais sur un GPU intégré. Le budget réaliste est une scène **unique**, géométrie simple, matériaux sans transmission ni réfraction, **≤ 50 k triangles**, **≤ 1,5 M pixels rendus** (limiter le DPR à 1,5 max, idéalement 1,25 dans la tuile), pas de post-traitement lourd, `requestAnimationFrame` coupé hors viewport et sous `prefers-reduced-motion`.

---

## 8. Audit sécurité

### 8.1 Surface d'attaque

| Élément | État |
|---|---|
| Backend / API | **Aucun** — site 100 % statique |
| Base de données | Aucune |
| Cookies / stockage | Aucun |
| Authentification | Aucune |
| Scripts tiers | Uniquement Google Fonts (CSS) |
| Secrets dans le code | **Aucun** |
| `eval` / `innerHTML` / `document.write` | **Aucun** |
| Gestionnaires inline `on*=` | **Aucun** |
| Injection possible via le formulaire | **Non** : les valeurs sont seulement concaténées puis encodées par `encodeURIComponent` vers un `mailto:` — aucun rendu HTML |
| `target="_blank"` sans protection | **Non** : `rel="noopener noreferrer"` présent |
| Identifiants dupliqués | Aucun |

### 8.2 En-têtes (serveur de développement — mesuré)

Le serveur statique local n'envoie **ni CSP, ni HSTS, ni `X-Content-Type-Options`, ni `Referrer-Policy`, ni `Permissions-Policy`, ni compression, ni cache**. C'est normal pour un serveur de dev, mais **cela devra être configuré à l'hébergement** :

```
Content-Security-Policy: default-src 'self'; img-src 'self' data:; style-src 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; script-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

`form-action 'none'` est cohérent avec l'absence de soumission serveur ; à ajuster si un vrai endpoint est ajouté plus tard.

### 8.3 Données personnelles

- Le formulaire collecte nom, email, entreprise, besoin, message — **transmis par le client mail de l'utilisateur**, jamais stockés par le site. Risque de fuite faible, mais **obligation d'information** : mentions légales + politique de confidentialité manquantes (D6).
- Aucun outil analytique, aucun cookie → **pas de bandeau de consentement nécessaire aujourd'hui**. Toute ajout d'analytics (même « privacy-friendly ») devra être documenté.
- Google Fonts implique un transfert d'IP vers Google (jurisprudence UE) : l'auto-hébergement des polices supprime ce point.

---

## 9. Étude d'intégration GetLayers AI

### 9.1 Ce que propose GetLayers

| Ressource | Nature | Pertinence pour VIEW.co |
|---|---|---|
| Bibliothèque de prompts / templates | Scènes 3D WebGL temps réel, sections, héros | **Élevée** — point de départ pour le hero |
| Scènes exportées | Rendu WebGL autonome (souvent React / Three.js) | Moyenne — le site n'a **aucun build** |
| Fonds vidéo 4K + poster | Boucles vidéo | Faible ici — coût de bande passante élevé, hors identité |
| Gradients WebGL | Fonds animés légers | Moyenne — alternative pauvre en intérêt pour cette marque |
| Image Motion | Effet de profondeur sur image (React + react-spring) | **Élevée si** le logo ou une photo devient un plan animé, mais implique une stack React |
| SVG to 3D | Extrusion de tracés | **À éviter** : le logo est un **PNG matriciel**, l'extrusion produirait un résultat approximatif et trahirait l'identité |
| MCP | Intégration outillée | Sans objet pour un site statique |

### 9.2 Contrainte structurante : le site n'a pas de build

Le projet est en HTML/CSS/JS natif, sans `package.json`. Deux voies, à arbitrer **avant** toute intégration :

| Voie | Avantages | Inconvénients |
|---|---|---|
| **A. Rester sans build** — Three.js copié en ESM local (`assets/vendor/three.module.js`), import map dans le HTML | Aucune chaîne d'outils, déploiement inchangé, zéro dépendance à maintenir, cohérent avec l'esprit du projet | Three.js complet ~600 Ko non minifié (ou ~150 Ko minifié) ; code de scène écrit à la main ; pas de HMR |
| **B. Passer à Vite** | Bundle tree-shaké (Three.js utile ≈ 80–120 Ko), modules, HMR, minification, hashing | Introduit `node_modules`, un build à maintenir, une étape de déploiement ; change la nature du projet |

**Recommandation sous réserve de validation :** voie **A** avec un Three.js minimal chargé uniquement dans le hero (import map + modules ciblés), afin de préserver la simplicité actuelle. La voie B ne se justifie que si le portfolio et plusieurs scènes 3D arrivent.

### 9.3 Recommandation par section (A → E)

#### A. Hero — scène 3D monochrome (recommandé, pilote)

- **Concept :** une seule scène WebGL dans la tuile noire existante (`.hero__visual`), en **noir et blanc cassé uniquement** : un objet géométrique simple (grille déformée, monolithe en rotation lente, ou particules structurées) qui réagit très légèrement au curseur.
- **Le logo reste un `<img>` HTML** par-dessus la scène, jamais extrudé ni remplacé.
- **Budget :** ≤ 50 k triangles, ≤ 150 Ko de JS, DPR plafonné (1,25–1,5), aucun post-traitement, pause hors viewport, désactivation sous `prefers-reduced-motion` (image statique de repli = la tuile actuelle).
- **Coût :** 1 à 2 jours (scène + intégration + repli + tests).
- **Risque mobile :** maîtrisé si le rendu est plafonné et la scène unique. C'est le seul endroit où la 3D apporte quelque chose.

#### B. Section « Agence / Mission » — fond animé discret (optionnel)

- **Concept :** dégradé WebGL très lent ou trame de points en mouvement à peine perceptible, sur le noir existant.
- **Verdict :** **non recommandé dans un premier temps.** La section fonctionne par sa typographie ; une animation de fond dilue le propos et coûte des frames sur une zone très haute (potentiellement plein écran).
- **Alternative sans WebGL :** un `radial-gradient` animé en CSS, coût quasi nul.

#### C. Services — pas de WebGL

- **Concept :** la 3D n'apporte rien à un accordéon de texte. Le mouvement utile est déjà là (ouverture, croix, translation du nom).
- **Recommandation :** **CSS 3D uniquement** — légère rotation `rotateX/rotateY` à l'ouverture du panneau, ou parallaxe de 4–6 px sur les numéros. Coût : quelques lignes de CSS, zéro JS.

#### D. Portfolio (à créer) — CSS 3D + éventuellement Image Motion

- **Concept :** cartes en perspective (`transform-style: preserve-3d`, `rotateY` faible au survol), transitions de projet en fondu/scale.
- **Verdict :** **CSS 3D suffit** pour un rendu premium. Réserver GetLayers Image Motion à une éventuelle vue projet immersive, et seulement si la voie B (build) est choisie.
- **Prérequis :** le portfolio n'existe pas encore — c'est un chantier de contenu avant d'être un chantier technique.

#### E. Transitions entre sections — sobriété

- **Concept :** conserver la grammaire actuelle (opacité + translation 22 px, easing unique). Ajouter au maximum un parallaxe très faible sur le slogan.
- **Verdict :** **pas de 3D ici.** Les transitions doivent rester invisibles en tant qu'effet.

### 9.4 Ce qu'il ne faut pas faire

- Pas d'extrusion 3D du logo PNG (perte de fidélité, identité trahie).
- Pas de shader plein écran ni de scène plein viewport (coût GPU intégré, benefice nul).
- Pas de son, pas d'animation au scroll déclenchant des re-renders coûteux.
- Pas de deuxième scène 3D : une seule, dans le hero.

---

## 10. Plan d'action progressif

### 10.1 Priorisation

| Priorité | Contenu | Objectif |
|---|---|---|
| **P0 — bloquant** | D1 (menu mobile), D3 (contenu sans JS) | Le site redevient utilisable et robuste |
| **P1 — majeur** | D2 (ancres), D4 (menu focusable), D6 partiel (Open Graph, robots, sitemap), D5 (cibles tactiles) | Qualité perçue et référencement de base |
| **P2 — important** | Images responsive, graisses de police, `will-change`, minification/cache, D7 (formulaire fiable), portfolio, mentions légales | Poids, fiabilité, crédibilité commerciale |
| **P3 — évolution** | Pilote 3D hero, puis CSS 3D services/portfolio | Animation premium, sans régression |

### 10.2 Phases de réalisation

**Phase 1 — Correctifs sans changement visuel**
1. D1 : déplacer le `backdrop-filter` sur `::before` (ou sortir le `nav` du header).
2. D2 : `scroll-margin-top: calc(var(--header-h) + 16px)` sur les sections ciblées.
3. D3 : classe `js` + repli sans JS des `[data-reveal]`.
4. D4 : `inert` / `aria-hidden` sur le menu fermé.
5. D5 : cibles tactiles ≥ 44 px.
6. Open Graph, `robots.txt`, `sitemap.xml`.
*Critère de sortie : aucun changement perceptible sur desktop ; menu mobile fonctionnel à `scrollY = 0` **et** après défilement ; page lisible JS désactivé.*

**Phase 2 — Poids et rendu**
1. Logo en `srcset` 1x/2x (ou SVG si disponible) ; suppression des monogrammes non utilisés du dossier servi.
2. `wght@400;500` seulement ; envisager l'auto-hébergement.
3. `will-change` posé/retiré au moment de l'animation.
4. Minification CSS/JS et en-têtes de cache/compression côté hébergement.
*Critère de sortie : poids initial réduit, aucune régression de rendu, 60 fps au défilement.*

**Phase 3 — Contenu et fiabilité**
1. Portfolio / réalisations (grille + pages ou vues projet).
2. Mentions légales + politique de confidentialité.
3. Formulaire fiable (endpoint ou service tiers) ou avertissement explicite du fonctionnement `mailto:`.

**Phase 4 — Pilote 3D (hero uniquement)**
1. Choix de la voie (sans build vs Vite) — **décision à valider par le client.**
2. Scène monochrome, logo HTML préservé, repli statique, `prefers-reduced-motion`.
3. Mesure avant/après : FPS, mémoire GPU, poids JS, temps d'interaction.

**Phase 5 — Extension conditionnelle**
CSS 3D sur services et portfolio **seulement si** la Phase 4 est jugée concluante (rendu, fluidité, absence de régression sur GPU intégré).

---

## 11. Ce qui est testé, inspecté, non vérifiable

| Élément | Statut |
|---|---|
| Menu mobile après défilement (D1) | **Testé** — reproduit et mesuré |
| Ancres masquées (D2) | **Testé** — `scroll-margin-top: 0px` relevé |
| Blocs invisibles sans JS (D3) | **Testé** — 17/19 mesurés |
| Menu fermé focusable (D4) | **Testé** |
| Cibles tactiles (D5) | **Mesuré** |
| Accordéon, validation vide, année, Échap, resize | **Testé** |
| Console et réseau propres | **Testé** |
| Responsive 390 / 768 / 1024 / 1440 / 1920 | **Testé** (mesures DOM) |
| Contrastes | **Mesuré** (calcul) |
| Poids, requêtes, DCL, nœuds | **Testé** (panneau réseau) |
| Capacités WebGL | **Testé** (`getContext`, `renderer.capabilities`) |
| Envoi réel du formulaire | **Non vérifié** (volontairement) |
| Rendu sur appareils physiques | **Non vérifiable ici** |
| Comportement en production (CDN, compression, cache, en-têtes) | **Non vérifiable** — pas de déploiement |
| Référencement réel / indexation | **Non vérifiable** |
| Compatibilité Safari / Firefox réels | **Non testée** (Chromium uniquement) |

---

## 12. Décisions en attente

1. **Validation de ce rapport** avant toute modification.
2. **Voie technique pour la 3D :** rester sans build (Three.js ESM local) ou passer à Vite. Cette décision conditionne les Phases 4 et 5.
3. **Priorité produit :** portfolio avant 3D ? Mentions légales avant tout le reste ? Le plan ci-dessus les place en Phase 3, mais l'ordre commercial peut différer.

---

## Annexe A — Commandes et mesures utiles pour reproduire l'audit

```js
// Reproduire D1 (menu mobile) : vue ≤ 860 px
window.scrollTo({ top: 200, behavior: 'instant' });
document.getElementById('siteHeader').classList.contains('is-scrolled'); // true
document.getElementById('burger').click();
document.getElementById('primaryNav').getBoundingClientRect().height;      // 72 (au lieu de 844)
[...document.querySelectorAll('#primaryNav a')].map(a => a.getBoundingClientRect().top); // valeurs négatives

// Reproduire D2
getComputedStyle(document.getElementById('services')).scrollMarginTop;     // "0px"

// Reproduire D3 : désactiver JS puis recharger — ou compter les blocs
document.querySelectorAll('[data-reveal]').length;                         // 19
document.querySelectorAll('[data-reveal]:not(.is-in)').length;             // 17 hors viewport

// Reproduire D5
[...document.querySelectorAll('.nav > a, .site-footer__nav a, .tags li')]
  .map(el => el.getBoundingClientRect().height);                          // 19–26 px
```

## Annexe B — Fichiers de référence

- `index.html` — structure complète de la page.
- `assets/styles.css` — variables, header (`backdrop-filter`), `[data-reveal]`, media queries 1080/860/620, `prefers-reduced-motion`.
- `assets/main.js` — `CONTACT_EMAIL`, header `>12`, burger/nav `is-open` + `is-locked`, accordéon, IntersectionObserver, `mailto:`, année.
- `assets/logo.png`, `assets/logo-light.png`, `assets/favicon.png` — utilisés.
- `assets/monogramme.png`, `assets/monogramme-light.png` — non référencés.
- `tools/make-logo.ps1` — détourage du logo, hors production.

---

*Document produit sans aucune modification du site : ni composant supprimé, ni dépendance installée, ni style changé, ni intégration 3D commencée.*
