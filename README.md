# Soul App

**[Français](#fr) · [English](#en)**

| Accueil · Home | Discussion · Chat | Journal · Mood diary |
| --- | --- | --- |
| ![Accueil](docs/screenshots/home.png) | ![Discussion](docs/screenshots/room.png) | ![Journal d’humeur](docs/screenshots/diary.png) |

| Explorer · Explore | Calme · Calm | Aide · Help |
| --- | --- | --- |
| ![Explorer](docs/screenshots/explore.png) | ![Calme](docs/screenshots/calm.png) | ![Aide](docs/screenshots/help.png) |

Présentation du projet · Project presentation: https://docs.google.com/presentation/d/1eqkLxWmaBLTHLHckOPQ-4BlqrnywFh1fvsMaZ-XiPZU

---

<a id="fr"></a>

## 🇫🇷 Français

Soul App est une application de bien-être mental pensée d’abord pour le mobile (Ionic, Angular et Firebase). On peut y noter son humeur, suivre des séances guidées, s’informer sur les troubles courants et discuter en privé, en temps réel, avec d’autres membres.

L’application est entièrement en français, pour un public en France : textes, dates et heures, lignes d’écoute, et e-mails de réinitialisation du mot de passe envoyés par Firebase.

### Fonctionnalités

- **Pas d’inscription obligatoire.** L’application s’ouvre directement sur l’Accueil en mode invité. Un compte n’est nécessaire que pour la messagerie. Si un invité crée un compte plus tard, il garde son journal d’humeur et sa routine.
- **Accueil**
  - Carrousel de bienvenue (« Esprit apaisé, vie éclairée ») et raccourcis vers Messages, Respirer, Journal et Obtenir de l’aide.
  - Humeur du jour, avec un visage coloré pour chaque humeur, enregistrée dans Firestore.
  - Séances à la une et conseils personnalisés.
- **Bilan du jour (le + de la barre d’onglets)** : humeur, avec qui vous étiez et une note facultative, depuis n’importe quel onglet.
- **Explorer**
  - Outils populaires (respiration, suivi d’humeur, routine, apprendre).
  - Séances par thème et par format (vidéo, podcast ou audio).
  - Fiche détaillée avec lecture du média.
- **Découvrir**
  - Apprendre : guides sur les troubles courants.
  - Journal d’humeur : résumé du jour avec série de jours, graphique de la semaine, et historique en liste ou en calendrier.
  - Calme : respiration carrée et liste de routine quotidienne.
- **Messages**
  - Conversations privées en temps réel, avec indicateurs de messages non lus et recherche.
  - Messages regroupés par jour.
  - Seules les deux personnes d’une conversation peuvent la lire, ce que garantissent les règles Firestore.
  - Bloquer ou signaler quelqu’un depuis le menu ⋮ d’une conversation. Les signalements arrivent dans la collection `reports`, à examiner dans la console Firebase.
- **Obtenir de l’aide** : numéro d’urgence et lignes d’écoute françaises (`/help`), accessibles depuis l’Accueil, Découvrir et Messages. Les numéros se modifient dans `src/app/pages/help/helplines.ts`.
- **Confidentialité** : les autres membres ne voient que votre nom et votre photo. Votre e-mail est rangé dans un document privé que vous seul·e pouvez lire.
- **Mot de passe oublié** : envoie un lien de réinitialisation depuis l’écran de connexion.

### Technologies

- Ionic 7 et Angular 17
- Firebase Authentication (e-mail/mot de passe et sessions invité anonymes)
- Cloud Firestore, via AngularFire 7 (compat)
- TypeScript et SCSS

### Démarrage

```bash
npm install
npm start          # http://localhost:4200, utilise le vrai projet Firebase
```

#### Configuration de Firebase (une seule fois, dans la console Firebase)

1. **Authentication → Sign-in method** : activez **Adresse e-mail/Mot de passe** et **Anonyme** (Anonyme sert aux invités).
2. **Firestore → Règles** : publiez les règles du fichier `firestore.rules`, ou lancez `firebase deploy --only firestore:rules --project chatty`.

#### Tester en local avec les émulateurs Firebase

Pour essayer la messagerie avec plusieurs comptes de test sans toucher aux vraies données :

```bash
npm run emulators        # terminal 1 : Auth et Firestore en local, avec les vraies règles de sécurité
npm run start:emulator   # terminal 2 : l’application, connectée aux émulateurs
```

Créez deux comptes dans deux fenêtres (par exemple une fenêtre normale et une fenêtre privée), puis lancez une conversation. Les données sont effacées à l’arrêt des émulateurs. Il faut Java et la Firebase CLI.

#### Tests

```bash
npx ng test --watch=false --browsers=ChromeHeadless
```

### Architecture

- `src/app/tab1`, `tab2`, `tab4` : les onglets Accueil, Explorer et Découvrir.
- `src/app/pages/home` : la liste des conversations. `pages/home/chat` est une conversation (`/home/chats/:id`).
- `src/app/services` :
  - `auth` : comptes et sessions invité.
  - `chat` : conversations et messages.
  - `mood` : bilans et journal d’humeur.
  - `content` : la bibliothèque de séances.
- `src/app/guards` :
  - `SessionGuard` ouvre une session invité pour les onglets.
  - `AuthGuard` demande aux invités de créer un compte avant d’accéder à la messagerie.
- `src/app/pages/help` : la page Obtenir de l’aide et sa liste de lignes d’écoute.
- `src/app/components` : l’avatar (initiales s’il n’y a pas de photo), la bulle de message, le visage d’humeur et la fiche du bilan du jour.
- `src/app/locale.ts` : la langue utilisée pour les dates et heures (`fr-FR`).
- `firestore.rules` : qui peut lire et écrire quoi.

#### Modèle de données

| Chemin | Contenu |
| --- | --- |
| `users/{uid}` | Profil public : nom et photo uniquement |
| `users/{uid}/private/account` | E-mail (lisible uniquement par son propriétaire) |
| `users/{uid}/moods/{AAAA-MM-JJ}` | Bilan d’humeur et note du journal. `mood` et `with` contiennent des clés en anglais (`Great`, `Family`) ; les libellés français viennent de `MOODS` et `COMPANY` dans `mood.service.ts` |
| `users/{uid}/routine/{AAAA-MM-JJ}` | Liste de routine du jour |
| `chats/{uidA_uidB}` | Les deux participants, aperçu du dernier message, accusés de lecture, qui a bloqué |
| `chats/{id}/messages/{id}` | `text`, `senderId`, `timestamp` |
| `reports/{id}` | Signalements d’une conversation (motif et messages récents) ; en écriture seule depuis l’application |
| `content/{id}` | Bibliothèque de séances facultative ; l’application a sa propre liste si elle est vide |

---

<a id="en"></a>

## 🇬🇧 English

Soul App is a mobile-first mental wellbeing app (Ionic, Angular and Firebase). People can check in on their mood, follow guided sessions, learn about common conditions, and chat one-to-one with other members in real time.

The app's interface is in French, for users in France: all text, dates and times, the helplines, and Firebase's password reset emails.

### Features

- **No sign-up wall.** The app opens straight to Home as a guest. An account is only needed for chat. If a guest signs up later, they keep their mood diary and routine.
- **Home**
  - Welcome carousel ("Esprit apaisé, vie éclairée": calm mind, brighter life) and shortcuts to Chat, Breathe, Diary and Get help.
  - Daily mood with a coloured face for each mood, saved to Firestore.
  - Featured sessions and personalised insights.
- **Daily check-in (the + in the tab bar)**: mood, who you were with and an optional note, from any tab.
- **Explore**
  - Popular tools (breathing, mood tracker, routine, learn).
  - Sessions by topic and by format (video, podcast or audio).
  - A detail sheet with media playback.
- **Discover**
  - Learn: condition guides.
  - Mood diary: today's summary with streak, a weekly mood chart, and history as a list or a calendar.
  - Calm: box breathing and a daily routine checklist.
- **Chat**
  - Real-time one-to-one conversations with unread markers and search.
  - Messages are grouped by day.
  - Only the two people in a conversation can read it, enforced by Firestore rules.
  - Block or report someone from the ⋮ menu in a conversation. Reports go to the `reports` collection for review in the Firebase console.
- **Get help now:** emergency number and French helplines (`/help`), linked from Home, Discover and Chat. Edit the numbers in `src/app/pages/help/helplines.ts`.
- **Privacy:** other members see only your name and photo. Your email is kept in a private document only you can read.
- **Forgot password:** sends a reset link from the login screen.

### Technologies

- Ionic 7 and Angular 17
- Firebase Authentication (email/password and anonymous guest sessions)
- Cloud Firestore, via AngularFire 7 compat
- TypeScript and SCSS

### Getting started

```bash
npm install
npm start          # http://localhost:4200, uses the real Firebase project
```

#### Firebase setup (once, in the Firebase console)

1. Go to **Authentication → Sign-in method** and enable **Email/Password** and **Anonymous** (Anonymous is for guests).
2. Go to **Firestore → Rules** and publish the rules in `firestore.rules`, or run `firebase deploy --only firestore:rules --project chatty`.

#### Testing locally with the Firebase emulators

You can try chat with several test accounts without touching real data:

```bash
npm run emulators        # terminal 1: local Auth + Firestore, using the real security rules
npm run start:emulator   # terminal 2: the app, connected to the emulators
```

Sign up two accounts in two browser windows (or one normal and one private window), then start a chat. Emulator data is wiped when the emulators stop. The emulators need Java and the Firebase CLI installed.

#### Tests

```bash
npx ng test --watch=false --browsers=ChromeHeadless
```

### Architecture

- `src/app/tab1`, `tab2`, `tab4`: the Home, Explore and Discover tabs.
- `src/app/pages/home`: the chat list. `pages/home/chat` is a chat room (`/home/chats/:id`).
- `src/app/services`:
  - `auth`: accounts and guest sessions.
  - `chat`: conversations and messages.
  - `mood`: check-ins and the mood diary.
  - `content`: the session library.
- `src/app/guards`:
  - `SessionGuard` starts a guest session for the tabs.
  - `AuthGuard` asks guests to sign up before they can chat.
- `src/app/pages/help`: the Get help now page and its list of helplines.
- `src/app/components`: the avatar (initials when there's no photo), the chat bubble, the mood face and the daily check-in sheet.
- `src/app/locale.ts`: the locale used for dates and times (`fr-FR`).
- `firestore.rules`: who can read and write what.

#### Data model

| Path | Contents |
| --- | --- |
| `users/{uid}` | Public profile: name and photo only |
| `users/{uid}/private/account` | Email (only the owner can read it) |
| `users/{uid}/moods/{YYYY-MM-DD}` | Mood check-in and diary note. `mood` and `with` hold English keys (`Great`, `Family`); the French labels come from `MOODS` and `COMPANY` in `mood.service.ts` |
| `users/{uid}/routine/{YYYY-MM-DD}` | Daily routine checklist |
| `chats/{uidA_uidB}` | The two participants, last-message preview, read receipts, who has blocked |
| `chats/{id}/messages/{id}` | `text`, `senderId`, `timestamp` |
| `reports/{id}` | Reports about a conversation (reason + recent messages); write-only from the app |
| `content/{id}` | Optional session library; the app has a built-in list if this is empty |
