# Configuration des Variables d'Environnement Vercel

## 📋 Variables d'environnement requises

Pour que le calculateur de distance fonctionne correctement, vous devez configurer la variable d'environnement suivante dans Vercel :

### 🔑 GOOGLE_MAPS_API_KEY

**Description :** Clé API Google Maps pour activer le calcul automatique de distance et l'autocomplete des adresses.

**Comment obtenir votre clé API :**
1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Activez les APIs suivantes :
   - **Maps JavaScript API**
   - **Places API**
   - **Distance Matrix API**
4. Allez dans "Credentials" (Identifiants)
5. Cliquez sur "Create Credentials" → "API Key"
6. Copiez votre clé API

**Configuration dans Vercel :**

### Via le Dashboard Vercel :
1. Allez sur votre projet dans [Vercel Dashboard](https://vercel.com/dashboard)
2. Cliquez sur **Settings** (Paramètres)
3. Allez dans **Environment Variables** (Variables d'environnement)
4. Ajoutez une nouvelle variable :
   - **Name:** `GOOGLE_MAPS_API_KEY`
   - **Value:** Votre clé API Google Maps
   - **Environments:** Sélectionnez Production, Preview, et Development
5. Cliquez sur **Save**
6. **Important :** Redéployez votre projet pour que les changements prennent effet

### Via la CLI Vercel :
```bash
vercel env add GOOGLE_MAPS_API_KEY
# Entrez votre clé API quand demandé
# Sélectionnez les environnements (Production, Preview, Development)
```

### Via le fichier `.env.local` (pour développement local) :
Créez un fichier `.env.local` à la racine du projet :
```
GOOGLE_MAPS_API_KEY=votre_cle_api_ici
```

**⚠️ Important - Sécurité :**
- Ne commitez JAMAIS votre clé API dans Git
- Ajoutez `.env.local` à votre `.gitignore`
- La clé API est lue côté serveur uniquement via l'endpoint `/api/get-maps-key`
- Limitez les restrictions de votre clé API dans Google Cloud Console :
  - **Application restrictions:** HTTP referrers (websites)
  - **API restrictions:** Limitez aux APIs nécessaires (Maps JavaScript API, Places API, Distance Matrix API)

**Restrictions recommandées dans Google Cloud Console :**
```
Application restrictions:
- HTTP referrers (web sites)
- Ajoutez votre domaine Vercel: https://votre-domaine.vercel.app/*
- Ajoutez votre domaine de production: https://demenagementboreal.ca/*
- Pour le développement local: http://localhost:3000/*

API restrictions:
- Maps JavaScript API
- Places API
- Distance Matrix API
```

## ✅ Vérification

Après avoir configuré la variable d'environnement :

1. Redéployez votre projet sur Vercel
2. Testez le calculateur sur l'étape 4
3. Saisissez une adresse dans les champs "Adresse de départ" et "Adresse de destination"
4. Vérifiez que :
   - L'autocomplete Google Places fonctionne
   - La distance est calculée automatiquement
   - Les messages de succès/erreur s'affichent correctement

## 🔍 Dépannage

**Si Google Maps ne se charge pas :**
- Vérifiez que la variable `GOOGLE_MAPS_API_KEY` est bien configurée dans Vercel
- Vérifiez que vous avez redéployé après avoir ajouté la variable
- Vérifiez la console du navigateur pour les erreurs
- Vérifiez que les APIs sont activées dans Google Cloud Console
- Vérifiez que les restrictions de votre clé API permettent votre domaine

**Si vous voyez "API key not configured" :**
- La variable d'environnement n'est pas configurée ou n'est pas accessible
- Redéployez le projet après avoir ajouté la variable
- Vérifiez que la variable est disponible pour tous les environnements (Production, Preview, Development)

**Console du navigateur :**
- Ouvrez les outils de développement (F12)
- Allez dans l'onglet "Console"
- Recherchez les messages d'erreur ou d'avertissement liés à Google Maps

