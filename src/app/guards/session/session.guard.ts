import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

// Lets everyone into the app. If there's no session yet, starts a guest one so
// mood check-ins, the diary and routine can still be saved without signing up.
@Injectable({
  providedIn: 'root',
})
export class SessionGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(): Promise<boolean> {
    if (await this.authService.getCurrentUserId()) return true;
    try {
      await this.authService.continueAsGuest();
    } catch (err) {
      // e.g. anonymous sign-in not enabled in Firebase; pages still work, just without saving
      console.warn('Could not start a guest session', err);
    }
    return true;
  }
}
