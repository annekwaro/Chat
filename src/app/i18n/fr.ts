// All the app's text in French. en.ts has the same keys in English.
// French typography: a non-breaking space ( ) goes before ? ! : and inside « ».
// Keys ending in .one / .other are counts, picked by the `plural` pipe.
export const fr = {
  common: {
    back: 'Retour',
    cancel: 'Annuler',
    close: 'Fermer',
    save: 'Enregistrer',
    retry: 'Réessayer',
    seeAll: 'Tout voir',
    someone: 'Quelqu’un',
    ok: 'OK',
    notNow: 'Pas maintenant',
    hide: 'Masquer',
    talkToSomeone: 'En parler avec quelqu’un',
    needToTalk: 'Besoin de parler à quelqu’un maintenant ?',
    needHelpNow: 'Besoin d’aide maintenant ?',
    seeHelplines: 'Voir les lignes d’écoute',
  },

  language: {
    // The button shows the other language
    other: 'EN',
    switch: 'English (passer en anglais)',
  },

  tabs: {
    home: 'Accueil',
    explore: 'Explorer',
    discover: 'Découvrir',
    messages: 'Messages',
    checkIn: 'Humeur du jour',
  },

  // Labels for the mood keys saved in Firestore
  moods: {
    Great: { label: 'Super', message: 'Génial ! Gardez cet élan.' },
    Good: { label: 'Bien', message: 'Très bien. Une courte méditation peut vous aider à garder ce cap.' },
    Okay: { label: 'Moyen', message: 'C’est normal aussi. Essayez la roue des émotions dans Explorer.' },
    Low: { label: 'Pas top', message: 'Prenez soin de vous aujourd’hui. En parler peut aider.' },
    Awful: { label: 'Très mal', message: 'Vous n’avez pas à vivre ça sans aide. Parler à quelqu’un peut aider.' },
    none: 'Pas encore d’humeur',
  },

  // "Who were you with?" keys saved in Firestore
  company: {
    Alone: 'Seul·e',
    Partner: 'Partenaire',
    Family: 'Famille',
    Friends: 'Amis',
    Coworkers: 'Collègues',
    Classmates: 'Camarades',
  },

  home: {
    greeting: {
      morning: 'Bonjour',
      afternoon: 'Bon après-midi',
      evening: 'Bonsoir',
    },
    welcome: 'bienvenue',
    profilePhoto: 'Photo de profil',
    notifications: 'Notifications',
    notificationsCheckIn: 'Notifications : humeur du jour à saisir',
    hero: {
      space: {
        tag: 'Votre espace',
        title: 'Esprit apaisé,',
        highlight: 'vie éclairée',
        text: 'Notez votre humeur, informez-vous et parlez-en. Votre santé mentale compte.',
        cta: 'Discuter',
      },
      mood: {
        tag: 'Humeur du jour',
        title: 'Comment allez-vous,',
        highlight: 'vraiment ?',
        text: 'Notez votre humeur en quelques secondes et repérez les tendances au fil du temps.',
        cta: 'Noter mon humeur',
      },
      learn: {
        tag: 'Comprendre',
        title: 'Avancer',
        highlight: 'pas à pas',
        text: 'Comprendre l’anxiété, la déprime et plus encore, et ce qui peut aider.',
        cta: 'En savoir plus',
      },
      calm: {
        tag: 'Calme',
        title: 'Faire de la place',
        highlight: 'au calme',
        text: 'Quelques respirations lentes et de petites habitudes peuvent changer votre journée.',
        cta: 'Respirer',
      },
    },
    shortcutsLabel: 'Raccourcis',
    shortcuts: {
      chat: 'Messages',
      breathe: 'Respirer',
      diary: 'Journal',
      help: 'Aide',
    },
    moodTitle: 'Humeur du jour',
    moodToday: 'Aujourd’hui : {{mood}}',
    moodQuestion: 'Comment vous sentez-vous aujourd’hui ?',
    addDetails: 'Ajouter avec qui vous étiez ou une note',
    search: 'Rechercher…',
    explore: 'Explorer',
    forYou: 'Pour vous',
    featured: {
      talk: { title: 'Parler à quelqu’un', cta: 'Discuter' },
      lighten: { title: 'Alléger son esprit', cta: 'Découvrir' },
      care: { title: 'Prendre soin de soi', cta: 'Explorer' },
      meditate: { title: 'Conseils pour méditer', cta: 'Explorer' },
      emotions: { title: 'Gérer ses émotions', cta: 'Explorer' },
    },
    noResults: 'Aucun résultat pour cette recherche.',
    helpSub: 'Lignes d’écoute et numéros d’urgence',
    guestTitle: 'Vous utilisez Soul en invité',
    guestText: 'Créez un compte gratuit pour discuter avec la communauté et retrouver votre journal sur tous vos appareils.',
    guestCta: 'Créer un compte gratuit',
    signUpToSave: 'Créez un compte gratuit pour enregistrer votre humeur.',
    saveFailed: 'Impossible d’enregistrer votre humeur. Réessayez.',
    checkInReminder: 'Vous n’avez pas encore noté votre humeur aujourd’hui. Comment allez-vous ?',
    nothingNew: 'Rien de nouveau pour le moment.',
  },

  // Format chips (plural) and a single item's format
  formats: {
    all: 'Tout',
    video: 'Vidéos',
    podcast: 'Podcasts',
    audio: 'Audio',
  },
  format: {
    video: 'Vidéo',
    podcast: 'Podcast',
    audio: 'Audio',
  },

  topics: {
    'self-love': 'Amour de soi',
    meditation: 'Méditation',
    meaning: 'Donner du sens',
    sleep: 'Sommeil',
    anxiety: 'Anxiété',
    relationships: 'Relations',
  },

  // The built-in session library (content.service.ts), by id
  library: {
    '1': {
      title: 'Vivre avec un but',
      description: 'Une vie qui a du sens, c’est accorder ses actions à ses valeurs et à ses passions, et y trouver de la joie en chemin.',
    },
    '2': {
      title: 'Respirer partout',
      description: 'Un exercice de respiration simple et efficace, à faire n’importe où et à tout moment pour apaiser le corps et l’esprit.',
    },
    '3': {
      title: 'Mieux se connaître',
      description: 'Avec une méditation régulière, on apprend à mieux se connaître et à observer ses pensées sans les juger.',
    },
    '4': {
      title: 'Être bienveillant envers soi',
      description: 'S’accepter avec ses forces et ses faiblesses, et cultiver une relation positive avec soi-même.',
    },
    '5': {
      title: 'La roue des émotions',
      description: 'Apprenez à nommer ce que vous ressentez. Mettre des mots sur ses émotions aide à les comprendre et à les gérer.',
    },
    '6': {
      title: 'Se détendre avant de dormir',
      description: 'Une séance guidée tout en douceur pour ralentir vos pensées et trouver un sommeil plus profond et réparateur.',
    },
    '7': {
      title: 'Quand l’inquiétude prend le dessus',
      description: 'Des pistes concrètes pour repérer les pensées anxieuses, revenir au moment présent et répondre plutôt que réagir.',
    },
    '8': {
      title: 'Traverser un jour de pluie',
      description: 'Certains jours sont lourds. De petits pas réalisables pour prendre soin de vous quand le moral est bas.',
    },
    '9': {
      title: 'Mieux communiquer',
      description: 'Écouter, exprimer ce que vous ressentez et poser des limites saines avec les personnes qui comptent pour vous.',
    },
    '10': {
      title: 'Petits pas, grands changements',
      description: 'Le sens se construit pas à pas. Fixez-vous des objectifs adaptés à votre vie et célébrez vos progrès.',
    },
  },

  explore: {
    title: 'Explorer',
    subtitle: 'Trouvez ce qui peut vous aider aujourd’hui',
    search: 'Thèmes, vidéos, podcasts…',
    tools: 'Outils populaires',
    tool: {
      breathing: { name: 'Respiration', sub: 'Respiration carrée' },
      mood: { name: 'Suivi d’humeur', sub: 'Humeur du jour' },
      routine: { name: 'Routine', sub: 'Petits pas' },
      learn: { name: 'Comprendre', sub: 'Mieux comprendre son esprit' },
    },
    featured: 'À la une',
    topics: 'Thèmes',
    sessions: {
      one: '{{count}} séance',
      other: '{{count}} séances',
    },
    allSessions: 'Toutes les séances',
    clear: 'Effacer',
    recommended: 'Recommandé',
    noResults: 'Aucun résultat. Essayez un autre thème ou une autre recherche.',
  },

  discover: {
    title: 'Découvrir',
    subtitle: 'Comprendre et prendre soin de votre esprit',
    segment: {
      learn: 'Comprendre',
      diary: 'Journal',
      calm: 'Calme',
    },
  },

  diary: {
    signUpLink: 'Créez un compte gratuit',
    signUpText: 'pour tenir un journal d’humeur privé. Vos humeurs sont enregistrées sur votre compte.',
    today: 'Aujourd’hui',
    moodIs: 'Humeur : {{mood}}',
    question: 'Comment vous sentez-vous ?',
    streak: {
      one: '🔥 {{count}} jour d’affilée',
      other: '🔥 {{count}} jours d’affilée',
    },
    thisMonth: '{{count}} ce mois-ci',
    with: 'Avec : {{names}}',
    edit: 'Modifier',
    logMood: 'Noter mon humeur',
    thisWeek: 'Cette semaine',
    chartLabel: 'Vos humeurs des 7 derniers jours',
    history: 'Historique',
    list: 'Liste',
    calendar: 'Calendrier',
    prevMonth: 'Mois précédent',
    nextMonth: 'Mois suivant',
    tapToAddNote: 'Touchez pour ajouter une note',
    empty: 'Aucune entrée pour l’instant. Notez votre humeur ci-dessus pour commencer votre journal.',
    notePlaceholder: 'Que s’est-il passé ? Qu’avez-vous ressenti ?',
    noteFailed: 'Impossible d’enregistrer votre note. Réessayez.',
  },

  learn: {
    intro: 'Comprendre ce que vous traversez est un premier pas. Touchez un thème pour découvrir les signes fréquents et ce qui peut aider.',
    learnMore: 'En savoir plus',
    disclaimer: 'Ces informations sont générales et ne remplacent pas un diagnostic. Si c’est difficile, parlez-en à un professionnel. Si vous ou quelqu’un d’autre êtes en danger, appelez le 112 ou le 15.',
    signs: 'Signes fréquents',
    helps: 'Ce qui peut aider',
    finePrint: 'Informations générales, pas un diagnostic. En cas d’urgence, appelez le 112 ou le 15.',
  },

  conditions: {
    anxiety: {
      name: 'Anxiété',
      summary: 'Se sentir inquiet ou avoir peur de temps en temps fait partie de la vie. L’anxiété devient un problème quand l’inquiétude est fréquente, difficile à contrôler et gêne la vie de tous les jours.',
      signs: [
        'Se sentir agité, tendu ou à cran',
        'Des pensées qui s’emballent et qu’on n’arrive pas à arrêter',
        'Des difficultés à dormir ou à se concentrer',
        'Le cœur qui bat vite, la transpiration ou une respiration courte',
        'Éviter les lieux ou les situations qui semblent stressants',
      ],
      helps: [
        'Des exercices de respiration lente (essayez l’onglet Calme)',
        'Bouger régulièrement et dormir suffisamment',
        'Réduire la caféine et l’alcool',
        'Une psychothérapie, par exemple une TCC',
      ],
    },
    depression: {
      name: 'Dépression',
      summary: 'La dépression, ce n’est pas seulement être triste un jour ou deux. C’est une humeur basse ou une perte d’intérêt qui dure au moins deux semaines et qui change la façon de penser, de ressentir et de gérer le quotidien.',
      signs: [
        'Se sentir triste, vide ou sans espoir la plupart du temps',
        'Perdre l’intérêt pour ce qu’on aimait faire',
        'Des changements de sommeil ou d’appétit',
        'De la fatigue et un manque d’énergie',
        'Se sentir inutile ou coupable',
      ],
      helps: [
        'De petites routines quotidiennes et des objectifs atteignables',
        'Garder le lien avec des personnes de confiance',
        'Une activité physique douce et du temps dehors',
        'Une psychothérapie, et un traitement si un médecin le recommande',
      ],
    },
    'low-mood': {
      name: 'Coup de blues',
      summary: 'Tout le monde a des jours sans. Un coup de blues a souvent une cause, comme le stress ou un événement difficile, et passe en général en quelques jours ou quelques semaines.',
      signs: [
        'De la tristesse ou des larmes',
        'Se sentir fatigué ou démotivé',
        'Se sentir irritable ou frustré',
        'Moins de confiance en soi que d’habitude',
      ],
      helps: [
        'Des horaires de sommeil réguliers',
        'Sortir et bouger',
        'Faire quelque chose qu’on aime, même brièvement',
        'En parler à quelqu’un. Si cela dure plus de deux semaines, consultez un professionnel',
      ],
    },
    'self-esteem': {
      name: 'Estime de soi',
      summary: 'L’estime de soi, c’est la valeur qu’on s’accorde et le regard qu’on porte sur soi. Une faible estime de soi peut rendre plus difficile d’essayer de nouvelles choses, de poser des limites et de rebondir après un échec.',
      signs: [
        'Être très dur avec soi-même',
        'Se comparer sans cesse aux autres',
        'Avoir du mal à accepter les compliments',
        'Éviter les défis par peur d’échouer',
      ],
      helps: [
        'Noter ses qualités et ses petites réussites',
        'Repérer et remettre en question ses pensées négatives',
        'Se fixer de petits objectifs atteignables',
        'Se traiter comme on traiterait un bon ami',
      ],
    },
    ocd: {
      name: 'TOC',
      summary: 'Le trouble obsessionnel compulsif (TOC) se traduit par des pensées intrusives et indésirables (obsessions) et des gestes ou rituels répétitifs (compulsions) que la personne se sent obligée de faire pour calmer son angoisse.',
      signs: [
        'Des pensées répétées et pénibles, difficiles à chasser',
        'Vérifier, nettoyer, compter ou ranger de façon excessive',
        'Rester anxieux tant qu’un rituel n’est pas fait « comme il faut »',
        'Des rituels qui prennent beaucoup de temps chaque jour',
      ],
      helps: [
        'Une TCC avec exposition et prévention de la réponse (EPR)',
        'Un traitement prescrit par un médecin',
        'Des groupes de soutien et la compréhension des proches',
      ],
    },
    schizophrenia: {
      name: 'Schizophrénie',
      summary: 'La schizophrénie est un trouble sérieux et durable qui modifie la façon de penser, de ressentir et de percevoir la réalité. Avec un traitement précoce et du soutien, beaucoup de personnes gèrent leurs symptômes et vivent pleinement.',
      signs: [
        'Entendre ou voir des choses que les autres ne perçoivent pas (hallucinations)',
        'Des convictions fortes qui ne reposent pas sur la réalité (idées délirantes)',
        'Une pensée et un discours confus ou désorganisés',
        'Se replier sur soi et perdre sa motivation',
      ],
      helps: [
        'Une évaluation et un traitement précoces par des professionnels de santé mentale',
        'Un traitement médicamenteux et une psychothérapie',
        'Le soutien de la famille, des amis et des services de proximité',
      ],
    },
  },

  calm: {
    boxTitle: 'Respiration carrée',
    boxSub: 'Inspirez, retenez, expirez, retenez. 4 secondes à chaque étape.',
    ready: 'On y va ?',
    phase: {
      in: 'Inspirez',
      hold: 'Retenez',
      out: 'Expirez',
    },
    cycles: {
      one: '{{count}} cycle terminé',
      other: '{{count}} cycles terminés',
    },
    start: 'Commencer',
    stop: 'Arrêter',
  },

  routine: {
    title: 'Routine du jour',
    count: '{{done}} sur {{total}}',
    hint: 'Cochez, glissez ☰ pour réordonner, balayez vers la gauche pour supprimer.',
    empty: 'Ajoutez quelques petites choses à faire aujourd’hui, comme une marche, un verre d’eau ou appeler un ami.',
    addPlaceholder: 'Ajouter une activité…',
    newItem: 'Nouvelle activité',
    add: 'Ajouter l’activité',
    markDone: 'Marquer « {{name}} » comme fait',
    guest: 'Créez un compte gratuit pour garder votre routine d’une visite à l’autre.',
    saveFailed: 'Impossible d’enregistrer votre routine. Réessayez.',
    // The suggested activities, saved by key
    items: {
      meditation: 'Méditation',
      breathing: 'Respiration',
      cycling: 'Vélo',
      reading: 'Lecture',
      music: 'Écouter de la musique',
    },
  },

  chats: {
    subtitle: 'Entre personnes de confiance',
    unread: {
      one: '{{count}} conversation non lue',
      other: '{{count}} conversations non lues',
    },
    newChat: 'Nouvelle conversation',
    moreOptions: 'Plus d’options',
    getHelp: 'Obtenir de l’aide',
    logout: 'Se déconnecter',
    search: 'Rechercher une conversation',
    loadFailed: 'Impossible de charger vos conversations. Vérifiez votre connexion et réessayez.',
    people: 'Personnes',
    conversations: 'Conversations',
    noMatch: 'Aucune conversation ne correspond à « {{query}} ».',
    emptyTitle: 'Pas encore de conversation',
    emptyText: 'Tendre la main est déjà un grand pas. Commencez une conversation avec un membre de la communauté.',
    start: 'Commencer une conversation',
    searchPeople: 'Rechercher une personne',
    noPersonMatch: 'Personne ne correspond à « {{query}} ».',
    nobodyYet: 'Personne d’autre n’a encore rejoint l’app. Invitez un ami sur Soul App pour discuter.',
    blocked: 'Bloqué',
    you: 'Vous : {{text}}',
    sayHello: 'Dites bonjour 👋',
    unreadDot: 'Non lu',
    yesterday: 'Hier',
    startFailed: 'Impossible de démarrer la conversation. Réessayez.',
  },

  chat: {
    blocked: 'Bloqué',
    member: 'Membre de la communauté',
    options: 'Options de la discussion',
    missing: 'Cette conversation n’est pas disponible.',
    error: 'Impossible de charger cette conversation. Vérifiez votre connexion et réessayez.',
    backToMessages: 'Retour aux messages',
    hello: 'Dites bonjour à {{name}} 👋',
    helloText: 'Soyez bienveillant et prenez votre temps. Seuls vous deux voyez ces messages.',
    peerNote: 'Les messages sont un soutien entre membres, pas un service de crise.',
    today: 'Aujourd’hui',
    yesterday: 'Hier',
    seen: 'Vu',
    sent: 'Envoyé',
    youBlocked: 'Vous avez bloqué {{name}}.',
    unblock: 'Débloquer',
    cantReply: 'Vous ne pouvez pas répondre à cette conversation.',
    message: 'Message',
    send: 'Envoyer le message',
    sendFailed: 'Message non envoyé. Vérifiez votre connexion et réessayez.',
    menu: {
      getHelp: 'Obtenir de l’aide',
      report: 'Signaler {{name}}',
      block: 'Bloquer {{name}}',
      unblock: 'Débloquer {{name}}',
    },
    block: {
      confirm: 'Bloquer {{name}} ?',
      message: 'Aucun de vous deux ne pourra envoyer de messages dans cette conversation. Vous pouvez débloquer à tout moment.',
      button: 'Bloquer',
      done: '{{name}} est bloqué.',
      undone: '{{name}} est débloqué.',
      failed: 'Impossible de bloquer pour le moment. Réessayez.',
      unblockFailed: 'Impossible de débloquer pour le moment. Réessayez.',
    },
    report: {
      why: 'Pourquoi signalez-vous {{name}} ?',
      confidential: 'Votre signalement est confidentiel. La personne ne saura pas qui l’a envoyé.',
      failed: 'Impossible d’envoyer le signalement. Réessayez.',
      thanks: 'Merci de nous avoir prévenus',
      reviewRisk: 'Nous allons examiner la situation. Si quelqu’un est en danger maintenant, appelez le 112 ou une ligne d’écoute.',
      review: 'Nous allons examiner cette conversation.',
      reviewBlock: 'Nous allons examiner cette conversation. Voulez-vous aussi bloquer {{name}} ?',
    },
    reasons: {
      harassment: 'Harcèlement ou intimidation',
      hate: 'Haine ou discrimination',
      spam: 'Spam ou arnaque',
      risk: 'Je m’inquiète pour sa sécurité',
      other: 'Autre chose',
    },
  },

  auth: {
    email: 'E-mail',
    password: 'Mot de passe',
    firstName: 'Prénom',
    showPassword: 'Afficher le mot de passe',
    hidePassword: 'Masquer le mot de passe',
    emailInvalid: 'Saisissez une adresse e-mail valide',
    errors: {
      invalidEmail: 'Saisissez une adresse e-mail valide.',
      wrongCredentials: 'Cet e-mail et ce mot de passe ne correspondent à aucun compte.',
      tooManyRequests: 'Trop de tentatives. Patientez un instant puis réessayez.',
      network: 'Impossible de joindre le serveur. Vérifiez votre connexion et réessayez.',
      loginFailed: 'Connexion impossible. Réessayez.',
      emailInUse: 'Un compte existe déjà avec cet e-mail. Essayez plutôt de vous connecter.',
      weakPassword: 'Choisissez un mot de passe plus sûr (au moins 8 caractères).',
      signupFailed: 'Impossible de créer votre compte. Réessayez.',
    },
  },

  login: {
    title: 'Bon retour',
    subtitle: 'Connectez-vous pour discuter et retrouver votre journal sur tous vos appareils.',
    passwordTooShort: 'Le mot de passe doit contenir au moins 6 caractères',
    forgot: 'Mot de passe oublié ?',
    submitting: 'Connexion…',
    submit: 'Se connecter',
    newHere: 'Nouveau sur Soul ?',
    createAccount: 'Créer un compte',
    skip: 'Continuer sans compte',
    resetTitle: 'Réinitialiser le mot de passe',
    resetMessage: 'Nous vous enverrons par e-mail un lien pour choisir un nouveau mot de passe.',
    sendLink: 'Envoyer le lien',
    resetSent: 'Si {{email}} correspond à un compte, un lien de réinitialisation arrive. Vérifiez votre boîte de réception.',
  },

  signup: {
    titleChat: 'Inscrivez-vous pour discuter',
    title: 'Créer votre compte',
    chatReason: 'Les messages sont réservés aux membres, pour que vos interlocuteurs sachent qui vous êtes.',
    guestKeeps: 'Votre journal d’humeur et votre routine vous suivent.',
    oneMinute: 'Cela ne prend qu’une minute.',
    passwordTooShort: 'Au moins 8 caractères',
    submitting: 'Création du compte…',
    submit: 'Créer mon compte',
    haveAccount: 'Déjà un compte ?',
    login: 'Se connecter',
    later: 'Plus tard',
  },

  landing: {
    slides: {
      checkIn: {
        title: 'Prenez de vos nouvelles',
        text: 'Notez ce que vous ressentez en quelques gestes et suivez votre humeur au fil du temps.',
      },
      talk: {
        title: 'Parlez-en',
        text: 'Discutez en tête-à-tête avec des membres de la communauté, quand vous en avez besoin.',
      },
      calm: {
        title: 'Retrouvez votre calme',
        text: 'Respiration, routine quotidienne et guides pour mieux comprendre votre esprit.',
      },
    },
    start: 'Commencer',
    haveAccount: 'J’ai déjà un compte',
  },

  checkIn: {
    title: 'Mon humeur du jour',
    question: 'Comment vous sentez-vous aujourd’hui ?',
    moodGroup: 'Humeur',
    withWhom: 'Avec qui étiez-vous ?',
    optional: '(facultatif)',
    onYourMind: 'Quelque chose en tête ?',
    note: 'Note',
    notePlaceholder: 'Que s’est-il passé aujourd’hui ? Qu’avez-vous ressenti ?',
    saving: 'Enregistrement…',
    update: 'Mettre à jour',
    save: 'Enregistrer',
    saveFailed: 'Impossible d’enregistrer votre humeur. Vérifiez votre connexion et réessayez.',
    saved: 'Humeur enregistrée 💙',
  },

  help: {
    title: 'Obtenir de l’aide',
    intro: 'Vous n’avez pas à traverser ça seul. Parler à quelqu’un peut aider, quoi que vous ressentiez.',
    dangerTitle: 'En danger maintenant ?',
    dangerText: 'Si vous ou quelqu’un d’autre risquez d’être blessé, appelez les secours.',
    call: 'Appeler le {{number}}',
    emergency: '112 ou le 15',
    talk: 'Parler à quelqu’un',
    outside: 'Hors de France ? Trouver de l’aide',
    meanwhile: 'En attendant',
    steps: [
      'Inspirez sur 4 temps, retenez 4, expirez 4, retenez 4. Recommencez quelques fois.',
      'Nommez 5 choses que vous voyez, 4 que vous pouvez toucher et 3 que vous entendez.',
      'Allez dans un endroit où vous vous sentez en sécurité et contactez une personne de confiance.',
    ],
    breathing: 'Exercice de respiration',
    note: 'Dans Soul App, vous discutez avec d’autres membres. C’est un soutien entre pairs, pas un service d’urgence ni de crise.',
  },

  // Helpline names and descriptions, by id (numbers are in helplines.ts)
  helplines: {
    suicide: {
      name: '3114 : prévention du suicide',
      description: 'Numéro national gratuit pour toute personne qui pense au suicide ou s’inquiète pour un proche. 24 h/24, 7 j/7.',
    },
    sosAmitie: {
      name: 'SOS Amitié',
      description: 'Une écoute si vous vous sentez seul, déprimé ou en détresse. 24 h/24, 7 j/7.',
    },
    filSante: {
      name: 'Fil Santé Jeunes',
      description: 'Écoute gratuite et anonyme pour les 12–25 ans.',
    },
  },
};

export type Translation = typeof fr;
