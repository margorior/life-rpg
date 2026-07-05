# Life RPG — v3 "Opérateur"

App de vie gamifiée : 50 niveaux, paliers verrouillés par l'équilibre, 9 catégories + sous-catégories,
quêtes planifiées par jour, routines matin/soir, avatar SVG évolutif, radar de performance,
streak avec bonus, export/import des données. 100% autonome — aucun service externe, aucun coût.

## Lancer
```bash
npx serve .        # ou python -m http.server 8080
```
Déploiement : copier le dossier sur un serveur web (nginx), HTTPS requis pour l'installation PWA
(Chrome Android → Ajouter à l'écran d'accueil).

## Règles du jeu
- Courbe XP : 2,5 × (niveau−1)^1,9 (~4000 XP pour le niveau 50 = des années de constance).
- Paliers verrouillés : niv. 20 → Rang 5 dans TOUTES les catégories ; niv. 35 → Rang 10 partout ;
  niv. 45 → Rang 15 partout + streak 30 jours. Rang = XP catégorie / 10.
- Changement de jour : quêtes réussies remises à zéro ; prévues non faites → perte de leur XP ;
  routine incomplète → −0,5 ; journée 100% → streak +1 et bonus (+0,5 / +1 à 7j / +1,5 à 30j).
- Routines : complète = +1 XP Discipline. L'avatar prend de la carrure avec l'XP Force (max à 120 XP).
- Icônes PWA : ajouter icons/icon-192.png et icons/icon-512.png.

## Données
Export/Import JSON dans l'onglet Journal (transfert PC → téléphone, sauvegarde).
Stockage : localStorage du navigateur.
