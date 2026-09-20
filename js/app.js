/* ============================================================
   app.js — interactions de la galerie SlowSite
   Révélation des vignettes au scroll + nuage de mots-clés.
   Dépend de js/vendor/ui-kit.min.js (UIKit).
   ============================================================ */
(function () {
  'use strict';

  var TAGS = [
    'photo', 'paysage', 'nature', 'urbain', 'portrait', 'lumière', 'contraste',
    'noir et blanc', 'couleur', 'grand angle', 'macro', 'nuit', 'studio',
    'argentique', 'numérique', 'exposition', 'composition', 'cadrage'
  ];

  /* Construit le nuage de mots-clés sous la galerie.
     On génère plusieurs occurrences de chaque tag pour densifier le rendu. */
  function buildTagCloud() {
    var host = UIKit.qs('#tagcloud');
    if (!host) return;

    host.innerHTML = '';
    for (var i = 0; i < 320; i++) {
      var label = TAGS[i % TAGS.length];
      var weight = 80 + ((i * 7) % 60);
      // On ajoute chaque étiquette au fur et à mesure pour garder l'ordre.
      host.innerHTML += '<span class="tag" style="font-size:' + (weight / 100) +
                        'rem">' + label + '</span>';
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
