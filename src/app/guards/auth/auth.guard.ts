import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

// For features that need a real account (chat). Guests are asked to sign up,
// and come back to where they were afterwards.
@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  async canActivate(_route?: ActivatedRouteSnapshot, state?: RouterStateSnapshot): Promise<boolean | UrlTree> {
    if (await this.authService.hasAccount()) return true;
    return this.router.createUrlTree(['/signup2'], {
      queryParams: { reason: 'chat', returnUrl: state?.url || '/tabs/home' },
    });
  }
}
