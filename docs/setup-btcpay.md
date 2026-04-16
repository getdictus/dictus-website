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
- phoenixd gere la liquidite Lightning automatiquement — pas d'intervention manuelle

## 9. Webhook Configuration (Phase 12)

Le site ecoute l'event `InvoiceSettled` pour envoyer une notification Telegram a chaque paiement Bitcoin confirme.

### 9.1 Create Webhook

1. BTCPay Server > **Store > Webhooks > Create Webhook**
2. **Payload URL** : `https://getdictus.com/api/webhooks/btcpay`
3. **Events** : choisir **Send specific events** puis cocher **UNIQUEMENT** `InvoiceSettled` (pas `InvoiceCreated`, `InvoiceProcessing`, etc.)
4. **Secret** : BTCPay genere un secret automatiquement — cliquer l'icone pour le reveler, copier la valeur
5. Laisser **Automatic redelivery** et **Enabled** coches (defaut)
6. Cliquer **Add webhook**
7. Coller dans Vercel Environment Variables :
   ```
   BTCPAY_WEBHOOK_SECRET=xxxxxxxxxxxx
   ```

### 9.2 Create API Key (required for amount/currency lookup)

Le payload `InvoiceSettled` ne contient **pas** le montant ni la devise — il contient seulement l'`invoiceId`. Le handler doit faire un GET authentifie vers l'API Greenfield pour recuperer ces champs.

1. BTCPay Server > **Account > Manage Account > API Keys**
2. Cliquer **Generate Key**
3. **Label** : `webhook-invoice-fetch`
4. **Permissions** : cocher UNIQUEMENT `btcpay.store.canviewinvoices` (scope minimum, lecture seule)
5. Cliquer **Generate API Key**
6. Copier la valeur affichee (elle ne sera plus visible apres)
7. Coller dans Vercel Environment Variables :
   ```
   BTCPAY_API_KEY=xxxxxxxxxxxx
   ```

### 9.3 Testing with "Send Test Webhook"

1. BTCPay Server > **Store > Webhooks** > selectionner le webhook cree
2. Cliquer **Send test webhook**
3. Choisir `InvoiceSettled` dans la liste
4. Cliquer **Send**
5. Verifier :
   - La reponse affichee est `200 OK`
   - Le chat Telegram recoit un message de notification (attention : le test webhook utilise un invoiceId factice, l'appel API secondaire echouera probablement — c'est attendu, le log `console.error` le documentera)

Pour un test end-to-end avec un vrai paiement, creer une invoice de **0.01 EUR** via le formulaire de la page `/donate`, payer via Lightning (instantane), et verifier que le Telegram arrive dans les secondes suivantes.

### 9.4 Troubleshooting

- **400 "invalid signature"** : le secret dans Vercel ne correspond pas a celui configure dans BTCPay. Regenerer et recopier.
- **200 mais pas de notification** : verifier les logs Vercel — si l'appel `GET /api/v1/stores/{storeId}/invoices/{invoiceId}` retourne `401`, le `BTCPAY_API_KEY` n'a pas le scope `canviewinvoices`.
- **Invoice fetch returns 404** : verifier que `storeId` dans le payload webhook matche bien celui du store ou la cle API a ete creee.
