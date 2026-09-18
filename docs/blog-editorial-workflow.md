# Flux éditorial du blog bilingue

Le contenu vit dans `src/content/blog/articles.json`. Ce tableau contient une
entrée par identifiant stable, avec les deux versions de l’article. Les pages,
les liens de langue, le temps de lecture et le futur sitemap se calculent à
partir de ces données. Ajouter une entrée ne demande aucun changement de
composant ni de liste de routes.

Les trois entrées initiales sont désormais **les guides en brouillon de l’issue
#34** : iPhone, dictée gratuite sur ordinateur et confidentialité. Leurs sources
françaises et leurs traductions anglaises complètes remplacent les anciens
exemples de mise en page. Les identifiants restent stables ; leurs premiers slugs
éditoriaux sont choisis avant publication. Aucune relecture humaine n’est
enregistrée. Lire `docs/issue-34-editorial-evidence.md` pour les sources et
`docs/issue-34-verification.md` pour les vérifications et les étapes restantes.

## Préparer l’intention et rédiger la source

Avant de créer une entrée, consigner dans l’issue éditoriale la question du
lecteur, son intention de recherche, le produit concerné, les sources qui
permettent de vérifier chaque promesse et l’action utile en fin de lecture.
Définir un sujet circonscrit ; ne pas inventer de volume de recherche ni promettre
un classement. Les mots recherchés orientent le vocabulaire naturel et ne
produisent pas de balise `meta keywords`.

Créer une entrée française :

```sh
npm run blog:new -- mon-identifiant-stable
```

Compléter l’objet `locales.fr` dans `src/content/blog/articles.json` :

- `slug`, `title`, `summary`, `intro`, `category`, `tags` ;
- `seo` et `social`, chacun avec `title` et `description` ;
- `image` : fichier réel sous `/images/`, largeur, hauteur, `alt`, `caption` ;
- `cta` : `label`, `description`, `href` localisé, par exemple `/fr#desktop` ;
- `sections` : identifiant d’ancre stable, intertitre, paragraphes en texte brut,
  et éventuellement des listes de puces en texte brut ;
- `sources` : libellés descriptifs et liens de provenance ou de vérification.

Il n’y a ni HTML ni Markdown à interpréter dans ces champs. Les liens de sources
et le CTA ont leurs propres champs. Les noms de produit et les affirmations
techniques doivent provenir de sources vérifiées. Pour les captures existantes,
lire `docs/product-assets.md` ; conserver leurs proportions et décrire leur langue
réelle. Une capture française peut illustrer la version anglaise si sa légende
le précise. Les captures natives françaises et anglaises du même écran sont
aussi possibles, avec une provenance contrôlée et des dimensions identiques.

L’auteur est une personne réelle : le modèle utilise Pierre
et son profil public GitHub vérifié. `createdAt` et `updatedAt` sont des dates
réelles au format `YYYY-MM-DD`. Mettre `updatedAt` à la date de la modification
avant génération. `relatedIds` désigne d’autres identifiants existants et reste
indépendant des slugs traduits. Un brouillon incomplet est accepté au build ; une
version locale n’apparaît en preview qu’une fois tous ses champs de lecture
complets. Elle ne devient jamais publique par défaut.

## Générer l’anglais automatiquement

Installer la CLI Codex et s’authentifier sur le poste de l’éditeur :

```sh
codex login
codex login status
npm run blog:translate -- mon-identifiant-stable
```

La commande utilise la session authentifiée locale de `codex exec`. Elle ne
demande aucune clé API au site, n’ajoute aucun secret au dépôt et n’est appelée
ni pendant le build ni par une visite. La traduction se fait en une requête
structurée, avec schéma JSON, dans un répertoire temporaire vide et une sandbox
en lecture seule. La configuration utilisateur de Codex n’est pas chargée ;
l’authentification locale reste disponible. Le texte source est envoyé au
service utilisé par cette session pour cette opération éditoriale explicite.

Le résultat traduit les champs visibles, le slug, les titres et descriptions
SEO/social, les catégories et tags, les légendes et alternatives d’images, les
sources et le CTA, ainsi que la totalité des sections. Les identifiants d’ancre,
les liens externes, les nombres, les noms de produit et l’image sont conservés.
Les liens internes commençant par `/fr` deviennent `/en`. Lors d’une mise à jour,
le slug anglais déjà enregistré est conservé pour éviter de casser une URL
partagée. Les slugs ne changent pas au fil des corrections ; un changement
intentionnel d’URL demande de prévoir sa redirection dans un chantier distinct.

Le schéma et les invariants sont vérifiés avant sauvegarde. Une erreur de CLI,
une sortie invalide ou des données modifiées pendant la génération laissent
l’article existant intact. La commande fusionne son résultat par identifiant
stable et conserve les modifications concurrentes des autres articles. Une
exécution réussie enregistre la provenance et l’empreinte de la source, remet
l’article en `draft` et efface les deux validations de relecture. La génération
n’est jamais considérée comme une approbation éditoriale.

## Vérifier les deux versions et enregistrer la relecture

Comparer FR et EN : informations produit, sources, chiffres, portée des
promesses, naturel du vocabulaire, texte intégral, liens, images et légendes.
La vérification automatique préserve des invariants syntaxiques ; elle ne juge
pas l’équivalence sémantique ou la véracité d’une promesse. Cette étape humaine
reste nécessaire, y compris après une petite correction.

Ouvrir la preview locale déjà gérée par Portly avec `DICTUS_SITE_PREVIEW=1` en
environnement non production. Vérifier les deux URL directes puis le switch
FR → EN → FR, sur mobile et ordinateur. Le brouillon doit rester identifié comme
tel. Relire les titres du navigateur et les textes de partage ; vérifier les
liens des sources et du CTA. Les dates visibles d’un brouillon ne sont pas
présentées comme une publication antérieure.

Après la relecture effective, enregistrer le nom réel de la personne qui l’a
faite :

```sh
npm run blog:review -- mon-identifiant-stable fr --by "Nom du relecteur"
npm run blog:review -- mon-identifiant-stable en --by "Nom du relecteur"
npm run blog:validate
npm run test:blog
```

Les deux validations enregistrent l’empreinte du contenu exact. Une modification
de la source, de l’auteur, des liens liés, des dates de contenu ou de ses visuels
invalide les empreintes pertinentes. Une modification anglaise invalide sa
relecture. La source française modifiée invalide aussi la fraîcheur de la
traduction, même si la modification semble mineure.

## Corriger un article et préparer sa publication

Pour une mise à jour, travailler dans une branche et commencer par :

```sh
npm run blog:draft -- mon-identifiant-stable
```

Modifier la source, corriger `updatedAt`, puis répéter la génération et les deux
relectures. La source initiale d’une nouvelle publication doit porter la date
prévue de publication dans `updatedAt` avant ces étapes. Si la publication est
reportée à un autre jour, actualiser cette date puis régénérer et relire : les
dates de contenu font partie des empreintes contrôlées.

Marquer ensuite la paire prête dans les données :

```sh
npm run blog:publish -- mon-identifiant-stable
npm run blog:validate
DICTUS_SITE_PREVIEW=1 npm run build
```

`blog:publish` enregistre les deux versions ensemble et une date de première
publication ; une mise à jour conserve cette première date. La commande refuse
une paire absente, vide, non relue, altérée ou devenue obsolète. Le même validateur
est exécuté par `prebuild` et lors du chargement du modèle par Next.js : même un
`next build` direct ne contourne pas les contraintes de publication.

**Cette commande modifie uniquement les données du dépôt.** Le gate explicite
`isBlogPublic = false` reste fermé. Les routes, la navigation, le sitemap et les
règles robots conservent les protections de preview. En production, activer
`DICTUS_SITE_PREVIEW` ne constitue pas une autorisation de publication et ne doit
pas ouvrir le blog. La mise en ligne du site nécessite l’instruction distincte
prévue par `CLAUDE.md` et une ouverture coordonnée de tous ces points. Le présent
chantier ne fusionne pas dans `main` et ne déclenche pas cette ouverture.

Le générateur du futur sitemap inclut les deux index et les deux URL de chaque
paire publiée valide, avec `updatedAt` réel ; il exclut les brouillons et les
paires invalides. Une fois l’ouverture autorisée, le suivi Search Console et
l’inspection des URL restent dans le suivi SEO #17.

## Vérifier le flux sans appels de traduction

```sh
npm run test:blog
npm run blog:validate
```

Les tests Node utilisent un transport CLI simulé : schéma et prompt, protection
des liens/produits/nombres, invalidation des relectures, brouillons, quatrième
article ajouté par les données, slugs, sitemap et concurrence. Ils lancent aussi
réellement `npm run prebuild` avec des paires publiées manquantes ou obsolètes et
vérifient le refus. `BLOG_VALIDATION_FILE` permet uniquement au sous-processus de
validation de lire ces fixtures temporaires ; il ne modifie pas le contenu chargé
par les pages et n’est pas une option de déploiement.
