# Telegram Bot Setup Guide — Notifications de contributions

Guide de configuration du bot Telegram qui recoit une notification a chaque contribution (Stripe ou BTCPay).

## 1. Overview

- Un **seul bot Telegram** envoie des messages dans un **seul chat** (privee, groupe ou canal)
- Le bot utilise l'endpoint `sendMessage` avec `parse_mode: MarkdownV2`
- Aucun webhook entrant sur Telegram — notre code POST vers `api.telegram.org`
- Langue des messages : anglais (chat de supervision interne)

## 2. Create Bot via BotFather

1. Ouvrir Telegram, chercher **@BotFather**, demarrer une conversation
2. Envoyer `/newbot`
3. Saisir un nom public (ex: `Dictus Contributions`)
4. Saisir un username unique se terminant par `bot` (ex: `dictus_contrib_bot`)
5. BotFather repond avec un token au format `123456789:ABC-DEF_...`
6. Copier le token dans `.env.local` :
   ```
   TELEGRAM_BOT_TOKEN=123456789:ABC-DEF_...
   ```
7. (Optionnel) `/setdescription`, `/setabouttext`, `/setuserpic` pour personnaliser

## 3. Retrieve TELEGRAM_CHAT_ID

Trois scenarios, selon le type de chat cible :

### Scenario A : Chat prive (1-1 avec soi-meme)

1. Dans Telegram, ouvrir une discussion avec le bot fraichement cree
2. Envoyer `/start` ou n'importe quel message au bot
3. Ouvrir dans un navigateur : `https://api.telegram.org/bot{TOKEN}/getUpdates`
4. La reponse JSON contient `result[0].message.chat.id` — c'est un entier positif
5. Copier dans `.env.local` :
   ```
   TELEGRAM_CHAT_ID=123456789
   ```

### Scenario B : Groupe Telegram

1. Creer ou ouvrir le groupe cible
2. Ajouter le bot comme membre (icone groupe > Add members > chercher `@dictus_contrib_bot`)
3. Envoyer un message dans le groupe
4. Ouvrir `https://api.telegram.org/bot{TOKEN}/getUpdates`
5. Lire `result[0].message.chat.id` — c'est un entier **negatif** (ex: `-987654321`)
6. Stocker le signe negatif : `TELEGRAM_CHAT_ID=-987654321`

### Scenario C : Canal Telegram

1. Ajouter le bot comme **administrateur** du canal (les canaux exigent le statut admin)
2. Poster un message dans le canal (apres avoir ajoute le bot admin)
3. `getUpdates` retourne un chat.id commencant par `-100...` (ex: `-1001234567890`)
4. `TELEGRAM_CHAT_ID=-1001234567890`

**Warning signs :** si `getUpdates` retourne `{"ok":true,"result":[]}`, le bot n'a recu aucun message — envoyer au moins un message puis reessayer.

## 4. Test the Integration

Une fois les deux env vars remplies et apres avoir lance `npm run dev`, tester avec curl :

```bash
curl -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
  -H "Content-Type: application/json" \
  -d "{\"chat_id\": \"${TELEGRAM_CHAT_ID}\", \"text\": \"test\"}"
```

Reponse attendue : `{"ok":true,"result":{...}}` et un message `test` dans le chat cible.

Si la reponse contient `{"ok":false,"error_code":400,"description":"Bad Request: can't parse entities..."}`, c'est un bug d'echappement MarkdownV2 — verifier `src/lib/telegram.ts` > `escapeMarkdownV2`.

## 5. Rate Limits

- **1 msg/sec par chat** (limite Telegram)
- **30 msg/sec au total** sur le bot
- **20 msg/min** pour les groupes

Le volume de contributions attendu est tres inferieur a ces limites — aucun throttling cote application.

## 6. Notes

- Le `TELEGRAM_BOT_TOKEN` est un **secret** — ne jamais commiter, jamais utiliser `NEXT_PUBLIC_`
- Le `TELEGRAM_CHAT_ID` est egalement stocke server-side seulement
- Pour revoquer : BotFather > `/revoke` (genere un nouveau token, l'ancien devient invalide)
- Pour supprimer le bot : BotFather > `/deletebot`
