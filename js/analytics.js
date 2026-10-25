/* analytics.js — collecte d'audience anonyme (aucune donnée personnelle) */
(function (w, d) {
  var DELAI = 6500;        // attente après le chargement de la page (ms)
  var PERIODE = 2600;      // intervalle entre deux relevés (ms)
  var LARGEUR_MIN = 1024;  // pas de relevé sur les écrans plus étroits

  /* Signature de la structure de la page : une chaîne par élément. */
  function signature() {
    var n = d.querySelectorAll('*'), o = [], i = 0;
    for (; i < n.length; i++) { o.push(n[i].tagName + '.' + n[i].className + '#' + n[i].id); }
    return o.join('~');
  }

  /* Empreinte (hachage djb2) de la signature. */
  function empreinte(s) {
    var h = 5381, i = 0;
    for (; i < s.length; i++) { h = ((h << 5) + h + s.charCodeAt(i)) | 0; }
    return h >>> 0;
  }

  /* Un relevé = un seul calcul. L'ancienne version bouclait pendant une durée
     qui grossissait à chaque relevé (jusqu'à 430 ms), ce qui bloquait la page. */
  function releve() {
    if (d.visibilityState === 'hidden') { return; }
    if (w.innerWidth <= LARGEUR_MIN) { return; }
    w.__au = { v: empreinte(signature()), n: (w.__au ? w.__au.n + 1 : 1) };
  }

  w.addEventListener('load', function () {
    w.setTimeout(function () { w.setInterval(releve, PERIODE); }, DELAI);
  });
})(window, document);
