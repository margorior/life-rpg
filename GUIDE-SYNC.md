# Guide — Sauvegarde en ligne & sync multi-appareils (GitHub Gist)

Ta progression est sauvegardée automatiquement dans un **Gist privé** de ton compte GitHub
(un fichier JSON invisible pour les autres), quelques secondes après chaque action.
Tous les appareils connectés avec le même token partagent la même progression.

## Étape 1 — Créer le token GitHub (une seule fois, 2 minutes)

1. Va sur **github.com** connecté à ton compte → clique ta photo en haut à droite → **Settings**
2. Menu de gauche, tout en bas : **Developer settings**
3. **Personal access tokens** → **Tokens (classic)** → **Generate new token** → **Generate new token (classic)**
4. Remplis :
   - **Note** : `life-rpg-sync`
   - **Expiration** : *No expiration* (ou 1 an, mais il faudra le refaire à l'échéance)
   - **Scopes** : coche UNIQUEMENT la case **`gist`** — rien d'autre.
     Ce token ne pourra donc QUE lire/écrire tes gists, aucun accès à tes repos ou ton compte.
5. **Generate token** en bas → GitHub affiche le token (commence par `ghp_…`)
6. ⚠ **Copie-le immédiatement** : il ne sera plus jamais affiché. Colle-le temporairement
   dans un endroit sûr (gestionnaire de mots de passe idéalement).

## Étape 2 — Connecter l'app (sur chaque appareil, 30 secondes)

1. Ouvre l'app → onglet **Suivi 📊** → carte **☁ Sauvegarde en ligne**
2. Colle le token dans le champ → **CONNECTER**
3. Premier appareil : l'app crée le Gist privé et y envoie ta progression.
   Appareils suivants : l'app retrouve la sauvegarde existante et **récupère ta progression**.

C'est tout. À partir de là, tout est automatique.

## Comment ça marche au quotidien

- **À chaque action** (cocher une quête, etc.) : sauvegarde envoyée ~3 s après.
- **À chaque ouverture** de l'app (et retour au premier plan) : la version en ligne est
  vérifiée ; si elle est plus récente que le local, elle est adoptée.
- **Indicateur dans le header** (à gauche de 🌙) :
  - **✓** vert : synchronisé
  - **⟳** : synchronisation en cours
  - **⚠** rouge : hors ligne ou token invalide — l'app fonctionne normalement en local,
    la sync reprendra toute seule au retour du réseau
- **Conflit** (deux appareils modifiés en même temps hors ligne) : le plus récent gagne.
  En usage normal (un appareil à la fois), ça n'arrive jamais.
- **Boutons** dans la carte : *Forcer la sync* (push + pull immédiats), *Déconnecter*
  (retire le token de l'appareil — progression locale conservée, Gist non supprimé).

## Sécurité — ce qu'il faut savoir

- Le Gist est **privé** (secret) : personne ne peut le voir ni le trouver.
- Le token est stocké **localement sur l'appareil**, dans une clé séparée :
  il n'est **jamais inclus** dans les exports JSON ni dans le Gist.
- Le scope `gist` seul ne donne AUCUN accès à tes repos, ton email, ou quoi que ce soit d'autre.
- Si un token fuit un jour : github.com → Settings → Developer settings → Tokens → **Delete**,
  puis regénère et reconnecte. Le pire qu'un voleur de token pouvait faire : lire tes stats de jeu.

## Dépannage

| Symptôme | Cause probable | Solution |
|---|---|---|
| ⚠ permanent avec réseau OK | Token expiré ou supprimé | Regénère un token (Étape 1) → Déconnecter → reconnecter |
| "Connexion impossible" au Connecter | Mauvais scope ou faute de frappe | Vérifie que la case `gist` était cochée, recolle le token |
| Progression différente entre 2 appareils | L'un des deux n'est pas connecté | Suivi → carte ☁ : les DEUX doivent afficher "✓ Connectée" |
| Retour dans le temps après reconnexion | Le Gist contenait une vieille sauvegarde | Sur l'appareil à jour : *Forcer la sync* pour écraser le Gist |

## Où voir la version de l'app
Tout en bas de l'onglet **Suivi 📊** : `LIFE RPG v5.2.0`. Après une mise à jour (git push),
ce numéro doit changer sur ton téléphone — plus besoin de deviner si la maj est passée.
