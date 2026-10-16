import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth/auth.guard';
import { SessionGuard } from './guards/session/session.guard';

import { TabsPage } from './tabs/tabs.page';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'landing',
    pathMatch: 'full',
  },

  // The app: open to everyone (guests get a session automatically)
  {
    path: 'tabs',
    component: TabsPage,
    canActivate: [SessionGuard],
    children: [
      {
        path: 'tab1',
        loadChildren: () =>
          import('./tab1/tab1.module').then((m) => m.Tab1PageModule),
      },
      {
        path: 'tab2',
        loadChildren: () =>
          import('./tab2/tab2.module').then((m) => m.Tab2PageModule),
      },
      {
        path: 'tab4',
        loadChildren: () =>
          import('./tab4/tab4.module').then((m) => m.Tab4PageModule),
      },
      // Chat needs an account so people know who they're talking to
      {
        path: 'home',
        canActivate: [AuthGuard],
        loadChildren: () =>
          import('./pages/home/home.module').then((m) => m.HomePageModule),
      },
    ],
  },
  {
    path: 'home/chats/:id',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./pages/home/chat/chat.module').then((m) => m.ChatPageModule),
  },
  // Old links to the chat list
  {
    path: 'home',
    redirectTo: 'tabs/home',
    pathMatch: 'full',
  },

  // Public pages
  {
    path: 'landing',
    loadChildren: () =>
      import('./pages/landing/landing.module').then((m) => m.LandingPageModule),
  },
  {
    path: 'login2',
    loadChildren: () =>
      import('./login2/login2.module').then((m) => m.Login2PageModule),
  },
  {
    path: 'signup2',
    loadChildren: () =>
      import('./signup2/signup2.module').then((m) => m.Signup2PageModule),
  },
  {
    path: 'login',
    loadChildren: () =>
      import('./pages/login/login.module').then((m) => m.LoginPageModule),
  },
  {
    path: 'sign-up',
    loadChildren: () =>
      import('./pages/sign-up/sign-up.module').then((m) => m.SignUpPageModule),
  },
  {
    path: 'reset-password',
    loadChildren: () =>
      import('./pages/reset-password/reset-password.module').then(
        (m) => m.ResetPasswordPageModule
      ),
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
