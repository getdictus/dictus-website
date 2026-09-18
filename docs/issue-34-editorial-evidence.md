# Sources et décisions éditoriales — issue #34

Vérifications du 18 septembre 2026. Les sources permettent de vérifier les
promesses des brouillons ; elles ne valent ni test physique de tous les parcours,
ni audit externe, ni relecture éditoriale de Pierre.

## Intentions et recherches

Recherches examinées pendant la rédaction, sans mesure de volume, difficulté,
trafic ou classement :

| Guide | Recherches FR / EN | Question et angle retenus | Action utile |
| --- | --- | --- | --- |
| iPhone | « dictée vocale iPhone clavier dicter texte applications » / « iPhone voice typing keyboard dictate in apps » | Comment préparer un clavier vocal et réussir une note ? Distinguer clavier Dictus et dictée Apple, expliquer les permissions, le modèle, le globe, l’aller-retour vers l’app et les limites des claviers tiers. | Présentation iPhone, App Store, support et confidentialité. |
| Ordinateur | « logiciel dictée vocale gratuit Mac Windows Linux hors ligne » / « free offline dictation software Mac Windows Linux » | Quel téléchargement choisir et comment préparer un essai ? Distinguer écriture au curseur et transcription de fichiers, gratuité durable de l’app et coût éventuel d’un fournisseur externe. | Téléchargements Desktop et support, avec limites d’installation explicites. |
| Confidentialité | « dictée vocale locale cloud confidentialité transcription hors ligne » / « offline dictation privacy voice text local cloud » | Où vont la voix et le texte ? Séparer les étapes, connexion initiale, conservation sur l’appareil et destination du texte. | Politique de confidentialité, code public et deux guides pratiques. |

Les résultats iPhone font remonter notamment le
[guide Apple de dictée](https://support.apple.com/fr-fr/guide/iphone/iph2c0651d2/ios)
et l’[aide Gboard](https://support.google.com/gboard/answer/2781851?co=GENIE.Platform%3DiOS&hl=fr-fr).
Les résultats ordinateur mêlent pages de téléchargement, listes comparatives et
transcription en ligne, dont [OpenWhispr](https://openwhispr.com/download) et
[YazSes](https://mskazemi.com/projects/yazses/). Les résultats confidentialité
font ressortir les questions « après téléchargement, est-ce hors ligne ? »,
« qu’en est-il de la reformulation ? » et « qu’est-ce qui reste enregistré ? ».
Ces observations servent à cadrer nos réponses, **pas à attribuer des pratiques
aux concurrents**. Les faits Dictus reposent sur les sources ci-dessous.

L’approche suit les recommandations Google de
[contenu utile](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
et de [métadonnées prises en charge](https://developers.google.com/search/docs/crawling-indexing/special-tags).
Aucune balise `meta keywords`, liste de produits classés sans test, promesse de
vitesse ou de précision, longueur cible arbitraire ou faux résultat dicté.

## iPhone : version publique, parcours et image

- La [fiche App Store française](https://apps.apple.com/fr/app/dictus-ai-voice-keyboard/id6761262378)
  et la [réponse Apple lookup](https://itunes.apple.com/lookup?id=6761262378&country=fr)
  indiquent `version: 1.8.2`, `minimumOsVersion: 17.0`, `price: 0`, `currency: EUR`,
  sortie de cette version le `2026-09-14T10:51:44Z`. Cela résout la contradiction
  historique 18+/17+ pour la version distribuée, sans promettre les prérequis
  d’une version future. L’offre Pro reste en préparation selon le brief #34.
- Le code est lu au [tag v1.8.2](https://github.com/getdictus/dictus-ios/tree/v1.8.2),
  distinct de `develop`. [L’accueil](https://github.com/getdictus/dictus-ios/tree/v1.8.2/DictusApp/Onboarding)
  passe par microphone, clavier, option d’amélioration selon appareil, modèle
  et tutoriel globe. `KeyboardSetupPage.swift` ouvre les réglages de l’app,
  demande l’activation du clavier et l’accès complet, puis le retour dans Dictus.
  `ModelDownloadPage.swift` attend installation et optimisation.
- [KeyboardState.swift](https://github.com/getdictus/dictus-ios/blob/v1.8.2/DictusKeyboard/KeyboardState.swift)
  peut ouvrir l’app lors du démarrage/préchargement.
  [ModelLoadingOverlay.swift](https://github.com/getdictus/dictus-ios/blob/v1.8.2/DictusApp/Views/ModelLoadingOverlay.swift)
  demande de revenir dans l’app de saisie et de retoucher le micro après la
  préparation. Le retour n’est donc pas décrit comme toujours automatique.
  [RecordingOverlay.swift](https://github.com/getdictus/dictus-ios/blob/v1.8.2/DictusKeyboard/Views/RecordingOverlay.swift)
  sépare la croix d’annulation et la coche de fin d’enregistrement.
- Apple documente les [limites des claviers tiers](https://developer.apple.com/documentation/uikit/configuring-a-custom-keyboard-interface) :
  champs sécurisés, certains champs téléphoniques, applications qui les refusent.
  Son [guide d’extension clavier](https://developer.apple.com/library/archive/documentation/General/Conceptual/ExtensibilityPG/CustomKeyboard.html)
  explique que l’accès complet permet le conteneur partagé **et techniquement le
  réseau**. Ne pas présenter cette permission comme un blocage réseau.
- Le visuel est `ios-demo-dictation.jpg`, 860 × 1864, frame réelle de la vidéo
  fournie le 18 septembre. Pierre a confirmé dans cette session **Dictus 1.8.2,
  iPhone 15 Pro Max** ; numéro de build et système installé non renseignés.
  Voir `docs/product-assets.md`. Cette image montre l’enregistrement actif et
  sa coche verte ; la vidéo contient ensuite le résultat inséré. Aucun texte ni
  écran inventé. Cette preuve d’usage n’est pas une réinstallation testée.

## Desktop : version, préparation et limites

- Dernière release publique vérifiée : [v0.3.0](https://github.com/getdictus/dictus-desktop/releases/tag/v0.3.0),
  11 septembre 2026, commit `d2ea181b8a684e89da011c847d9dd74a3670af4c`.
  Gratuité durable confirmée par `CLAUDE.md` et le brief ;
  [README versionné](https://github.com/getdictus/dictus-desktop/blob/v0.3.0/README.md).
- Assets : DMG `aarch64`/`x64` pour Mac, EXE et MSI `x64`/`arm64` pour Windows,
  AppImage `amd64`/`aarch64`, DEB `amd64`/`arm64`, RPM `x86_64`/`aarch64` pour
  Linux. Pas de Flatpak dans cette release. Les téléchargements du site suivent
  les releases : ne pas confondre leur ancienne valeur de repli avec la version
  effectivement distribuée.
- `src/App.tsx`, `AccessibilityOnboarding.tsx` et `Onboarding.tsx` de la release :
  autorisations avant modèle ; microphone et accessibilité sur Mac, microphone
  sur Windows, écran d’autorisations ignoré sur Linux. Attente du téléchargement,
  vérification et extraction du modèle avant sélection et utilisation.
- [Catalogue des modèles](https://github.com/getdictus/dictus-desktop/blob/v0.3.0/src-tauri/src/managers/model.rs) :
  modèle recommandé Parakeet V3. La capture montre **Whisper Turbo choisi par
  l’utilisateur**, pas une valeur par défaut. Aucun poids ni nombre de langues
  n’est nécessaire au guide, pour éviter une fausse exigence universelle.
- [Réglages](https://github.com/getdictus/dictus-desktop/blob/v0.3.0/src-tauri/src/settings.rs)
  et `GeneralSettings.tsx` : utiliser le raccourci affiché, vérifier le mode
  Appuyer pour parler et le micro dans Son. Ne pas promettre un son au démarrage
  (désactivé par défaut) ni un raccourci inchangé chez tous les utilisateurs.
- [Issue #61](https://github.com/getdictus/dictus-desktop/issues/61) : ticket de
  notarisation absent des DMG, malgré l’app interne notarisée. La phrase README
  « ouvre normalement » n’est donc pas reprise. README signale aussi un
  installateur Windows non signé. Aucune procédure de contournement de sécurité
  n’est présentée comme testée. Linux/Wayland reste partiel selon README.
- Les captures `desktop-general-fr.jpg` / `desktop-general-en.jpg` proviennent de
  macOS, app installée 0.3.0, le 17 septembre. Elles montrent les réglages, pas
  une dictée complète. Aucun nouveau parcours natif d’installation/dictée n’a été
  exécuté dans cette session, sur aucun des trois systèmes. L’article le dit et
  propose une préparation et un protocole d’essai, avec support en cas d’écart.

## Confidentialité : limites de la promesse

- [Politique Desktop v0.3.0](https://github.com/getdictus/dictus-desktop/blob/v0.3.0/docs/PRIVACY.md) :
  transcription audio locale, post-traitement facultatif, texte/instructions
  envoyés au fournisseur distant sélectionné, téléchargements et mises à jour.
  Les défauts dans `settings.rs` désactivent post-traitement et fournisseurs cloud.
  Une URL personnalisée est modifiable : son étiquette ne prouve pas qu’elle
  pointe sur l’ordinateur.
- Cette politique n’est **pas un inventaire exhaustif des connexions** :
  [llm.rs](https://github.com/getdictus/dictus-desktop/blob/v0.3.0/src-tauri/src/managers/llm.rs)
  télécharge aussi des modèles facultatifs sur Hugging Face.
- [actions.rs](https://github.com/getdictus/dictus-desktop/blob/v0.3.0/src-tauri/src/actions.rs)
  enregistre l’audio et le texte ;
  [history.rs](https://github.com/getdictus/dictus-desktop/blob/v0.3.0/src-tauri/src/managers/history.rs)
  conserve fichiers audio et base locale et gère leur suppression. « Local » ne
  signifie donc pas « aucune conservation ». Aucun quota universel n’est promis.
- iPhone : moteur audio/transcription local dans le tag v1.8.2 ; téléchargement
  de modèles sur Hugging Face. L’amélioration Apple facultative utilise le modèle
  local du système lorsqu’il est disponible ; elle n’est pas confondue avec les
  fournisseurs distants Desktop. Ne pas présenter toutes les fonctions comme
  disponibles sur tous les appareils.
- `PolishEventStore.swift` peut conserver localement texte original et amélioré
  pour diagnostic ; l’export de journaux de `SettingsView.swift` est volontaire.
  L’article n’affirme ni absence de texte enregistré, ni effacement garanti, ni
  absence de tout accès réseau. L’historique Pro n’est pas annoncé comme disponible.
- Une application recevant le texte peut le synchroniser indépendamment. Il
  s’agit de la frontière de la promesse de transcription, pas d’une accusation
  envers un service particulier. Aucun audit externe ou capture réseau effectué.
