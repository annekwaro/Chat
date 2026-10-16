// Local testing against the Firebase emulators, so test accounts and messages never reach
// the real project. Start them with `npm run emulators`, then `npm run start:emulator`.
// A "demo-" project id tells Firebase this is emulator-only: nothing can touch production.
export const environment = {
  production: false,
  useEmulators: true,
  firebaseConfig: {
    apiKey: 'demo-key',
    authDomain: 'demo-soul-app.firebaseapp.com',
    projectId: 'demo-soul-app',
    storageBucket: 'demo-soul-app.appspot.com',
    messagingSenderId: '0',
    appId: '1:0:web:0',
  },
};
