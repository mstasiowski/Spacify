import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../enums/user-role.enum';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';

export function roleGuard(allowedRoles: UserRole[]): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    return toObservable(authService.userSignal).pipe(
      filter((user) => user !== undefined),
      map((user) => {
        if (!user) {
          router.navigateByUrl('/login');
          return false;
        }
        if (!allowedRoles.includes(user.role)) {
          router.navigateByUrl('/forbidden');
          return false;
        }
        return true;
      })
    );
  };
}
