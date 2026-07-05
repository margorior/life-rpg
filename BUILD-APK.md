# Générer l'APK Android — 15 minutes

## Prérequis : héberger l'app en HTTPS
L'APK d'une PWA (Trusted Web Activity) pointe vers ton app hébergée. Sur ton VPS :
```bash
rsync -av life-rpg-pwa/ user@vps:/var/www/life-rpg/
# nginx + certbot pour HTTPS (bloc serveur dans README.md)
```
Vérifie que https://rpg.ton-domaine.tld s'ouvre et que Chrome propose "Installer l'application".

## Méthode recommandée : PWABuilder (gratuit, sans Android Studio)
1. Va sur https://www.pwabuilder.com
2. Colle l'URL de ton app → Start. Le score doit être vert (manifest + service worker + icônes : tout est déjà dans le projet).
3. Package for stores → **Android** → télécharge le zip.
4. Dedans : un fichier **.apk signé** (installable direct) + un .aab (si un jour Play Store).
5. Envoie l'APK sur ton téléphone (Telegram/Drive/câble) → ouvre → autorise "sources inconnues" → installé.

⚠️ PWABuilder génère aussi un fichier `assetlinks.json` : place-le sur ton serveur dans
`/.well-known/assetlinks.json` pour que l'app s'ouvre en plein écran sans barre d'URL.

## Alternative immédiate (0 minute) : installation PWA native
Chrome Android → ton URL → menu ⋮ → "Ajouter à l'écran d'accueil".
Résultat quasi identique à l'APK : icône, plein écran, offline. L'APK apporte surtout
une vraie entrée dans la liste des applications Android.

## Alternative avancée : Capacitor (app 100% native, sans hébergement)
Si tu veux une app qui embarque les fichiers (pas besoin de serveur) :
```bash
npm create @capacitor/app life-rpg-native
# copie index.html, app.js, manifest, icons dans www/
npx cap add android
npx cap open android   # nécessite Android Studio → Build APK
```
Plus lourd à maintenir. Le combo VPS + PWABuilder est le bon choix vu ton infra.

## Mises à jour
PWA/TWA = l'app charge toujours la dernière version depuis ton serveur.
Tu déploies avec rsync, tous tes appareils sont à jour. Aucun rebuild d'APK nécessaire.
