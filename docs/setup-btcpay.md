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
- **200 mais pas de notification, logs montrent type=`InvoicePaymentSettled`** : le webhook BTCPay est abonne au mauvais event. UI BTCPay confond facilement deux libelles tres proches :
  - `An invoice has been settled` = `InvoiceSettled` ← celui-la est attendu par le handler
  - `A payment has been settled` = `InvoicePaymentSettled` ← ignore par le handler

  Editer le webhook, decocher le mauvais, cocher le bon, sauvegarder.

## 10. Developpement local avec ngrok

BTCPay Server doit pouvoir POST sur l'endpoint webhook. En dev local (`localhost:3000`), pas reachable depuis internet. Solution : tunnel ngrok.

### 10.1 Prerequis

- `ngrok` installe (`brew install ngrok`) avec compte gratuit configure (`ngrok config add-authtoken ...`)
- Stripe CLI installe (`brew install stripe/stripe-cli/stripe`) pour le webhook Stripe en dev

### 10.2 Lancer la stack locale

3 terminaux :

```bash
# Terminal 1 — dev server
npm run dev

# Terminal 2 — tunnel public vers localhost:3000
ngrok http 3000
# => copier l'URL https://xxxxx.ngrok-free.dev affichee

# Terminal 3 — Stripe CLI (forwarding webhook vers handler local)
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# => copier le whsec_... affiche
```

### 10.3 Configurer BTCPay pour pointer sur ngrok

1. BTCPay > Store > **Webhooks** > creer un webhook dedie au dev (NE PAS reutiliser le webhook prod)
2. **Payload URL** : `https://xxxxx.ngrok-free.dev/api/webhooks/btcpay`
3. **Events** : `An invoice has been settled` (InvoiceSettled) UNIQUEMENT
4. Copier le secret affiche
5. Coller dans `.env.local` :
   ```
   BTCPAY_WEBHOOK_SECRET=xxxxx
   ```

### 10.4 Synchroniser le webhook secret Stripe

Le `whsec_...` affiche par `stripe listen` est ephemere et change a chaque restart de la commande. Coller la derniere valeur dans `.env.local` :
```
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```
Puis redemarrer `npm run dev` (Next.js charge `.env.local` au boot).

### 10.5 Inspecter les requetes

- Dashboard ngrok local : <http://127.0.0.1:4040> — voir tous les POST entrants avec headers + body decodes
- Logs Stripe CLI : affiche chaque event forwarde et le code retour du handler
- Logs Next.js : `[btcpay-webhook]` et `[stripe-webhook]` prefixent les lignes pertinentes

### 10.6 Limitations ngrok free

- L'URL change a chaque relance — il faut alors mettre a jour le webhook BTCPay manuellement
- Page d'avertissement "Visit Site" sur les GET HTML depuis navigateur (les POST server-to-server passent sans bloquer car User-Agent != navigateur)
- Pour eviter de re-creer le webhook BTCPay a chaque session, garder une session ngrok ouverte longtemps OU passer en plan paye avec subdomain fixe

## 11. Mise en production (Vercel)

### 11.1 Webhook BTCPay prod

Creer un **deuxieme** webhook BTCPay dedie a la prod (ne pas modifier celui de dev) :

1. Store > **Webhooks > Create Webhook**
2. **Payload URL** : `https://getdictus.com/api/webhooks/btcpay`
3. **Events** : `An invoice has been settled`
4. Copier le secret

L'API key (scope `canviewinvoices`) peut etre reutilisee — pas besoin d'en creer une nouvelle.

### 11.2 Variables d'environnement Vercel

Project > **Settings > Environment Variables**, scope `Production` :

| Variable | Valeur |
|----------|--------|
| `BTCPAY_WEBHOOK_SECRET` | Secret du webhook prod cree en 11.1 |
| `BTCPAY_API_KEY` | Cle API existante (scope canviewinvoices) |
| `STRIPE_SECRET_KEY` | `sk_live_...` (Stripe Dashboard > API keys, mode Live) — **requis** car le site cree des Checkout Sessions cote serveur |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` (Stripe webhook prod, voir 11.3) |
| `TELEGRAM_BOT_TOKEN` | Token bot existant (peut etre partage dev/prod) |
| `TELEGRAM_CHAT_ID` | ID du chat de notif (meme que dev OU dedie prod) |

Note : pas de `NEXT_PUBLIC_STRIPE_LINK_*`. Le flow Stripe utilise l'API Checkout Sessions cote serveur — les liens sont generes dynamiquement avec le bon montant a chaque clic, pas besoin de Payment Links pre-crees.

### 11.3 Webhook Stripe prod

1. Stripe Dashboard > toggle **Test mode** OFF (passer en Live)
2. **Developers > Webhooks > Add endpoint**
3. **Endpoint URL** : `https://getdictus.com/api/webhooks/stripe`
4. **Events** : `checkout.session.completed` UNIQUEMENT
5. Copier le signing secret `whsec_...`
6. Coller dans Vercel `STRIPE_WEBHOOK_SECRET`

### 11.4 Validation post-deploy

1. Forcer un redeploy Vercel apres avoir set toutes les env vars
2. Stripe : **Webhooks > endpoint prod > Send test event** `checkout.session.completed` → attendre `200 OK` + notif Telegram
3. BTCPay : creer une vraie invoice 1 EUR via la page `/donate` en prod, payer en Lightning, verifier Telegram dans les secondes
4. Si OK, supprimer le webhook dev BTCPay (sauf besoin continu en local)
