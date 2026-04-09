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
- Pour les webhooks (Phase 12), la variable d'environnement `STRIPE_WEBHOOK_SECRET` sera necessaire
- Le produit s'appelle "Contribution Dictus" (pas "Don") car PIVI Solutions est une entreprise
