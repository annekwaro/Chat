// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
//configuration from firebase.configuration
export const environment = {
  production: false,
  // true = talk to the local Firebase emulators instead of the real project (see environment.emulator.ts)
  useEmulators: false,
  firebaseConfig: {
    apiKey: 'AIzaSyDBKdTW5gp5SdpV7HDBSzwvtCcm-VqhmQM',
    authDomain: 'chat-app-376e6.firebaseapp.com',
    projectId: 'chat-app-376e6',
    storageBucket: 'chat-app-376e6.appspot.com',
    messagingSenderId: '381522455924',
    appId: '1:381522455924:web:98098530c1f99f02c25021',
    measurementId: 'G-2EHDQWK574',
  },
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
