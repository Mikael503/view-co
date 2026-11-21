# Audit final — VIEW.co

État du site après les phases 1 à 6 de la feuille de route. Toutes les mesures ont été prises sur le serveur statique local `http://127.0.0.1:4173` (aucune compression, aucun cache), Chromium du poste, DPR 1,5.

---

## 1. Tâches livrées

| Tâche | Objet | État |
|---|---|---|
| 1 | Menu mobile bloqué après défilement | Livrée (commit `966d7ea`) |
| 2 | Ancres masquées par l'en-tête fixe | Livrée |
| 3 | Repli sans JavaScript | Livrée |
| 4 | Menu fermé focusable / annoncé | Livrée |
| 5 | Cibles tactiles < 44 px | Livrée |
| 6 | Images surdimimensionnées | Livrée |
| 7 | Graisses de police inutilisées | Livrée |
| 8 | `will-change` permanent | Livrée |
| 9 | Hero surchargé (tuile noire, grille, légende) | Livrée |
| 10 | Étude GetLayers | Livrée (`docs/ETUDE-GETLAYERS.md`) |
| 11 | Scène 3D du hero | Livrée (`assets/scene.js`) |
| 12 | Optimisation de la scène | Livrée |
| 13 | Enrichissements 3D complémentaires | **Volontairement non faits**, justifiés |
| 14 | Formulaire de contact | **Partielle** — dépend d'un service d'envoi (voir §5) |
| 15 | Portfolio / projets | **Bloquée** — contenu manquant |
| 16 | Mentions légales / confidentialité | **Bloquée** — informations juridiques manquantes |
| 17 | Open Graph, robots, sitemap | Partielle — balises et `robots.txt` livrés, `sitemap.xml` en attente du domaine |
| 18 | Tests fonctionnels | Livrée (voir §2) |
| 19 | Tests responsive | Livrée (voir §3) |
| 20 | Audit performance / sécurité | Livrée (voir §4) |

## 2. Tests fonctionnels (tâche 18)

| Parcours | Résultat |
|---|---|
| Menu mobile fermé (390 px) | `inert`, `aria-hidden="true"`, liens hors tabulation |
| Ouverture au burger | `inert` retiré, focus placé sur « Services », panneau 390×844 |
| Fermeture par Échap | menu fermé, focus rendu au burger |
| Fermeture par clic sur un lien | menu fermé, verrou de défilement levé |
| Redimensionnement 860 → 1440 px | menu fermé, `inert` retiré, navigation desktop normale |
| Ancres `#services`, `#methode`, `#agence`, `#contact` | section à 92 px (mobile, en-tête 73 px) et 104 px (desktop, en-tête 85 px) |
| Accordéon services | une seule fiche ouverte, `aria-expanded` cohérent |
| Révélations au défilement | 19 blocs `[data-reveal]`, aucun bloc restant invisible |
| Sans JavaScript (classe `.js` retirée) | opacité 1, aucune transition : **tout le contenu est lisible** |
| Formulaire vide | message « Merci de renseigner votre nom, votre email et votre projet. » |
| Formulaire incomplet / email invalide | message de vérification de l'adresse, aucun envoi |
| Champs requis | `required` sur nom, email, projet — validation native |
| Envoi réel vers la messagerie | **Non exécuté volontairement** : cela ouvrirait le client mail du poste. Le `mailto:` est construit et testé en lecture de code |
| Console navigateur | aucune erreur, aucun avertissement |

## 3. Tests responsive (tâche 19)

| Largeur | Débordement horizontal | Points vérifiés |
|---|---|---|
| 390 px | aucun (`scrollWidth` 373) | hero 333×267, logo 2x net, cibles ≥ 44 px |
| 820 px | aucun | logo au-dessus du texte, sphère centrée |
| 1440 px | aucun | en-tête 85 px, colonne visuelle 435×544, logo 259 px |

## 4. Performance et sécurité (tâche 20)

### Poids

| Fichier | Brut | Gzip |
|---|---|---|
| `index.html` | 18,3 Ko | 4,5 Ko |
| `assets/styles.css` | 21,6 Ko | 5,2 Ko |
| `assets/main.js` | 5,9 Ko | 2,0 Ko |
| `assets/scene.js` | 8,5 Ko | 3,1 Ko |
| `assets/logo.png` (hero) | 16,7 Ko | 14,6 Ko |
| `assets/logo-140.png` + `logo-light-140.png` | 4,8 Ko | 4,8 Ko |
| `assets/og-image.png` (réseaux sociaux, hors page) | 23,7 Ko | — |
| **Total page** | **≈ 78 Ko** | **≈ 34 Ko gzip** |

Plus les deux fichiers Montserrat (graisses 400 et 500 seulement) servis par Google Fonts.
Les logos d'en-tête sont passés de 17 Ko à 2,3 Ko ; les graisses 300, 600 et 700 ne sont plus demandées.

### Rendu 3D

- DPR plafonné à 1,5 : tampon 653×816 pour un canvas CSS de 435×544.
- 27372 pixels dessinés (5,1 % du canvas), alpha maximal mesuré 0,78 sur les croisements d'arêtes.
- Boucle arrêtée hors viewport, onglet masqué, ou sous `prefers-reduced-motion`.
- Aucune erreur WebGL (`getError()` = 0), aucune erreur console.

### Sécurité

| Point | État |
|---|---|
| Clés / secrets dans le frontend | **Aucun** |
| Liens externes | `target="_blank"` avec `rel="noopener noreferrer"` |
| Formulaires | aucun envoi serveur, aucune donnée stockée |
| Script inline | un seul, ajout de la classe `.js` — nécessitera un hash si une CSP stricte est posée |
| En-têtes HTTP | **non vérifiables sans accès à l'hébergement** (CSP, HSTS, `X-Content-Type-Options`, `Referrer-Policy`) |
| Dépendances tierces | Google Fonts uniquement (deux requêtes) |

## 5. Points bloqués, et ce qu'il faut fournir

1. **Tâche 14 — envoi du formulaire.** Le formulaire remet la demande au client mail du visiteur (`mailto:`), sans jamais annoncer un envoi réussi. Pour un envoi réel, il faut un service (Brevo, Resend, Formspree…) et **une clé API côté serveur**. Le site étant 100 % statique, cela suppose soit un point d'entrée serveur, soit un service de formulaire hébergé. Décision et accès nécessaires.
2. **Tâche 15 — portfolio.** Aucun projet réel n'a été fourni. Rien n'a été inventé. À fournir par projet : nom, secteur, année, 2 à 4 visuels, une phrase de contexte, et l'autorisation de publication.
3. **Tâche 16 — mentions légales et confidentialité.** Manquent : raison sociale, forme juridique, SIRET, adresse, responsable de publication, hébergeur (nom, adresse, téléphone), politique de conservation des emails reçus.
4. **Tâche 17 — `sitemap.xml`.** Il exige l'URL absolue du domaine. Les balises Open Graph pointent pour l'instant vers des chemins relatifs (`assets/og-image.png`) : à passer en URL absolues une fois le domaine connu, comme indiqué en commentaire dans `index.html`.

## 6. Ce qui reste à vérifier sur un appareil réel

- Rendu et fluidité de la scène sur un téléphone d'entrée de gamme.
- Comportement du `mailto:` sur mobile (application mail absente, Gmail web).
- Rendu des polices et des contrastes sur écran OLED.
- En-têtes de sécurité une fois l'hébergement connu.
