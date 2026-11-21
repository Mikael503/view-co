# VIEW.co — Documentation technique et audit

**Projet :** site one-page VIEW.co (branding, communication, marketing digital)
**Fichier d'entrée :** `index.html`
**Audit réalisé le :** 21 novembre 2026
**Périmètre :** intégralité du code livré (`index.html`, `assets/styles.css`, `assets/main.js`, `assets/scene.js`, `assets/fonts/`)
**Méthode :** lecture complète du code, `node --check`, mesures dans le navigateur (DOM, ressources, contrastes), comparaison des sources citées §6.

---

## 1. Résumé

Le site est **sain techniquement** : aucune erreur console, aucun lien mort, aucun identifiant dupliqué, contrastes conformes AA, 7 requêtes réseau, ~99 Ko transférés sans compression (~26 Ko avec gzip), 343 nœuds DOM.

Les manques ne sont pas des défauts de code mais des **contenus absents** (réalisations, offre, équipe, mentions légales) et des **détails de finition** : préchargement de la fonte, piège de focus du menu mobile, attributs d'erreur du formulaire.

Sur les bibliothèques demandées (§6) : GetLayers, React Bits, Magic UI, Aceternity et 21st.dev produisent du **React/Next.js + Tailwind**. Aucune ne s'intègre à ce projet sans changer de stack. Ce qui est réellement réutilisable, c'est leur **répertoire d'effets**, reproductibles en CSS/JS natif pour quelques centaines d'octets (§8).

---

## 2. État des lieux

### 2.1 Stack

| Élément | Valeur |
|---|---|
| Type | Site statique, une page, sans build |
| HTML | 1 fichier, 482 lignes |
| CSS | 1 fichier, 846 lignes, variables CSS, aucune dépendance |
| JS | 2 fichiers autonomes (interactions + scène WebGL écrite à la main) |
| Fonte | Montserrat variable auto-hébergée (WOFF2, 400–500, sous-ensemble latin) + `OFL.txt` |
| Responsive | 3 points de rupture : 1080, 860, 620 px |
| Thème | clair uniquement, assumé |

### 2.2 Poids réel

| Fichier | Brut | gzip |
|---|---:|---:|
| `index.html` | 25 384 o | 5 784 o |
| `assets/styles.css` | 24 079 o | 5 829 o |
| `assets/main.js` | 6 738 o | 2 250 o |
| `assets/scene.js` | 8 700 o | 3 139 o |
| `assets/fonts/montserrat-latin.woff2` | 37 956 o | — (déjà compressé) |
| `assets/og-image.png` | 24 306 o | — |
| `assets/logo.png` | 17 082 o | 14 894 o |
| **Total servi** (page + CSS + 2 JS + fonte + 3 logos) | **124 810 o** | **~26 Ko** hors images |

Budget tenu : la page entière pèse moins qu'une seule image de hero classique.

---

## 3. Audit du code

### 3.1 HTML et structure — conforme

| Vérification | Résultat mesuré |
|---|---|
| `lang` | `fr` |
| Titre | « VIEW.co — Branding, communication & marketing digital » |
| Description | 164 caractères (limite recommandée : 160 — sans conséquence) |
| Titres | **1 seul H1**, puis H2 (services, méthode, contact) et H3 (étapes) — aucune marche sautée |
| Repères | `header`, 2 × `nav`, `main`, `footer` |
| Identifiants | **0 doublon** |
| Ancres internes | **0 lien mort** (toutes les cibles `#…` existent) |
| Images | 3 images, **toutes avec `alt`** |
| Liens `target="_blank"` | **0 sans `rel="noopener"`** |
| Liens et boutons sans nom accessible | **0** |
| Champs de formulaire | **0 champ sans `<label>`** |
| Structure sémantique | accordéons en `button` + `aria-expanded` + `aria-controls`, étapes en `ol`, coordonnées en `ul` |

Points d'attention :
- Le lien d'évitement (`Aller au contenu`) existe et se révèle au focus.
- Le panneau des services est masqué par `grid-template-rows: 0fr` ; c'est le JS qui ajoute `inert` + `aria-hidden`. **Sans JS**, un seul panneau (le premier) reste ouvert et les autres ne peuvent pas être dépliés : c'est un repli acceptable, pas une perte de contenu.

### 3.2 CSS — conforme

- Variables centralisées (`--ink`, `--paper`, `--muted`, `--pad`, `--maxw`, `--ease`), aucune valeur magique dispersée.
- `text-wrap: balance` sur les seuls titres.
- `prefers-reduced-motion` neutralise marquee, soulignement animé, révélations et scène WebGL.
- `overflow-x: hidden` sur `body` : masque d'éventuels débordements plutôt que de les corriger — à garder en tête lors d'ajouts.
- Aucun `!important` hors du bloc `prefers-reduced-motion`.
- 24 Ko non minifié : inutile de minifier à ce stade.

Mesure de débordement : `scrollWidth` 1 423 px pour une fenêtre de 1 440 px (barre de défilement), et 373 px pour 390 px en mobile. **Aucun débordement horizontal.**

### 3.3 JavaScript — conforme

- `node --check` : **OK** sur `main.js` et `scene.js`.
- Modules en IIFE, `"use strict"`, aucune variable globale fuitée.
- Écouteur de défilement en `{ passive: true }`.
- Accordéon : un seul panneau ouvert, `aria-expanded` synchronisé, `inert` + `aria-hidden` sur les panneaux fermés.
- Menu mobile : `inert` sur la navigation fermée, `Échap` referme, focus rendu au bouton, verrou de défilement (`body.is-locked`).
- Formulaire : validation email par expression régulière, messages honnêtes (aucun « message envoyé » mensonger), champs conservés en cas d'absence de client mail, `role="status"` + `aria-live="polite"`.
- Scène WebGL : DPR plafonné à 1,5, pause hors viewport, pause onglet masqué, reprise après perte de contexte, repli silencieux sans WebGL.

**Manque réel (a11y)** : à l'ouverture du menu mobile, le focus peut sortir du panneau vers le contenu situé derrière (le fond n'est pas piégé ; seul le défilement est verrouillé). À corriger en priorité basse (§8, chantier 2).

### 3.4 Accessibilité — contrastes mesurés

Ratios calculés dans le navigateur (WCAG 2.1, seuil AA = 4,5:1 pour le texte normal, 3:1 pour le grand texte) :

| Texte | Ratio | Verdict |
|---|---:|---|
| Corps `#0a0a0a` sur `#f3f2ee` | 17,67:1 | AAA |
| Lead du hero `#3c3b36` | 10,02:1 | AAA |
| Texte des panneaux `#46453f` | 8,59:1 | AAA |
| Paragraphes de la section Agence (66 % sur noir) | 7,86:1 | AAA |
| Piliers (55 % sur noir) | 5,70:1 | AA |
| Bas de pied de page (50 % sur noir) | 4,87:1 | AA |
| Texte discret `--muted #6c6b64` (labels, intro, tags) | 4,78:1 | AA (juste) |

Le point le plus fragile est `--muted` à 4,78:1 : toute modification de `--muted` ou du fond doit être re-vérifiée. Les cibles tactiles sont à 44 px sur mobile (bouton burger, liens de contact, liens du pied de page).

### 3.5 Performance — mesures locales

| Mesure | Valeur |
|---|---|
| Requêtes réseau | **7** (HTML, CSS, 2 JS, fonte, 2 logos — 3 logos au total avec celui du pied de page) |
| Poids transféré | 99 Ko sans compression / **~26 Ko avec gzip** (hors images) |
| `DOMContentLoaded` | 628 ms |
| `load` | 637 ms |
| Fonte | 1 requête, `Montserrat 400 500` chargée, `font-display: swap` actif |
| Requêtes tierces | **Aucune** (les seules URL externes sont les 4 liens de contact) |
| Nœuds DOM | 343 |

Ces chiffres proviennent d'un serveur de développement local **sans compression ni cache** ; en production (gzip/brotli + en-têtes de cache), le `load` sera dominé par la fonte.

Optimisations possibles, par ordre de gain :
1. **Précharger la fonte** : elle est découverte après le CSS (426 ms de latence de requête mesurée ici). Un `<link rel="preload">` supprime cet aller-retour.
2. **Servir `logo.png` en AVIF/WebP** avec `srcset` : 17 Ko → ~5–8 Ko (estimation), et un rendu plus net sur écran HiDPI.
3. `decoding="async"` et `loading="lazy"` sur le logo du pied de page.

### 3.6 SEO et partage — partiel, dépend du domaine

Présent : titre, description, Open Graph complet (`og:type`, `site_name`, `locale`, `title`, `description`, image 1200×630 + dimensions + alt), Twitter Card `summary_large_image`, favicon, `apple-touch-icon`, `theme-color`.

Manquant, **impossible sans domaine définitif** :
- `og:url`, `canonical`, `og:image` en URL absolue — aujourd'hui relatifs, donc invalides pour la plupart des robots sociaux ;
- `sitemap.xml`, `robots.txt` ;
- données structurées JSON-LD `Organization` (exige une URL et un logo absolus).

### 3.7 Sécurité — conforme pour un site statique

- Aucun secret, jeton ou clé dans le code ou dans les assets.
- Aucun formulaire envoyé à un tiers : `mailto:` uniquement, donc aucune donnée collectée côté serveur, aucun risque d'injection.
- Aucun script tiers, donc surface d'attaque quasi nulle.
- Recommandation de déploiement : en-têtes `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`. La CSP de `docs/AUDIT-VIEW-CO.md` mentionne encore `fonts.googleapis.com` : **obsolète**, les fontes sont locales.

### 3.8 Contenu — les vrais manques

- Section **Réalisations** absente (aucun projet, visuel, année ni contexte fourni).
- **Offre** et tarifs absents (aucun cadrage commercial fourni).
- **Équipe** absente (aucune photo ni rôle).
- **Mentions légales / confidentialité** absentes (raison sociale, SIRET, hébergeur inconnus).
- Contact : email et réseaux réels, **WhatsApp avec un numéro fictif** (`+33 6 39 98 00 00`, plage réservée à la fiction) — à remplacer avant mise en ligne.
- Le formulaire n'envoie rien : il prépare un email dans la messagerie du visiteur. C'est assumé et annoncé dans le message de confirmation.

---

## 4. Ce que le site fait déjà bien (à ne pas casser)

1. Identité forte et cohérente : monochrome, Montserrat, grandes typographies, respiration.
2. Une seule scène 3D, lente, monochrome, derrière le logo — 8,7 Ko, sans dépendance.
3. Accordéons accessibles (état, focus, `inert`).
4. Marquee déjà présent (équivalent natif de `Marquee` de React Bits, en 12 lignes de CSS).
5. Révélations au défilement sobres (IntersectionObserver + CSS).
6. Formulaire honnête : aucune promesse d'envoi non tenue.
7. Zéro requête tierce, zéro police distante, zéro cookie.

---

## 5. Méthode de comparaison

Chaque source a été examinée sur trois critères **décisifs dans ce projet** :

1. **Compatibilité** : le livrable est-il du HTML/CSS/JS natif, ou du React/Next.js ?
2. **Coût** : poids ajouté, dépendances, étape de build.
3. **Identité** : l'effet sert-il la marque (éditoriale, monochrome, typographique) ou la contredit-il ?

Règle de décision retenue : **aucune dépendance ajoutée pour un effet reproductible en moins de 1 Ko**. Le projet a déjà refusé Three.js (150 Ko) pour une scène de 8,7 Ko — la même logique s'applique ici.

---

## 6. Les sources demandées, examinées

> Prix et licences relevés en novembre 2026 sur les sites officiels ; ils changent régulièrement, à re-vérifier avant achat.

### 6.1 GetLayers AI — getlayers.ai

**Nature :** bibliothèque de « layers » (templates de landing pages, scènes 3D, sections, fonds, dégradés) livrées sous forme de **prompts** à coller dans un agent IA. Le code produit est du **Next.js**, reconstructible dans d'autres stacks par l'agent. Licence commerciale incluse, offres gratuites ponctuelles + accès illimité payant. Outils gratuits dans le navigateur (Text Animations, Particle Forms, Image Motion, Liquid Colour, Shader Backgrounds) et plugin Figma.

**Verdict :** rien n'est déposable tel quel dans un site sans build. Utile comme **direction artistique** et comme réservoir d'idées de scènes/fonds. Les outils de réglage (dégradés, shaders) servent à prototyper un effet qu'on réécrit ensuite à la main.

### 6.2 React Bits — reactbits.dev

**Nature :** 216 composants animés gratuits et open source, en **React** (4 variantes : JS/TS × CSS/Tailwind), installables par CLI (`jsrepo`, shadcn). Catégories : Text Animations (33), Animations (38), Components (48), Micro (34), Backgrounds (63). Dépendances variables selon le composant : GSAP, Motion, three.js, OGL. Licence **MIT + Commons Clause** (usage produit autorisé, revente/redistribution des composants interdite). Bibliothèque payante séparée, React Bits Pro.

**Point important :** la variante « JS + CSS » est du **React en JavaScript**, pas du JavaScript natif. Elle ne s'intègre pas ici sans React.

**Verdict :** excellente **source d'idées** ; les effets utiles se réécrivent en natif pour quelques centaines d'octets (voir §8.3).

### 6.3 Magic UI — magicui.design

Composants React + Tailwind + Motion, **MIT**, ~150 gratuits, Pro ~199 $ one-time. Même conclusion : React/Tailwind requis, donc non intégrable.

### 6.4 Aceternity UI — ui.aceternity.com

100+ composants gratuits, 200+ blocs et templates payants ; licence propre (usage commercial illimité sur les produits finaux, revente interdite) ; ~169 $/an, ~199 $ à vie, 1 590 $ équipe. React + Tailwind + Motion. **Non intégrable ici** ; utile pour observer des mises en page de hero.

### 6.5 21st.dev

Registre communautaire (composants, templates, thèmes shadcn, shaders), 2 copies gratuites par jour, membership payant, licences hétérogènes selon les auteurs. **À éviter comme source de code** tant que la licence de chaque auteur n'est pas vérifiée ; utilisable en veille visuelle.

### 6.6 Motion Primitives, Animate UI, Cult UI, Kokonut UI

MIT (Animate UI : MIT + Commons Clause), React + Motion. Même limite technique.

### 6.7 Alternatives réellement compatibles (vanilla)

| Bibliothèque | Intérêt | Poids | Verdict pour VIEW.co |
|---|---|---|---|
| **Motion** (API vanilla, Web Animations API) | Séquences et orchestrations plus riches que le CSS | quelques dizaines de Ko (estimation, à mesurer) | **Non** : les révélations actuelles suffisent |
| **Lenis** (défilement lissé) | Effet « premium » très répandu | faible (estimation) | **Non** : défilement natif plus prévisible, risque d'accessibilité |
| **SplitType** | Découpe de texte en lignes/mots | ~3 Ko (estimation) | **Remplaçable** par ~20 lignes maison |
| **GSAP** (+ ScrollTrigger) | Référence de l'animation web | important | **Non** : disproportionné, licence à vérifier avant usage |
| **Rive / Lottie** | Animations vectorielles riches | runtime + fichier | **Non** : poids et dépendance, hors identité |
| **Three.js** | 3D générale | ~150 Ko | **Non** : déjà écarté, la scène maison fait 8,7 Ko |

---

## 7. Catalogue des ajouts possibles

Notation : **Impact** (valeur perçue) et **Effort** sur 5. « Poids » = coût ajouté au chargement.

### 7.1 À faire maintenant — sans dépendance, sans contenu externe

| # | Ajout | Impact | Effort | Poids | Risque | Origine de l'idée |
|---|---|---|---|---|---|---|
| 1 | Préchargement de la fonte | 4 | 1 | 0 | nul | audit perf |
| 2 | Piège de focus dans le menu mobile | 3 | 2 | 0 | faible | audit a11y |
| 3 | `aria-invalid` + `aria-describedby` sur le formulaire | 3 | 2 | 0 | faible | audit a11y |
| 4 | Grain de papier en surimpression (SVG data-URI) | 3 | 1 | < 1 Ko | faible | GetLayers (grain/texture) |
| 5 | Révélation des titres ligne par ligne (masque) | 4 | 2 | < 1 Ko | moyen (CLS) | React Bits *Split Text* |
| 6 | Barre de progression de lecture (3 px, sous l'en-tête) | 2 | 1 | < 1 Ko | faible | React Bits *Scroll Progress* |
| 7 | Ligne de survol qui suit le curseur dans la liste des services | 3 | 2 | < 1 Ko | faible | React Bits *Hover* |
| 8 | Aimantation légère du bouton principal au curseur | 2 | 2 | < 1 Ko | moyen (hors identité) | React Bits *Magnet* |

### 7.2 À réserver aux contenus manquants

| # | Ajout | Condition |
|---|---|---|
| 9 | Section Réalisations en grille éditoriale | 3 à 6 projets (nom, visuel, année, tags, contexte) |
| 10 | Rail horizontal de projets (glisser-déposer, clavier) | les mêmes visuels réels |
| 11 | Filtres par discipline sur les projets | ≥ 8 projets |
| 12 | Navigation à 5 entrées | sections 9 et offre créées |
| 13 | Section Offre / formats de mission | cadrage commercial |
| 14 | Témoignages clients | citations réelles et autorisation |
| 15 | Équipe (portraits) | photos et rôles |
| 16 | Mentions légales, confidentialité | raison sociale, SIRET, hébergeur |
| 17 | `sitemap.xml`, `robots.txt`, `canonical`, `og:url`, JSON-LD | nom de domaine définitif |
| 18 | Envoi réel du formulaire | service d'envoi (email transactionnel ou fonction serveur) |

### 7.3 À écarter explicitement

| Écarté | Pourquoi |
|---|---|
| Templates GetLayers, blocs Aceternity, composants Magic UI / React Bits livrés tels quels | React + Tailwind + Motion : imposerait un build et ~200 Ko de dépendances |
| Fonds vidéo 4K (GetLayers *Backgrounds*) | plusieurs Mo, hors budget et hors identité |
| Particules, galaxie, `Ballpit`, shaders plein écran (React Bits *Backgrounds*) | contredisent le minimalisme ; la scène filaire suffit |
| Curseur personnalisé, texte qui se déforme, effet « glitch » | gadgets qui vieillissent vite et gênent la lecture |
| Compteurs animés de chiffres | le site n'a pas de chiffres à mettre en avant, et n'en inventera pas |
| Carrousel automatique | défilement imposé, accessibilité dégradée |

---

## 8. Recettes pour les chantiers retenus

### 8.1 Préchargement de la fonte (chantier 1)

Dans `<head>`, **avant** la feuille de style :

```html
<link rel="preload" href="assets/fonts/montserrat-latin.woff2" as="font"
      type="font/woff2" crossorigin>
```

`crossorigin` est obligatoire même en même origine, sinon le navigateur télécharge la fonte deux fois.

### 8.2 Piège de focus du menu mobile (chantier 2)

À l'ouverture, rendre le reste de la page inerte : `document.querySelector("main").inert = true` et `footer.inert = true`, puis rétablir à la fermeture. Plus simple et plus robuste qu'un piège manuel : le navigateur gère `Tab` et les lecteurs d'écran. Garder `Échap` et le retour de focus au burger (déjà en place).

### 8.3 Révélation des titres ligne par ligne (chantier 5)

Équivalent natif de *Split Text* :

```js
// Découpe en mots, chaque mot dans un span masqué ; aucune mesure de ligne nécessaire.
document.querySelectorAll("[data-lines]").forEach((el) => {
  const words = el.textContent.trim().split(/\s+/);
  el.innerHTML = words.map((w, i) =>
    `<span class="line"><span style="--i:${i}">${w}</span></span>`).join(" ");
});
```

```css
.line { display: inline-block; overflow: hidden; vertical-align: bottom; }
.line > span { display: inline-block; transform: translateY(105%);
  transition: transform .9s var(--ease) calc(var(--i) * 45ms); }
.is-in .line > span { transform: none; }
```

À appliquer **uniquement** au H1 et au slogan, avec `prefers-reduced-motion` déjà géré par le bloc existant.

### 8.4 Grain de papier (chantier 4)

Une texture SVG inline en `background-image`, opacité 3–5 %, `pointer-events: none`, sur `body::after`. Aucune requête, aucun JS. À vérifier visuellement : au-delà de 6 % d'opacité, le grain salit les blancs et fait baisser la lisibilité.

---

## 9. Vérifications exécutées pour cet audit

| Vérification | Commande / outil | Résultat |
|---|---|---|
| Syntaxe JS | `node --check assets/main.js`, `node --check assets/scene.js` | OK |
| Poids et gzip | `wc -c`, `gzip -9 -c` | voir §2.2 |
| URL externes | `grep` sur HTML/CSS/JS | 4 liens sociaux uniquement |
| Erreurs console | onglet navigateur, journal complet | 0 erreur, 0 avertissement |
| Requêtes en échec | journal réseau | aucune (7 requêtes, toutes 200) |
| Identifiants dupliqués | DOM | 0 |
| Ancres cassées | DOM | 0 |
| `alt` manquants | DOM | 0 |
| `rel="noopener"` manquants | DOM | 0 |
| Champs sans label | DOM | 0 |
| Contrastes | calcul WCAG dans le DOM | minimum 4,78:1 |
| Débordement horizontal | `scrollWidth` vs `innerWidth` | 1 423/1 440 et 373/390 |

**Non exécuté, à faire avant publication :** Lighthouse ou PageSpeed sur un vrai domaine, test sur téléphone réel, lecteur d'écran (NVDA/VoiceOver), validation W3C du HTML.

---

## 10. Ordre de travail recommandé

1. Préchargement de la fonte (10 minutes, gain immédiat).
2. Grain de papier + barre de progression (2 × 1 h, effet visible, zéro dette).
3. Piège de focus + erreurs de formulaire (2 h, accessibilité).
4. Révélation des titres ligne par ligne sur le H1 seul (2 h, à valider visuellement).
5. Dès réception des contenus : Réalisations, puis navigation à 5 entrées, puis Offre.
6. Dès le domaine : URL absolues, `canonical`, `sitemap.xml`, `robots.txt`, JSON-LD, en-têtes de sécurité.

Chaque chantier : sauvegarde dans `_backups/`, vérification ciblée, commit local, compte rendu.

---

## 11. Points ouverts

- **Numéro WhatsApp fictif** (`+33 6 39 98 00 00`) dans `index.html` : à remplacer avant toute mise en ligne.
- **Compte TikTok** : lien construit sur le handle Instagram (`@view_co1`) ; existence du compte à confirmer.
- **`docs/AUDIT-VIEW-CO.md`** recommande encore une CSP autorisant `fonts.googleapis.com` : obsolète depuis l'auto-hébergement des fontes.
- **Formulaire** : `mailto:` seulement ; aucun envoi serveur, aucune donnée stockée.

---

## 12. Annexe — arborescence

```
index.html
assets/
  styles.css      feuille unique (variables, composants, responsive)
  main.js         header, menu mobile, accordéons, révélations, formulaire
  scene.js        scène WebGL native du hero
  fonts/          montserrat-latin.woff2 + OFL.txt
  logo.png, logo-140.png, logo-light-140.png, monogramme*.png,
  favicon.png, og-image.png
  source/         sources logo (non servies)
docs/             audits et études antérieurs
_backups/         sauvegardes horodatées avant chaque tâche
tools/            script de mesure du hero
```
