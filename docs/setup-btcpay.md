# BTCPay Server Setup Guide — Contribution Dictus

Guide de deploiement et configuration BTCPay Server pour accepter les contributions Bitcoin sur la page /donate de Dictus.

## 1. Overview

- **BTCPay Server** est un processeur de paiement Bitcoin auto-heberge et open source
- Deux options de deploiement :
  - **Option A : Umbrel + Cloudflare Tunnel** (recommande, 0 EUR/mois)
  - **Option B : Hetzner CAX11 VPS** (fallback, 4 EUR/mois)
- Utilise **phoenixd** pour le Lightning Network (gestion automatique de la liquidite)

## 2. Option A : Umbrel + Cloudflare Tunnel (Recommande — 0 EUR/mois)

### Prerequisites

- Node Umbrel operationnel avec Bitcoin Core synchronise
- Compte Cloudflare avec le domaine `getdictus.com` configure

### Etape 1 : Installer BTCPay Server

1. Ouvrir l'Umbrel App Store
2. Rechercher **BTCPay Server**
3. Cliquer **Install**
4. Attendre la fin de l'installation

### Etape 2 : Configurer Cloudflare Tunnel

1. Installer `cloudflared` sur le serveur Umbrel (ou utiliser l'app Cloudflare Tunnel si disponible dans l'Umbrel App Store)
2. Se connecter a Cloudflare :
   ```bash
   cloudflared tunnel login
   ```
3. Creer le tunnel :
   ```bash
   cloudflared tunnel create btcpay
   ```
4. Configurer le routage vers l'adresse locale de BTCPay (typiquement `localhost:23001`) :
   ```yaml
   # ~/.cloudflared/config.yml
   tunnel: <TUNNEL_ID>
   credentials-file: ~/.cloudflared/<TUNNEL_ID>.json

   ingress:
     - hostname: btcpay.getdictus.com
       service: http://localhost:23001
     - service: http_status:404
   ```
5. Creer l'enregistrement DNS :
   ```bash
   cloudflared tunnel route dns btcpay btcpay.getdictus.com
   ```
6. Demarrer le tunnel :
   ```bash
   cloudflared tunnel run btcpay
   ```

### Etape 3 : Verifier l'acces public

Ouvrir <https://btcpay.getdictus.com> dans un navigateur — la page de creation de compte admin doit s'afficher.

## 3. Option B : Hetzner CAX11 VPS (Fallback — 4 EUR/mois)

1. Louer un VPS **Hetzner CAX11** ARM (4 EUR/mois, 4 GB RAM, 40 GB disque)
2. Se connecter en SSH au serveur
3. Deployer BTCPay Server via Docker :
   ```bash
   export BTCPAY_HOST="btcpay.getdictus.com"
   export NBITCOIN_NETWORK="mainnet"
   export BTCPAYGEN_CRYPTO1="btc"
   export BTCPAYGEN_LIGHTNING="clightning"
   export BTCPAYGEN_ADDITIONAL_FRAGMENTS="opt-save-storage"
   . ./btcpay-setup.sh -i
   ```
4. Configurer le DNS : `btcpay.getdictus.com` -> adresse IP du serveur
5. Le fragment `opt-save-storage` active le mode prune du node Bitcoin (economise l'espace disque)

## 4. Store Configuration (les deux options)

1. **Creer le compte admin** lors de la premiere visite sur `https://btcpay.getdictus.com`
2. **Creer un Store** : `Dictus Contributions`
3. **Store Settings > General** :
   - **Allow anyone to create invoice** : ACTIVER (CRITICAL — le formulaire POST echouera sans ce reglage)
   - Default currency : **EUR**
4. **Configurer le wallet Bitcoin** :
   - **On-chain** : Creer un nouveau wallet ou importer un xpub existant
   - **Lightning** : Installer le plugin phoenixd (voir section suivante)

## 5. phoenixd Lightning Setup

1. Dans BTCPay Server, aller dans **Server Settings > Plugins**
2. Installer le plugin **phoenixd**
3. phoenixd gere automatiquement :
   - L'ouverture des canaux Lightning
   - La gestion de la liquidite
   - Pas d'intervention manuelle necessaire
4. Verifier que Lightning est actif : **Store > Lightning > Connection status**

## 6. Update Config File

Ouvrir `src/config/donate.ts` et remplacer les valeurs placeholder :

```typescript
export const btcpayConfig = {
  serverUrl: "https://btcpay.getdictus.com",
  storeId: "YOUR_ACTUAL_STORE_ID",
} as const;
```

Pour trouver le Store ID : **Store Settings > General > Store ID** field.

## 7. Testing

1. Ouvrir `https://btcpay.getdictus.com/api/v1/invoices` dans le navigateur — doit afficher les infos API
2. Tester le form POST : creer une invoice de test en soumettant un formulaire avec `storeId` + `price` + `currency`
3. Verifier que la page invoice affiche un QR code pour on-chain et Lightning
4. Tester un petit paiement sur mainnet (ou utiliser testnet d'abord)

## 8. Notes

- Aucune API key necessaire pour la creation d'invoices (utilise "Allow anyone to create invoice")
- Le Store ID est public (pas un secret) — safe to commit
- Pour les webhooks (Phase 12), la variable d'environnement `BTCPAY_WEBHOOK_SECRET` sera necessaire
- phoenixd gere la liquidite Lightning automatiquement — pas d'intervention manuelle
