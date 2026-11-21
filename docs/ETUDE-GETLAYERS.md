# Étude GetLayers AI — intégration 3D du hero

Document de décision, lié à `docs/AUDIT-VIEW-CO.md` (§9) et aux tâches 10 à 13 de la feuille de route.

---

## 1. Ce que l'étude devait trancher

1. GetLayers est-il compatible avec un site **sans build** (HTML/CSS/JS natif, aucune dépendance) ?
2. Quel « slot » du site peut recevoir de la 3D sans trahir l'identité (minimalisme éditorial, monochrome, Montserrat, fond `#f3f2ee`, noir `#0a0a0a`) ?
3. Quel budget de poids et de performance est acceptable sur la machine de référence (Intel UHD 620, DPR 1,5) ?

## 2. Ce que GetLayers propose, face à ce site

| Ressource GetLayers | Nature | Verdict pour VIEW.co |
|---|---|---|
| Bibliothèque de prompts / templates de scènes | Scènes WebGL temps réel | **Utile** comme inspiration de direction artistique, pas comme livrable |
| Scènes exportées | Rendu WebGL autonome, le plus souvent **React + Three.js** | **Non intégrable tel quel** : aucune chaîne de build, aucune dépendance React dans le projet |
| Fonds vidéo 4K + poster | Boucles vidéo | **Écarté** : plusieurs Mo, hors identité, mauvais pour le budget |
| Gradients WebGL | Fonds animés légers | **Écarté** : trop décoratif pour une marque qui vit par sa typographie |
| SVG to 3D | Extrusion de tracés | **Écarté** : le logo est un **PNG matriciel** (608×416), l'extrusion produirait un résultat approximatif |
| Image Motion | Effet de profondeur (React + react-spring) | **Écarté** : impose une stack React |

**Conclusion de l'étude :** aucune ressource GetLayers n'est déposable directement dans ce projet. Ce qui est réutilisable, c'est la **direction** : une scène unique, monochrome, lente, dans le hero.

## 3. Les deux voies techniques

| Voie | Poids | Coût de maintenance | Verdict |
|---|---|---|---|
| **A. Three.js copié en local** (`assets/vendor/three.module.js` + import map) | ~150 Ko minifié | Dépendance à suivre et à mettre à jour ; chargement conditionnel obligatoire | Viable, mais disproportionné pour une seule scène filaire |
| **B. Passer le projet sous Vite** | Bundle tree-shaké ~80–120 Ko | Introduit `node_modules`, un build, une étape de déploiement | **Refusé** : change la nature du projet, aucune nécessité présente |
| **C. WebGL natif écrit à la main** (retenu) | **8,5 Ko** (3,1 Ko gzip) | Aucune dépendance, aucun build, code lisible et réversible | **Retenu** |

La voie C respecte strictement le cadrage de l'audit (scène unique, monochrome, DPR plafonné, pause hors viewport, repli sans WebGL) pour **dix-sept fois moins de poids** que la voie A.

## 4. Scène livrée (tâche 11)

- **Objet :** sphère géodésique filaire (icosaèdre subdivisé une fois, 120 arêtes), en noir `#0a0a0a`, opacité 0,42, dégradé de profondeur.
- **Mouvement :** rotation très lente sur Y, oscillation légère sur X. Aucune interaction souris : sur ce site, le curseur doit rester un outil, pas un jouet.
- **Placement :** colonne visuelle du hero, **derrière** le logo qui reste un `<img>` HTML intact (`assets/logo.png`), jamais extrudé ni remplacé.
- **Fichiers :** `assets/scene.js` (autonome) + un `<canvas>` dans `#top`.

## 5. Garde-fous implémentés (tâche 12)

| Garde-fou | Mise en œuvre |
|---|---|
| Absence de WebGL | `getContext` échoue → le canvas est retiré, le logo reste seul |
| Échec de compilation de shader | `return` silencieux, aucun message d'erreur visible |
| DPR | plafonné à **1,5** (653×816 au lieu de 1306×1632 sur la machine de test) |
| Hors viewport | `IntersectionObserver` (seuil 0,01) arrête la boucle |
| Onglet masqué | `visibilitychange` arrête la boucle |
| Contexte WebGL perdu | `webglcontextlost` / `webglcontextrestored` gérés |
| `prefers-reduced-motion` | image fixe, aucune boucle d'animation |
| Poids | 8,5 Ko (3,1 Ko gzip), zéro requête tierce |

## 6. Ce que l'on n'a délibérément pas fait (tâche 13)

- Pas de scène dans « Agence » : la section vit par sa typographie.
- Pas de 3D dans les services : aucune valeur ajoutée à un accordéon de texte.
- Pas de cartes 3D du portfolio : le portfolio n'existe pas encore (voir `docs/AUDIT-FINAL.md`).
- Pas de post-traitement (bloom, flou), pas de particules, pas de réaction au curseur : hors identité.

## 7. Quand reconsidérer le choix

Passer à Three.js (voie A) ou à un build (voie B) ne se justifie que si **plusieurs** scènes 3D sont demandées (par exemple des cartes projets animées en plus du hero) ou si un export GetLayers doit être utilisé tel quel. Dans ce cas, la scène actuelle peut être conservée comme repli.
