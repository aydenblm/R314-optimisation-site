# TP d'optimisation web — R3.14

Site support du TP d'optimisation et d'hébergement, BUT MMI Béziers.

**👉 Le site : <https://nico3807.github.io/R314-optimisation-site/>**

Ce site fonctionne et s'affiche correctement. Il est simplement **lent**, et
c'est l'objet du TP : diagnostiquer pourquoi, corriger, et mesurer les gains.

## Consignes

Tout est dans le site : bouton **« Consignes du TP »** dans le menu. Vous y
trouverez les attendus et le barème, la méthodologie de mesure, et un guide de
résolution par famille de problème.

Accès direct :

- [Consignes](https://nico3807.github.io/R314-optimisation-site/consignes.html)
- [Méthodologie](https://nico3807.github.io/R314-optimisation-site/methodologie.html)
- [Guide de résolution](https://nico3807.github.io/R314-optimisation-site/guide.html)
- [Barème](https://nico3807.github.io/R314-optimisation-site/bareme.html)

## Pour travailler dessus

Forkez ce dépôt, puis servez-le en HTTP — un `file://` fausse les mesures
réseau :

```bash
git clone https://github.com/<votre-compte>/R314-optimisation-site.git
cd R314-optimisation-site
python3 -m http.server 8000
```

Puis <http://localhost:8000>.

Live Server (VS Code) fait aussi l'affaire pour éditer, mais **pas pour
mesurer** : il injecte un script de rechargement dans chaque page. Et aucun
serveur local ne compresse les fichiers texte, contrairement à GitHub Pages —
vos relevés de référence se font donc sur le site en ligne. Le détail est dans
la [méthodologie](https://nico3807.github.io/R314-optimisation-site/methodologie.html).

Un widget de mesure est intégré, désactivé par défaut pour ne pas fausser vos
relevés. Activez-le avec `?perf=1` :
<http://localhost:8000/index.html?perf=1>.

---

*Ce dépôt est la copie publiée du sujet. Il est régénéré depuis le dépôt de
travail : n'y poussez pas de corrections, travaillez sur votre fork.*
