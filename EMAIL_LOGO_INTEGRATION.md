# Guide d'intégration de logo dans les templates d'email

Ce guide explique comment intégrer correctement un logo dans un template d'email, en couvrant les différentes méthodes, les bonnes pratiques et les solutions aux problèmes courants.

## Table des matières

1. [Méthodes d'intégration](#méthodes-dintégration)
2. [Méthode recommandée : URL externe](#méthode-recommandée--url-externe)
3. [Méthode alternative : Base64](#méthode-alternative--base64)
4. [Bonnes pratiques](#bonnes-pratiques)
5. [Problèmes courants et solutions](#problèmes-courants-et-solutions)
6. [Exemple complet](#exemple-complet)

---

## Méthodes d'intégration

Il existe principalement deux méthodes pour intégrer un logo dans un email :

1. **URL externe** (recommandée) : Le logo est hébergé sur un serveur web accessible publiquement
2. **Base64 inline** : Le logo est encodé directement dans le HTML de l'email

### Comparaison des méthodes

| Méthode | Avantages | Inconvénients |
|---------|-----------|---------------|
| **URL externe** | ✅ Taille d'email réduite<br>✅ Facile à mettre à jour<br>✅ Meilleure compatibilité | ❌ Nécessite un hébergement public<br>❌ Peut être bloqué par certains clients email |
| **Base64** | ✅ Fonctionne même si l'URL est bloquée<br>✅ Pas de dépendance externe | ❌ Augmente la taille de l'email<br>❌ Plus difficile à maintenir |

---

## Méthode recommandée : URL externe

### 1. Préparer le fichier logo

**Important** : Le fichier doit être :
- ✅ Suivi par Git (si vous utilisez un système de contrôle de version)
- ✅ Déployé sur votre serveur/hébergement
- ✅ Accessible publiquement via HTTPS
- ✅ Format optimisé (PNG avec transparence ou JPEG)

### 2. Vérifier l'accessibilité

Avant d'utiliser l'URL dans votre template, vérifiez que l'image est accessible :

```bash
# Test avec curl
curl -I https://www.votredomaine.com/images/logo.png

# Devrait retourner :
# HTTP/2 200
# Content-Type: image/png
```

### 3. Utiliser l'URL dans le template

```html
<!-- Logo section -->
<div style="text-align: center; padding: 32px 24px 24px 24px; border-bottom: 1px solid #e5e5e5;">
  <img 
    src="https://www.votredomaine.com/images/logo.png" 
    alt="Nom de votre entreprise" 
    style="max-width: 280px; height: auto; margin: 0 auto; display: block;"
  >
</div>
```

### 4. Encoder l'URL si nécessaire

Si le nom du fichier contient des caractères spéciaux (espaces, underscores, etc.), encodez l'URL :

```javascript
// Dans votre code JavaScript/Node.js
const logoUrl = encodeURI('https://www.votredomaine.com/images/logo_with_special_chars.png');

// Utilisation dans le template
const emailHTML = `
  <img src="${logoUrl}" alt="Logo" style="...">
`;
```

### 5. Points importants pour l'URL

- ✅ **Utilisez HTTPS** : Les clients email bloquent souvent les images HTTP
- ✅ **Utilisez le bon domaine** : Vérifiez si vous devez utiliser `www.` ou non
- ✅ **Utilisez un chemin absolu** : `/images/logo.png` au lieu de `images/logo.png`
- ✅ **Testez l'URL** : Ouvrez l'URL directement dans un navigateur pour vérifier

---

## Méthode alternative : Base64

Si l'URL externe ne fonctionne pas ou si vous préférez une solution autonome, utilisez Base64.

### 1. Encoder l'image en Base64

**Sur Windows (PowerShell) :**
```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes('images/logo.png')) | Out-File -Encoding utf8 logo_base64.txt
```

**Sur macOS/Linux :**
```bash
base64 -i images/logo.png -o logo_base64.txt
```

**En ligne de commande Node.js :**
```javascript
const fs = require('fs');
const imageBuffer = fs.readFileSync('images/logo.png');
const base64Image = imageBuffer.toString('base64');
console.log(base64Image);
```

### 2. Utiliser Base64 dans le template

```html
<!-- Logo section -->
<div style="text-align: center; padding: 32px 24px 24px 24px; border-bottom: 1px solid #e5e5e5;">
  <img 
    src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..." 
    alt="Nom de votre entreprise" 
    style="max-width: 280px; height: auto; margin: 0 auto; display: block;"
  >
</div>
```

**Format :** `data:image/[format];base64,[données_base64]`

---

## Bonnes pratiques

### 1. Taille et format

- ✅ **Format PNG** : Pour les logos avec transparence
- ✅ **Format JPEG** : Pour les photos ou logos sans transparence
- ✅ **Taille optimisée** : Compressez l'image avant utilisation (max 200-300px de largeur)
- ✅ **Poids du fichier** : Gardez le fichier sous 100KB si possible

### 2. Styles CSS inline

Les clients email ne supportent pas toujours les CSS externes. Utilisez des styles inline :

```html
<img 
  src="https://www.votredomaine.com/images/logo.png" 
  alt="Logo" 
  style="max-width: 280px; height: auto; margin: 0 auto; display: block;"
>
```

### 3. Texte alternatif (alt)

Toujours inclure un attribut `alt` descriptif :

```html
<img src="..." alt="Déménagement Boréal" style="...">
```

### 4. Fallback pour les images bloquées

Certains clients email bloquent les images par défaut. Ajoutez un fallback :

```html
<div style="text-align: center; padding: 32px 24px 24px 24px; border-bottom: 1px solid #e5e5e5;">
  <img 
    src="https://www.votredomaine.com/images/logo.png" 
    alt="Déménagement Boréal" 
    style="max-width: 280px; height: auto; margin: 0 auto; display: block;"
    onerror="this.onerror=null; this.style.display='none'; this.nextElementSibling.style.display='block';"
  >
  <div style="display: none; font-size: 24px; font-weight: 700; color: #1a1a1a; text-transform: uppercase; letter-spacing: 2px;">
    DÉMÉNAGEMENT BORÉAL
  </div>
</div>
```

### 5. Responsive design

Assurez-vous que le logo s'adapte aux petits écrans :

```html
<img 
  src="https://www.votredomaine.com/images/logo.png" 
  alt="Logo" 
  style="max-width: 280px; width: 100%; height: auto; margin: 0 auto; display: block;"
>
```

---

## Problèmes courants et solutions

### Problème 1 : L'image ne se charge pas

**Symptômes :**
- L'image ne s'affiche pas dans l'email
- L'URL montre des icônes ou des liens au lieu de l'image

**Solutions :**
1. ✅ Vérifiez que le fichier est bien déployé sur le serveur
2. ✅ Vérifiez que le fichier est suivi par Git (si applicable)
3. ✅ Testez l'URL directement dans un navigateur
4. ✅ Vérifiez que vous utilisez le bon domaine (`www.` ou non)
5. ✅ Vérifiez que l'URL utilise HTTPS

### Problème 2 : L'image est trop grande ou trop petite

**Solution :**
Ajustez la propriété `max-width` dans les styles inline :

```html
<!-- Logo plus grand -->
<img src="..." style="max-width: 300px; ...">

<!-- Logo plus petit -->
<img src="..." style="max-width: 150px; ...">
```

### Problème 3 : L'image est bloquée par le client email

**Solution :**
- Utilisez Base64 comme alternative
- Ajoutez un fallback texte
- Assurez-vous que l'URL utilise HTTPS

### Problème 4 : L'image ne s'affiche pas correctement sur mobile

**Solution :**
Utilisez des styles responsive :

```html
<img 
  src="..." 
  style="max-width: 280px; width: 100%; height: auto; margin: 0 auto; display: block;"
>
```

---

## Exemple complet

Voici un exemple complet d'intégration de logo dans un template d'email (comme utilisé dans `api/send-estimation.js`) :

```javascript
// Dans votre code (Node.js/JavaScript)
const logoUrl = encodeURI('https://www.demenagementboreal.ca/images/black_textlogo_white_background-removebg-preview.png');

const emailHTML = `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; background-color: #f5f5f5; margin: 0; padding: 40px 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); overflow: hidden;">
        <!-- Gradient line at top -->
        <div style="height: 4px; background: linear-gradient(90deg, #72adcb 0%, #5a9bb8 100%);"></div>
        
        <!-- Logo section -->
        <div style="text-align: center; padding: 32px 24px 24px 24px; border-bottom: 1px solid #e5e5e5;">
          <img 
            src="${logoUrl}" 
            alt="Déménagement Boréal" 
            style="max-width: 280px; height: auto; margin: 0 auto; display: block;"
            onerror="this.onerror=null; this.style.display='none'; this.nextElementSibling.style.display='block';"
          >
          <div style="display: none; font-size: 24px; font-weight: 700; color: #1a1a1a; text-transform: uppercase; letter-spacing: 2px;">
            DÉMÉNAGEMENT BORÉAL
          </div>
        </div>
        
        <!-- Content -->
        <div style="padding: 32px 24px;">
          <h1 style="color: #1a1a1a; font-size: 24px; font-weight: 700; margin: 0 0 12px 0; text-align: center;">
            Votre titre ici
          </h1>
          <!-- Reste du contenu -->
        </div>
      </div>
    </body>
  </html>
`;
```

---

## Checklist d'intégration

Avant de déployer votre template d'email, vérifiez :

- [ ] Le fichier logo est accessible publiquement via HTTPS
- [ ] Le fichier est suivi par Git (si applicable)
- [ ] L'URL est testée et fonctionne dans un navigateur
- [ ] Les styles CSS sont inline
- [ ] Un attribut `alt` descriptif est présent
- [ ] Un fallback texte est prévu si l'image ne charge pas
- [ ] La taille du logo est appropriée (max-width: 200-300px)
- [ ] Le logo est responsive (width: 100%)
- [ ] L'URL est encodée si elle contient des caractères spéciaux

---

## Ressources supplémentaires

- [Can I Email](https://www.caniemail.com/) : Compatibilité des fonctionnalités email
- [Email on Acid](https://www.emailonacid.com/) : Tests de rendu email
- [Litmus](https://www.litmus.com/) : Tests de compatibilité email

---

## Notes importantes

1. **Toujours tester** : Testez vos emails sur plusieurs clients (Gmail, Outlook, Apple Mail, etc.)
2. **HTTPS obligatoire** : La plupart des clients email bloquent les images HTTP
3. **Taille du fichier** : Gardez les images légères pour un chargement rapide
4. **Fallback** : Prévoyez toujours un fallback si l'image ne charge pas

---

*Dernière mise à jour : Novembre 2025*


