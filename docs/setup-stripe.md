# Stripe Setup Guide — Contribution Dictus

Guide de configuration Stripe pour accepter les contributions sur la page /donate de Dictus.

## 1. Prerequisites

- **SIRET** de PIVI Solutions
- **IBAN** du compte bancaire pour les versements
- **Email** pour le compte Stripe

## 2. Create Stripe Account

1. Aller sur <https://dashboard.stripe.com/register>
2. Completer la verification business :
   - Type d'entreprise : PIVI Solutions
   - Numero SIRET
   - Coordonnees bancaires (IBAN)
3. Attendre 1-2 jours ouvrables pour la verification
4. Activer le **live mode** une fois verifie

## 3. Create Product

1. Naviguer vers **Dashboard > Products > Add Product**
2. Product name : `Contribution Dictus`
3. Description : `Contribution au projet Dictus`
4. Pas d'image necessaire

## 4. Create Fixed-Price Payment Links

Creer 4 Payment Links pour les montants fixes : **5, 10, 25, 50 EUR**.

Pour chaque montant :

1. Sur le Product "Contribution Dictus", cliquer **Add a Price**
2. Type : **One-time**
3. Montant fixe en EUR (ex: 5,00 EUR)
4. Sauvegarder le Price
5. Cliquer **Create Payment Link** depuis ce Price
6. Settings du Payment Link :
   - Quantity adjustment : **desactive**
   - Promo codes : **desactive**
   - Shipping : **desactive**
7. Copier l'URL du Payment Link (format : `https://buy.stripe.com/...`)

Repeter pour chaque montant : 5, 10, 25, 50 EUR.

## 5. Create Custom Amount Payment Link

1. Sur le Product "Contribution Dictus", cliquer **Add a Price**
2. Type : **One-time**
3. Pricing model : **Customer chooses what to pay**
4. Suggested amounts : 5, 10, 25, 50 EUR
5. Minimum : **1 EUR**
6. Maximum : **999 EUR**
7. Sauvegarder le Price
8. Cliquer **Create Payment Link** depuis ce Price
9. Copier l'URL du Payment Link

## 6. Update Config File

Ouvrir `src/config/donate.ts` et remplacer les URLs PLACEHOLDER par les vrais Payment Links :

```typescript
export const stripeLinks = {
  5: "https://buy.stripe.com/YOUR_5EUR_LINK",
  10: "https://buy.stripe.com/YOUR_10EUR_LINK",
  25: "https://buy.stripe.com/YOUR_25EUR_LINK",
  50: "https://buy.stripe.com/YOUR_50EUR_LINK",
  custom: "https://buy.stripe.com/YOUR_CUSTOM_LINK",
} as const;
```

## 7. Testing

1. Utiliser le **Stripe test mode** pour verifier chaque lien
2. Confirmer le flow de paiement :
   - Clic sur le Payment Link
   - Page Stripe Checkout s'affiche
   - Paiement de test reussi
3. Basculer en **live mode** quand tout est valide

## 8. Notes

- Les Payment Links sont des URLs publiques (pas des secrets) — safe to commit
- Aucun Stripe SDK ni API key necessaire pour ce setup
- Le produit s'appelle "Contribution Dictus" (pas "Don") car PIVI Solutions est une entreprise

## 9. Webhook Configuration (Phase 12)

Le site ecoute les paiements Stripe via un endpoint webhook pour envoyer une notification Telegram a chaque contribution.

### 9.1 Create Webhook Endpoint (production)

1. Stripe Dashboard > **Developers > Webhooks**
2. Cliquer **Add endpoint**
3. **Endpoint URL** : `https://getdictus.com/api/webhooks/stripe`
4. **Events to send** : selectionner **UNIQUEMENT** `checkout.session.completed` (ne pas activer d'autres events — payload plus leger, moins de signatures a verifier)
5. **API version** : laisser la valeur par defaut
6. Cliquer **Add endpoint**
7. Sur la page du nouvel endpoint, cliquer **Reveal** sous "Signing secret" et copier la valeur `whsec_...`
8. Coller dans Vercel Environment Variables (production) :
   ```
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx
   ```

### 9.2 Local Development Testing

En developpement, `stripe listen` forward les events reels vers `localhost` avec un secret ephemere different de celui de production.

1. Installer le Stripe CLI : <https://stripe.com/docs/stripe-cli>
2. Se connecter : `stripe login`
3. Dans un terminal dedie, lancer le forwarder :
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
   Sortie :
   ```
   > Ready! Your webhook signing secret is whsec_abc123... (^C to quit)
   ```
4. **Copier ce `whsec_...` dans `.env.local`** (il est different du secret production) :
   ```
   STRIPE_WEBHOOK_SECRET=whsec_abc123...
   ```
5. Redemarrer `npm run dev` pour que Next.js recharge les env vars
6. Dans un 3e terminal, declencher un event signe :
   ```bash
   stripe trigger checkout.session.completed
   ```
7. Verifier :
   - Le terminal `stripe listen` affiche `2xx` pour l'event
   - Le chat Telegram recoit un message de notification
   - Pas de log d'erreur dans `npm run dev`

### 9.3 Troubleshooting

- **400 "invalid signature"** : le secret dans `.env.local` ne correspond pas a celui imprime par `stripe listen`. Chaque `stripe listen` genere un nouveau secret, il faut le recopier.
- **Timestamp outside the tolerance zone** : l'horloge locale a derive de plus de 5 minutes. Resynchroniser (ntp/macOS System Settings).
- **Pas de notification Telegram** : verifier `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID` (voir `docs/setup-telegram.md`).
