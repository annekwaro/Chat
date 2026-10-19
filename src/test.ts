// This file is required by karma.conf.js and loads recursively all the .spec and framework files

import 'zone.js/testing';
import { TestBed, getTestBed } from '@angular/core/testing';
import { provideI18n } from './app/i18n/i18n';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(),
);

// Every test can use the app's text (in French)
beforeEach(() => TestBed.configureTestingModule({ providers: provideI18n() }));
