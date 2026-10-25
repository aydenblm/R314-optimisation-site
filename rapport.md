# Rapport d'optimisation : TP R3.14

- Site déployé : https://aydenblm.github.io/R314-optimisation-site/
- Fork : https://github.com/aydenblm/R314-optimisation-site

## 1. Conditions de mesure
- Navigateur : Chrome version 153.0.8010.53
- Fenêtre de navigation privée, extensions désactivées
- Cache désactivé
- Mesures sur le site déployé
- Date des mesures « avant » : 22/10/2026

## 2. Audit initial

### 2.1 Onglet Réseau
![Onglet Réseau, avant](audit/avant-network.png)

- Requêtes : 22
- Poids transféré : 17.6 MB

Les 5 ressources les plus lourdes :

| Fichier | Poids | Initiateur |
|---|---|---|
|`img6.jpg?v=2`|3,393 kB|`index.html` l.12|
|`hero-bg.jpg`|3,393 kB|theme-legacy.css|
|`img6.jpg`|3,393 kB|`index.html` l.90|
|`img1.jpg`|2,525 kB|`index.html` l.75|
|`img4.jpg`|1,233 kB|`index.html` l.84|

Anomalies repérées :
| Fichier | Status | Type | Initiateur | Constat |
|---|---|---|---|---|
|`polyfills.js`|404|script|`index.html` l.16|Le fichier n'existe pas sur le serveur : une requête pour rien (5,6 kB, 144 ms), dans le `<head>`|
|`img6.jpg` & `img6.jpg?v=2`|200|jpeg|`index.html` l.12 & `index.html` l.90|L'image est téléchargée deux fois car elle est initiée deux fois dans le code : un `<link rel="preload">` dans le `<head>` (avec `?v=2`) et une `<img>` dans le `<body>`. Les deux URL sont différentes, donc le navigateur ne réutilise pas la première. Le preload n'est jamais utilisé (avertissement console) : 3 393 kB gaspillés|
|`img1.jpg` à `img6.jpg`|200|jpeg|`index.html` l.75 à l.90|Photos en taille d'origine (3968x2240 pour `img1.jpg`, 3968x2976 pour `img6.jpg`, 2040x1530 pour les autres), de 773 kB à 3 393 kB chacune, pour de simples vignettes de galerie. Problème de taille distinct du doublon d'`img6.jpg`|
|`hero-bg.jpg`|200|jpeg|`theme-legacy.css`|Image de 3 393 kB demandée par un CSS (`.hero::before`), alors qu'elle n'est pas visible sur la page (`opacity:.04`). C'est aussi exactement le même fichier que `img6.jpg` (même md5) : la même photo est téléchargée 3 fois|
|`favicon.png`|200|png|Other|788 kB pour une icône affichée en 16x16 : le fichier fait 512x512 px|
|`extra.css`|200|stylesheet|`styles.css` l.1|Appelé par un `@import` : il n'est découvert qu'après le téléchargement de `styles.css`|
|`theme-legacy.css`|200|stylesheet|`extra.css` l.1|Deuxième `@import` imbriqué : chaîne `index.html → styles.css → extra.css → theme-legacy.css`. Chaque fichier attend le précédent, ce qui retarde l'affichage|
|`css2?family=Playfair+Display...`|200|stylesheet|`theme-legacy.css` l.3|Feuille de police demandée en bout de chaîne `@import`, alors qu'aucune page n'utilise `.legacy-title` ni `.legacy-quote`. Aucun fichier `.woff2` n'est téléchargé : la requête ne sert à rien|
|`css2?family=Poppins...`|200|stylesheet|`styles.css` l.2|Chargée par `@import` avec `display=block` : le texte reste invisible (jusqu'à environ 3 s) tant que la police n'est pas arrivée. Les graisses 300, 400 et 600 sont demandées|
|`pxiByp8kv8JHgFVrLDz8Z1xlFQ.woff2`|200|font|`index.html` l.11|Police préchargée sans attribut `crossorigin` : le navigateur ne la réutilise pas (avertissements console « credentials mode does not match » et « preloaded but not used »)|
|`ui-kit.min.js`|200|script|`index.html` l.17|Script sans `defer` dans le `<head>` : bloque l'analyse du HTML|
|`app.js`|200|script|`index.html` l.18|Script sans `defer` dans le `<head>` : bloque l'analyse du HTML|
|*(aucune requête)*|-|-|`index.html` l.9|`<link rel="dns-prefetch" href="https://cdn.jsdelivr.net">` : aucune des 22 requêtes ne va vers `cdn.jsdelivr.net`, et rien dans le site n'utilise ce domaine. Le préchargement DNS ne sert à rien|

Pistes repérées à la lecture du code, à confirmer par la mesure :
- `ui-kit.min.js` : boucle de ~620 ms et 240 000 objets au chargement ; `MutationObserver` qui relit les styles de tous les éléments à chaque mutation → à vérifier au panneau Performance (2.3)
- `analytics.js` : `setInterval` de 2,6 s démarré 6,5 s après `load`, uniquement si la largeur dépasse 1024 px, avec une durée croissante jusqu'à 430 ms → à vérifier par un enregistrement long en desktop puis en mobile (2.3)
- `extra.css` : classes `.extra-N` a priori inutilisées → à vérifier avec l'onglet Coverage
- Poppins : graisses 300, 400 et 600 demandées → à comparer à celles réellement utilisées par le CSS


### 2.2 Lighthouse (DevTools)

| Profil | Score | FCP | LCP | TBT | CLS | Speed Index |
|---|---|---|---|---|---|---|
| Mobile | 46 | 3,8 s | 67,5 s | 400 ms | 0,106 | 12,5 s |
| Desktop | 65 | 0,9 s | 11,6 s | 80 ms | 0,047 | 3,5 s |

![Lighthouse Mobile, avant](audit/avant-lh-mobile.png)
![Lighthouse Desktop, avant](audit/avant-lh-desktop.png)

- Élément LCP : `<div class="hero">` (le bandeau principal), dans les deux profils. Il s'agit en fait de l'image d'arrière-plan `hero-bg.jpg` (3 393 kB, `.hero::before` dans `theme-legacy.css`) : l'audit « prioritize-lcp-image » cite `hero-bg.jpg`. Lighthouse note que la requête n'est pas découvrable dans le document initial (elle n'apparaît qu'au bout de la chaîne `@import`) et qu'elle n'a pas `fetchpriority=high`
- Responsables du CLS : mobile 0,106 et desktop 0,047. Dans le rapport Lighthouse en ligne de commande que j'ai lu en détail, le décalage venait de `div#galerie`, causé par le chargement des polices web Poppins (2 fichiers `.woff2`). À confirmer dans le détail « Layout shift culprits » de mon propre rapport DevTools. Lighthouse signale aussi les 6 images de la galerie sans `width`/`height` (`unsized-images`)
- Ressources bloquant le rendu : `app.js`, `ui-kit.min.js`, `styles.css`, `extra.css`, `theme-legacy.css`, `polyfills.js`, et les feuilles Google Fonts Poppins (807 ms perdues sur mobile) et Playfair Display (162 ms). Économie estimée : 2 580 ms sur mobile, 680 ms sur desktop
- Chaîne critique : `index.html → styles.css → (css2 Poppins → 2 × .woff2) et (extra.css → theme-legacy.css → css2 Playfair)`, plus `app.js`, `ui-kit.min.js` et `polyfills.js` demandés directement par `index.html`. On retrouve la chaîne `@import`. Chaîne la plus longue : 1 617 ms sur mobile (jusqu'aux polices), 1 073 ms sur desktop
- Ce que Lighthouse a détecté et que j'avais déjà repéré :
  - le poids total de 17 143 KiB ;
  - les images démesurées : économie estimée de 10 977 KiB (`image-delivery-insight`), dont 9 115 KiB d'images trop grandes pour leur affichage de 379×284 px ;
  - `hero-bg.jpg` parmi les plus lourdes ;
  - la chaîne `@import` `styles.css → extra.css → theme-legacy.css` ;
  - la feuille Playfair Display inutile ;
  - `app.js`, `ui-kit.min.js` et `polyfills.js` bloquant le rendu ;
  - `ui-kit.min.js` comme principale tâche longue (2 543 ms sur mobile, 640 ms sur desktop) ;
  - `analytics.js` comme tâche longue (540 ms sur mobile, 127 ms sur desktop)
- Ce que Lighthouse a détecté de nouveau :
  - l'élément LCP est l'image de fond du bandeau, avec requête non découvrable et sans `fetchpriority` ;
  - les images en JPEG qu'on pourrait servir en WebP/AVIF : 4 269 KiB d'économie estimée ;
  - 744 KiB d'économie estimée par une meilleure compression ;
  - aucun cache longue durée sur 14 ressources (14 978 KiB) ;
  - pas de `preconnect` vers `fonts.googleapis.com` : 150 ms d'économie estimée ;
  - des reflows forcés, dont un dans `app.js` (86 ms) ;
  - un `font-display` à corriger sur les polices Poppins ;
  - des images sans `width`/`height`
- Ce que j'ai repéré mais que Lighthouse n'a PAS vu :
  - le 404 de `polyfills.js` : il apparaît seulement comme ressource bloquante de 0 octet, sans mention de l'erreur ;
  - le doublon `img6.jpg` / `img6.jpg?v=2` : les deux fichiers sont comptés séparément dans le poids, sans lien entre eux ;
  - le `<link rel="preload">` de `img6.jpg?v=2` jamais utilisé, et le preload de police sans `crossorigin` (ce sont des avertissements de la console, hors catégorie Performance) ;
  - le `dns-prefetch` vers `cdn.jsdelivr.net`, inutile ;
  - le fait que `hero-bg.jpg` soit identique à `img6.jpg` (même md5) et affiché à `opacity:.04` ;
  - le `display=block` sur Poppins (texte invisible) ;
  - `favicon.png` de 788 kB en 512×512 px pour une icône de 16×16 : il n'apparaît que dans la liste du poids total

*Tableau et captures : Lighthouse du panneau DevTools de Chrome. Les puces ci-dessus (éléments, économies estimées, tâches longues) viennent d'un rapport Lighthouse 12.8.2 lancé en ligne de commande, pas du rapport DevTools.*

### 2.3 Panneau Performance (CPU ×4)

![Frise, avant](audit/avant-perf-frise.png)
![Bottom-Up, avant](audit/avant-perf-bottomup.png)

Enregistrement A : 7,64 s seulement (rechargement avec ⟳, arrêt avant les 40 s du scénario).

Top 3 du Bottom-Up (Self Time) :
| Fonction | Fichier | Temps |
|---|---|---|
|`Layout`|(natif)|641,7 ms (15,8 %)|
|`Recalculate style`|(natif)|640,1 ms (15,7 %)|
|`Parse HTML`|(natif)|531,0 ms (13,0 %)|

Fonctions JavaScript les plus coûteuses (Self Time) : `c` (`ui-kit.min.js`) 366,6 ms, `buildKeywordIndex` (`app.js` l.74) 346,4 ms, `getBoundingClientRect` 296,2 ms, `now` 243,4 ms, `revealCards` (`app.js` l.158) 175,9 ms.

- Au chargement : la frise montre un premier bloc dominé par `Evaluate script` puis `c` : c'est la calibration de `ui-kit.min.js`. Sa boucle appelle `performance.now()` : `c` (366,6 ms) + `now` (243,4 ms) font environ 610 ms, ce qui est cohérent avec la boucle de 620 ms lue dans le code. Vient ensuite le gestionnaire `DOMContentLoaded` avec `buildKeywordIndex` (346,4 ms de temps propre, 861,2 ms au total)
- Pendant le scroll : des blocs apparaissent à chaque défilement (images 329, 387, 404 et 916 ms sur la frise). Le Bottom-Up montre `revealCards` (`app.js` l.158) avec 1 378,9 ms au total (33,9 %), `getBoundingClientRect` 296,2 ms de temps propre, et surtout `Layout` et `Recalculate style` autour de 640 ms chacun : `revealCards` relit des mesures de mise en page après avoir écrit des styles, ce qui force le navigateur à recalculer à chaque évènement. Le panneau Insights signale d'ailleurs « Forced reflow ». `getComputedStyle` ne pèse que 14,1 ms et `_sync` (le `MutationObserver` de `ui-kit.min.js`) 224,7 ms au total
- Pendant l'inactivité : non mesuré. L'enregistrement A s'arrête à 7,64 s, sans phase de pause

Test de la condition de largeur (`analytics.js`) : non réalisé. Les deux enregistrements faits après rechargement durent environ 4 s et 3,5 s, or le minuteur d'`analytics.js` ne démarre que 6,5 s après `load` : le script n'y apparaît pas. La piste « boucle croissante, uniquement au-dessus de 1024 px » reste donc une lecture du code, non confirmée par une mesure.

### 2.4 PageSpeed Insights

| Profil | Score | FCP | LCP | TBT | CLS | Speed Index |
|---|---|---|---|---|---|---|
| Mobile | 59 | 2,4 s | 67,1 s | 200 ms | 0 | 14,9 s |
| Bureau | 58 | 0,9 s | 12,0 s | 200 ms | 0 | 4,9 s |

![PageSpeed Insights Mobile, avant](audit/avant-psi-mobile.png)
![PageSpeed Insights Bureau, avant](audit/avant-psi-desktop.png)

PageSpeed Insights n'affiche aucune donnée de terrain (CrUX) pour ce site : il n'a pas assez de trafic réel, seules les mesures de laboratoire (Lighthouse) sont disponibles.

Valeurs d'un seul lancement par profil, le 25/10/2026 à 15:25.

## 3. Problèmes identifiés

Chaque bloc donne : fichier et ligne (version d'origine) / nature / preuve / coût / correction.

**3.1 Script introuvable (`polyfills.js`)**
- Fichier : `index.html` l.16
- Nature : référence à un fichier qui n'existe pas, dans le `<head>`, sans `defer`
- Preuve : onglet Réseau, ligne rouge, statut 404, 5,6 kB, 144 ms (`audit/avant-network.png`) ; une erreur dans la console
- Coût : une requête inutile, bloquante, avant le rendu
- Correction : référence supprimée

**3.2 Image téléchargée deux fois (`img6.jpg` et `img6.jpg?v=2`)**
- Fichier : `index.html` l.12 (preload) et l.90 (`<img>`)
- Nature : deux URL différentes pour la même image ; le preload n'est jamais utilisé
- Preuve : Réseau, deux lignes de 3,393 kB ; avertissement console « preloaded but not used »
- Coût : 3,393 kB
- Correction : preload supprimé

**3.3 `dns-prefetch` inutile**
- Fichier : `index.html` l.9
- Nature : indice de connexion vers `cdn.jsdelivr.net`, domaine que la page n'utilise pas
- Preuve : aucune des 22 requêtes du Réseau ne vise ce domaine
- Coût : négligeable, mais sans bénéfice
- Correction : ligne supprimée

**3.4 Image de fond invisible (`hero-bg.jpg`)**
- Fichier : `css/theme-legacy.css`, règle `.hero::before` (`opacity:.04`)
- Nature : texture de 3,393 kB affichée à 4 % ; c'est le même fichier que `img6.jpg` (même empreinte md5) ; l'élément LCP est `div.hero`
- Preuve : Réseau (3,393 kB, initiateur `theme-legacy.css`) ; Lighthouse : élément LCP `div.hero`, audit « prioritize-lcp-image » qui cite `hero-bg.jpg` (2.2)
- Coût : 3,393 kB sur le chemin du LCP
- Correction : même effet conservé avec `hero-bg.webp` (960×720, 34,1 kB)

**3.5 Photos de la galerie surdimensionnées**
- Fichier : `index.html` l.75 à l.90
- Nature : images de 3968×2240, 3968×2976 et 2040×1530 px affichées à 379×284 px, en JPEG, sans `width`/`height`, toutes chargées d'emblée
- Preuve : Réseau (2,525 / 1,045 / 773 / 1,233 / 960 / 3,393 kB, soit 9 929 kB) ; Lighthouse « Improve image delivery », économie estimée 10 977 KiB (2.2)
- Coût : 9 929 kB pour six vignettes
- Correction : trois tailles WebP (400, 800, 1200 px) avec `srcset`/`sizes`, `width`/`height`, `loading="lazy"` sur les trois dernières

**3.6 Favicon démesuré**
- Fichier : `img/favicon.png`
- Nature : image de 512×512 px (788 kB) pour une icône de 16×16 px
- Preuve : Réseau, 788 kB
- Coût : 788 kB
- Correction : image 64×64 px de 3,6 kB (taille du fichier)

**3.7 Chaîne de `@import`**
- Fichier : `css/styles.css` l.1 → `css/extra.css` l.1 → `css/theme-legacy.css` l.3
- Nature : trois feuilles découvertes l'une après l'autre
- Preuve : initiateurs en escalier dans le Réseau ; Lighthouse « Network dependency tree » (2.2)
- Coût : trois allers-retours en série avant le premier rendu
- Correction : une seule feuille `styles.css`

**3.8 CSS mort et feuille Playfair inutile**
- Fichier : `css/styles.css` (92 kB), `css/extra.css` (29 kB), `css/theme-legacy.css`
- Nature : environ 1 200 des 1 237 classes de `styles.css` et 800 des 804 de `extra.css` n'apparaissent dans aucune page ni script ; la feuille Playfair Display est demandée alors qu'aucun texte ne l'utilise (aucun `.woff2` téléchargé)
- Preuve : recherche des classes dans les fichiers HTML et JS (script) ; Réseau : feuille Playfair, aucune police associée. L'onglet Coverage n'a pas été utilisé
- Coût : 13,1 kB transférés en 5 requêtes CSS
- Correction : règles mortes et Playfair supprimés, feuilles fusionnées

**3.9 Polices Poppins**
- Fichier : `index.html` l.10–11, `css/styles.css` l.2
- Nature : `display=block` (texte invisible tant que la police n'est pas arrivée), graisse 300 demandée mais inutilisée, preload d'une police inutilisée et sans `crossorigin`
- Preuve : console, deux avertissements sur la police préchargée (« credentials mode does not match », « not used within a few seconds ») ; Réseau : trois `.woff2` ; vérification par script dans Chrome : seules les graisses 400 et 600 sont chargées
- Coût : un fichier de police inutile et une dépendance retardée
- Correction : `display=swap`, graisses 400 et 600, `preconnect`, preload corrigé des deux fichiers utilisés, police de repli ajustée pour limiter le saut de mise en page

**3.10 Scripts bloquants**
- Fichier : `index.html` l.17–18 (`ui-kit.min.js` et `app.js`)
- Nature : scripts sans `defer` dans le `<head>`
- Preuve : Lighthouse, « Render-blocking requests » (2.2)
- Coût : le HTML n'est plus analysé pendant leur exécution
- Correction : `defer` (l'ordre d'exécution est conservé)

**3.11 `ui-kit.min.js` : travail inutile au chargement**
- Fichier : `js/vendor/ui-kit.min.js`
- Nature : une boucle de calibration d'environ 620 ms, un tableau de 240 000 objets, un `MutationObserver` qui relit le style de tous les éléments (`getComputedStyle`) à chaque mutation. Aucune de ces valeurs n'est lue ailleurs dans le code
- Preuve : Bottom-Up avant : `c` 366,6 ms + `now` 243,4 ms, `b` 89,1 ms, `_sync` 224,7 ms au total (`audit/avant-perf-bottomup.png`)
- Coût : environ 0,9 s de thread principal au chargement (CPU ×4)
- Correction : boucle, tableau et observateur retirés, helpers (`qs`, `qsa`, `cls`, `ready`…) conservés

**3.12 `revealCards` : reflow forcé et boucle quadratique**
- Fichier : `js/app.js` l.158–189, branchée sur `scroll`, `resize` et `load` l.213–215
- Nature : pour chacune des 6 cartes, elle relit la hauteur des 6 cartes après avoir écrit `style.minHeight` (lecture après écriture : reflow forcé ; boucle imbriquée : n²), puis mesure 371 cases du calendrier avec `getBoundingClientRect`, à chaque évènement de défilement
- Preuve : Bottom-Up avant : `revealCards` 1 378,9 ms au total (33,9 %), `getBoundingClientRect` 296,2 ms, `Layout` 641,7 ms, `Recalculate style` 640,1 ms ; Insights : « Forced reflow »
- Coût : plusieurs centaines de ms de blocage par défilement
- Correction : hauteurs calculées une seule fois (toutes les lectures puis toutes les écritures), apparition des cartes confiée à un `IntersectionObserver`, calendrier mis à jour au plus une fois par image affichée

**3.13 `buildKeywordIndex` : `innerHTML +=` dans une boucle**
- Fichier : `js/app.js` l.74–83
- Nature : 320 réécritures du sous-arbre `<datalist>`
- Preuve : Bottom-Up avant : 346,4 ms de temps propre, 861,2 ms au total
- Coût : environ 0,9 s au chargement (CPU ×4)
- Correction : options construites dans un fragment, insérées en une seule fois

**3.14 `analytics.js` : minuteur qui monopolise le processeur**
- Fichier : `js/analytics.js`
- Nature : au-dessus de 1024 px de large, 6,5 s après le chargement puis toutes les 2,6 s, une boucle active dont la durée croît (46 ms × 1,28 à chaque passage, jusqu'à 430 ms)
- Preuve : lecture du code. Mesure par script (Chrome piloté, CPU ×4) : relevés de 47 à 430 ms toutes les 2,6 s. Non reproduit dans DevTools : l'enregistrement « avant » durait 7,6 s, avant le premier relevé
- Coût : jusqu'à 430 ms de blocage toutes les 2,6 s pour un visiteur qui reste sur la page
- Correction : un seul calcul court par relevé, sans boucle d'attente (mêmes conditions de largeur et de visibilité)

## 4. Corrections et gains mesurés

Mesures « après » : site publié, Chrome, fenêtre privée. Captures dans `audit/` (`apres-*.png`).

| Correction | Mesure avant | Mesure après | Gain |
|---|---|---|---|
| Doublon `img6.jpg?v=2`, `polyfills.js` (404), `dns-prefetch` | 22 requêtes, une en 404, 3,393 kB en doublon | 16 requêtes, aucune erreur | −3,393 kB, plus d'erreur 404 |
| `hero-bg` et favicon | 3,393 kB et 788 kB | 34,1 kB et 3,6 kB (taille du fichier) | −99 % et −99,5 % |
| Photos de la galerie | 9 929 kB (6 JPEG) | 365,3 kB (6 WebP 800 px) | −96 % |
| Chaîne `@import` et CSS mort | 5 requêtes CSS, 13,1 kB | 2 requêtes CSS, 2,9 kB | −3 requêtes, −10,2 kB |
| Polices Poppins | 3 `.woff2` (23,8 kB), 1 erreur et 3 avertissements en console | 2 `.woff2` (15,9 kB), plus d'erreur ni d'avertissement | −1 fichier, −7,9 kB |
| `defer`, `ui-kit.min.js` allégé | `c` + `now` ≈ 610 ms, `b` 89,1 ms, `_sync` 224,7 ms (Bottom-Up) | absents du Bottom-Up ; TBT Lighthouse mobile 400 ms → 0 ms | ≈ 0,9 s de thread principal en moins |
| `revealCards`, `buildKeywordIndex` | 1 378,9 ms et 861,2 ms au total | absents du Bottom-Up | ≈ 2,2 s de thread principal en moins |
| `analytics.js` | jusqu'à 430 ms toutes les 2,6 s (mesure par script) | `releve` : 19,9 ms au total sur tout l'enregistrement | quasi nul |

Au total, 6 requêtes en moins (22 → 16) : `polyfills.js`, le doublon d'`img6.jpg`, `extra.css`, `theme-legacy.css`, la feuille Playfair et une police.

Images : `audit/apres-network.png`, `audit/apres-perf-frise.png`, `audit/apres-perf-bottomup.png`.

Inactivité après correction (CPU ×4, sans toucher à la page) : `audit/apres-perf-analytics-large.png` (plus de 1024 px) : Scripting 34 ms sur 20,5 s ; `audit/apres-perf-analytics-etroit.png` (800 px) : Scripting 6 ms sur 29,8 s. Plus aucun bloc régulier dans la piste principale, quelle que soit la largeur.

Rendu : le site reste identique. Captures `audit/avant-rendu-desktop.png`, `audit/apres-rendu-desktop.png`, `audit/avant-rendu-mobile.png`, `audit/apres-rendu-mobile.png`. Le filtre, le calendrier et l'apparition des cartes ont été comparés en local avant la publication avec un script (mêmes hauteurs de cartes, mêmes opacités, 320 suggestions, même résultat du filtre).

Ce qui reste coûteux après correction (Bottom-Up après) : `Recalculate style` occupe 80,8 % du temps de thread principal enregistré (9 636,8 ms), alimenté par `updateCalendar` (1 748 ms au total, dont 1 669 ms dans `getBoundingClientRect`) : lors du défilement, l'opacité des 371 cases du calendrier est mise à jour, avec une transition CSS sur chacune. C'est le coût de l'effet « apparition progressive », conservé pour garder le rendu identique. Piste non réalisée : calculer la position du calendrier sans lire la mise en page, ou remplacer l'effet par un seul calque.

## 5. Tableau comparatif avant / après

Lighthouse (panneau DevTools de Chrome), profils Mobile et Desktop :

| Indicateur | Mobile avant | Mobile après | Desktop avant | Desktop après |
|---|---|---|---|---|
| Score | 46 | 92 | 65 | 99 |
| FCP | 3,8 s | 1,7 s | 0,9 s | 0,8 s |
| LCP | 67,5 s | 3,2 s | 11,6 s | 0,8 s |
| TBT | 400 ms | 0 ms | 80 ms | 0 ms |
| CLS | 0,106 | 0,034 | 0,047 | 0 |
| Speed Index | 12,5 s | 1,7 s | 3,5 s | 0,8 s |

PageSpeed Insights (un seul lancement par profil, aucune donnée CrUX) :

| Indicateur | Mobile avant | Mobile après | Bureau avant | Bureau après |
|---|---|---|---|---|
| Score | 59 | 92 | 58 | 100 |
| FCP | 2,4 s | 2,4 s | 0,9 s | 0,7 s |
| LCP | 67,1 s | 2,4 s | 12,0 s | 0,7 s |
| TBT | 200 ms | 0 ms | 200 ms | 0 ms |
| CLS | 0 | 0 | 0 | 0 |
| Speed Index | 14,9 s | 4,3 s | 4,9 s | 0,7 s |

Onglet Réseau :

| Indicateur | Avant | Après |
|---|---|---|
| Requêtes | 22 | 16 |
| Poids transféré | 17,6 Mo | 429 kB (mesuré avec le cache actif) |
| DOMContentLoaded | 5,39 s | 348 ms |
| Load | 5,88 s | 478 ms |

Limites de ces mesures : un seul lancement PageSpeed Insights par profil (pas de médiane de trois) ; la capture Réseau « après » a été prise sans cocher « Désactiver le cache » (le favicon vient du cache disque) ; l'enregistrement « avant » de 30 s à deux largeurs n'a pas été fait dans DevTools : `analytics.js` n'est donc comparé qu'avec la mesure par script.

## 6. Optimisations impossibles sur GitHub Pages

Les en-têtes réellement renvoyés par le site publié (`curl -I`) : `Cache-Control: max-age=600`, `Content-Encoding: gzip`, `Server: GitHub.com`, derrière un cache Varnish.

- Durée de cache : les fichiers ne sont gardés que 10 minutes. PageSpeed Insights signale encore « Utiliser des durées de mise en cache efficaces » (370 Kio sur mobile, 133 Kio sur bureau). Ailleurs : `Cache-Control: max-age=31536000, immutable` sur les ressources versionnées, revalidation courte pour le HTML.
- Empreinte dans le nom de fichier (`styles.a3f9c1.css`) : indispensable pour un cache très long sans servir de version périmée ; cela demande un outil de build, absent ici.
- Brotli : GitHub Pages ne sert que du gzip, même quand le navigateur annonce `br`. Ailleurs : Brotli sur le HTML, le CSS et le JS.
- En-têtes `Link: rel=preload` et réponse `103 Early Hints` : impossibles sans contrôle des en-têtes. Ils permettraient de lancer le téléchargement des polices et de l'image du LCP avant l'analyse du HTML.
- Autre piste possible, non réalisée : héberger les polices Poppins avec le site pour supprimer la feuille Google Fonts, qui reste bloquante (PageSpeed Insights : « Requêtes de blocage du rendu », 1 490 ms sur mobile, 360 ms sur bureau).

## 7. Conclusion

Les 14 problèmes relevés ont été corrigés sans retirer de fonctionnalité ni d'élément visuel. Le site publié passe de 17,6 Mo à 429 kB et de 22 à 16 requêtes ; le score Lighthouse mobile passe de 46 à 92 et le desktop de 65 à 99. Le plus gros gain vient des images (niveau 1) : photos, texture invisible, doublon d'image et favicon représentent à eux seuls environ 17 Mo des 17,2 Mo économisés. Les corrections JavaScript (niveau 2) retirent environ 3 s de thread principal au chargement et ramènent le TBT mobile de 400 ms à 0. Le niveau 3 (`analytics.js`) n'a pas été confirmé dans DevTools : la piste vient de la lecture du code et d'une mesure par script.

Limites : un seul lancement par profil sur PageSpeed Insights, capture Réseau « après » avec le cache actif, enregistrements Performance plus courts que le scénario demandé. Reste à traiter : le coût de `Recalculate style` pendant le défilement (calendrier d'activité), la feuille Google Fonts bloquante, et les durées de cache, hors de portée sur GitHub Pages.
