/* ============================================================
   app.js — interactions de la galerie SlowSite
   Révélation des vignettes au scroll + nuage de mots-clés.
   Dépend de js/vendor/ui-kit.min.js (UIKit).
   ============================================================ */
(function () {
  'use strict';

  /* Vocabulaire d'indexation de la photothèque. */
  var TAGS = [
    'portrait', 'paysage', 'nature morte', 'macro', 'architecture', 'photo de rue',
    'reportage', 'documentaire', 'animalier', 'sport', 'mode', 'culinaire', 'spectacle',
    'concert', 'mariage', 'corporate', 'packshot', 'astrophotographie', 'sous-marine',
    'aérienne', 'urbex', 'industrielle', 'scolaire', 'studio', 'autoportrait', 'street art',
    'botanique', 'ornithologie', 'minéralogie', 'scène de genre', 'pose longue', 'filé',
    'bokeh', 'contre-jour', 'panoramique', 'focus stacking', 'light painting',
    'surimpression', 'sténopé', 'lomographie', 'time-lapse', 'hyperlapse', 'photogramme',
    'solarisation', 'bracketing', 'rafale', 'mise au point manuelle', 'hyperfocale',
    'profondeur de champ', 'flou de bougé', 'zoom burst', 'réflexion', 'silhouette',
    'ombre portée', 'symétrie miroir', 'levée de voile', 'prise de vue au flash',
    'seconde synchro', 'multi-exposition', 'vue éclatée', 'heure dorée', 'heure bleue',
    'lumière rasante', 'lumière diffuse', 'clair-obscur', 'éclairage Rembrandt',
    'éclairage papillon', 'lumière naturelle', 'flash déporté', 'boîte à lumière',
    'réflecteur', 'nid d\'abeille', 'gélatine colorée', 'stroboscope', 'low key',
    'high key', 'halo', 'contre-jour partiel', 'lumière d\'appoint', 'fond lumineux',
    'ombre douce', 'ombre dure', 'lumière zénithale', 'lumière latérale',
    'lumière frontale', 'pénombre', 'rétroéclairage', 'faisceau', 'diffuseur', 'snoot',
    'grand angle', 'téléobjectif', 'focale fixe', 'zoom transstandard', 'fisheye',
    'tilt-shift', 'trépied', 'monopode', 'rotule ball', 'filtre polarisant', 'filtre ND',
    'filtre dégradé', 'pare-soleil', 'télémètre', 'reflex', 'hybride', 'moyen format',
    'grand format', 'chambre photographique', 'flash cobra', 'bague allonge', 'soufflet',
    'doubleur de focale', 'déclencheur souple', 'viseur optique', 'viseur électronique',
    'carte mémoire', 'batterie de secours', 'sac photo', 'courroie', 'pellicule',
    'format 35 mm', 'format 120', 'négatif', 'diapositive', 'tirage argentique',
    'laboratoire', 'révélateur', 'fixateur', 'agrandisseur', 'planche contact',
    'papier baryté', 'papier RC', 'virage sépia', 'cyanotype', 'platinotypie',
    'gomme bichromatée', 'collodion humide', 'daguerréotype', 'sels d\'argent',
    'grain argentique', 'poussée de développement', 'bain d\'arrêt', 'séchage', 'spire',
    'cuve de développement', 'chambre noire', 'inactinique', 'chimie', 'archivage',
    'monochrome', 'sépia', 'désaturé', 'couleurs saturées', 'teintes froides',
    'teintes chaudes', 'balance des blancs', 'colorimétrie', 'étalonnage', 'courbe tonale',
    'niveaux', 'dominante bleue', 'dominante verte', 'duotone', 'trichromie', 'pastel',
    'contraste élevé', 'contraste doux', 'noir profond', 'blanc pur', 'gris neutre',
    'palette restreinte', 'complémentaires', 'camaïeu', 'teinte unique', 'virage croisé',
    'rendu cinéma', 'rendu neutre', 'rendu chaud', 'aplat', 'règle des tiers',
    'nombre d\'or', 'lignes de fuite', 'symétrie', 'cadre dans le cadre', 'point de fuite',
    'diagonale dominante', 'premier plan', 'arrière-plan', 'perspective forcée',
    'contre-plongée', 'plongée', 'hauteur d\'homme', 'cadrage serré', 'plan large',
    'plan d\'ensemble', 'gros plan', 'plan américain', 'format carré', 'format panoramique',
    'orientation portrait', 'orientation paysage', 'espace négatif', 'répétition',
    'rythme visuel', 'point focal', 'ligne d\'horizon', 'décentrage',
    'remplissage du cadre', 'hors-champ', 'montagne', 'littoral', 'forêt', 'désert',
    'ville', 'village', 'ruelle', 'marché', 'port', 'gare', 'friche', 'chantier', 'champ',
    'vignoble', 'rivière', 'cascade', 'lac', 'falaise', 'dune', 'marais', 'sentier', 'pont',
    'phare', 'moulin', 'ruines', 'cloître', 'verrière', 'escalier', 'façade', 'toiture',
    'aube', 'crépuscule', 'nuit étoilée', 'brume', 'brouillard', 'pluie', 'orage', 'neige',
    'givre', 'vent', 'ciel dégagé', 'arc-en-ciel', 'nuages bas', 'cumulus', 'éclaircie',
    'averse', 'gel matinal', 'canicule', 'embruns', 'rosée', 'halo lunaire', 'voie lactée',
    'aurore', 'éclipse', 'mirage', 'poussière', 'sable soulevé', 'reflet mouillé', 'flaque',
    'vapeur', 'recadrage', 'retouche', 'densité', 'masque de fusion', 'calque de réglage',
    'accentuation', 'réduction de bruit', 'correction optique', 'redressement', 'détourage',
    'tampon', 'correcteur localisé', 'dématriçage', 'fichier brut', 'export web',
    'profil colorimétrique', 'netteté de sortie', 'vignetage', 'aberration chromatique',
    'distorsion', 'moiré', 'clarté', 'texture', 'suppression de poussières', 'fusion HDR',
    'assemblage panoramique', 'upscaling', 'compression', 'métadonnées', 'mots-clés',
    'tirage d\'exposition', 'accrochage', 'encadrement', 'passe-partout', 'portfolio',
    'série', 'diptyque', 'triptyque', 'édition limitée', 'numérotation', 'vernissage',
    'résidence', 'commande', 'cession de droits', 'droit à l\'image', 'légende',
    'fonds photographique', 'inventaire', 'numérisation', 'conservation'
  ];

  /* Construit le nuage de mots-clés sous la galerie. La taille de chaque
     étiquette reflète sa fréquence d'emploi dans le fonds. */
  function buildTagCloud() {
    var host = UIKit.qs('#tagcloud');
    if (!host) return;

    host.innerHTML = '';
    for (var i = 0; i < TAGS.length; i++) {
      var weight = 80 + ((i * 7) % 60);
      // On ajoute chaque étiquette au fur et à mesure pour garder l'ordre.
      host.innerHTML += '<span class="tag" style="font-size:' + (weight / 100) +
                        'rem">' + TAGS[i] + '</span>';
    }
  }

  /* Aligne la hauteur des cartes et anime leur arrivée dans le viewport. */
  function revealCards() {
    var cards = UIKit.qsa('.card');

    for (var i = 0; i < cards.length; i++) {
      var rect = cards[i].getBoundingClientRect();

      // Hauteur de la plus grande carte, pour garder une grille régulière.
      var tallest = 0;
      var all = UIKit.qsa('.card');
      for (var j = 0; j < all.length; j++) {
        if (all[j].offsetHeight > tallest) {
          tallest = all[j].offsetHeight;
        }
      }
      cards[i].style.minHeight = tallest + 'px';

      if (rect.top < window.innerHeight - 40) {
        UIKit.cls(cards[i], 'visible', true);
        cards[i].style.transform = 'translateY(0px)';
      } else {
        cards[i].style.transform = 'translateY(24px)';
      }
    }

    // Dégradé d'opacité sur le nuage de mots-clés selon la position.
    var tags = UIKit.qsa('.tag');
    for (var k = 0; k < tags.length; k++) {
      var box = tags[k].getBoundingClientRect();
      var d = Math.abs(box.top - window.innerHeight / 2);
      tags[k].style.opacity = Math.max(0.25, 1 - d / window.innerHeight);
    }
  }

  /* Affiche les images une fois chargées. */
  function watchImages() {
    UIKit.qsa('.card img').forEach(function (img) {
      if (img.complete) {
        UIKit.cls(img, 'loaded', true);
      } else {
        img.addEventListener('load', function () {
          UIKit.cls(img, 'loaded', true);
        });
      }
    });
  }

  UIKit.ready(function () {
    buildTagCloud();
    watchImages();
    revealCards();
  });

  window.addEventListener('scroll', revealCards);
  window.addEventListener('resize', revealCards);
  window.addEventListener('load', revealCards);
})();
