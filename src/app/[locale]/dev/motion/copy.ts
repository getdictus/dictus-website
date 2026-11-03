/**
 * Placeholder copy of the motion demo route. It lives here rather than in
 * `src/messages` so production pages never load it. No product claims.
 */
export const demoCopy = {
  fr: {
    metaTitle: "Démo des primitives de mouvement",
    title: "Primitives de mouvement",
    intro: "Page de test interne, non indexée. Elle sert à vérifier ScenePlayer, PinnedSteps et SeamRibbon avant leur usage dans les sections.",
    skipLink: "Aller aux étapes (lien d’ancre)",
    eyebrow: "Démo",
    heading: "Quatre étapes, une section épinglée.",
    steps: [
      { id: "one", title: "Première étape", body: "Texte de démonstration. Faites défiler pour passer à l’étape suivante." },
      { id: "two", title: "Deuxième étape", body: "Le texte sortant disparaît avant que le suivant apparaisse." },
      { id: "three", title: "Troisième étape", body: "La barre de progression suit le défilement, segment par segment." },
      { id: "four", title: "Quatrième étape", body: "Dernière étape. La section reprend ensuite le défilement normal." },
    ],
    ribbon: ["Démo", "Ruban", "Transform seulement", "Pause hors écran"],
    secondTitle: "Une seule scène à la fois.",
    secondBody: "Cette seconde scène ne joue que lorsqu’elle est la plus visible des deux.",
    end: "Fin de la démo.",
  },
  en: {
    metaTitle: "Motion primitives demo",
    title: "Motion primitives",
    intro: "Internal test page, not indexed. It checks ScenePlayer, PinnedSteps and SeamRibbon before the sections use them.",
    skipLink: "Go to the steps (anchor link)",
    eyebrow: "Demo",
    heading: "Four steps, one pinned section.",
    steps: [
      { id: "one", title: "First step", body: "Placeholder text. Scroll to move to the next step." },
      { id: "two", title: "Second step", body: "The outgoing text leaves before the next one appears." },
      { id: "three", title: "Third step", body: "The progress bar follows the scroll, one segment per step." },
      { id: "four", title: "Fourth step", body: "Last step. The page then scrolls normally again." },
    ],
    ribbon: ["Demo", "Ribbon", "Transform only", "Paused off-screen"],
    secondTitle: "One scene at a time.",
    secondBody: "This second scene plays only while it is the more visible of the two.",
    end: "End of the demo.",
  },
} as const;
