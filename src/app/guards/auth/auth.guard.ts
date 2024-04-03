import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';

import { AuthenticationService } from '../../services/authentication.service'; //

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthenticationService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): Promise<boolean> {
    return new Promise((resolve) => {
      this.authService
        .getCurrentUser()
        .then((user) => {
          const isLoginPage = ['/login', '/login2'].includes(
            route.routeConfig?.path ?? ''
          );
          if (user && isLoginPage) {
            // If user is logged in and trying to access a login page, redirect them to the dashboard/home page
            this.router.navigate(['/tabs', 'tab1']);
            resolve(false);
          } else if (!user && !isLoginPage) {
            // If user is not logged in and trying to access a protected route, redirect them to the login page
            this.router.navigate(['/signup2']);
            resolve(false);
          } else {
            // Allow access to the route if none of the above conditions apply
            resolve(true);
          }
        })
        .catch(() => {
          // In case of an error, redirect to the login page
          this.router.navigate(['/login2']);
          resolve(false);
        });
    });
  }
}
