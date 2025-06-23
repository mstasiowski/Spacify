import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';
import { UserRole } from '../enums/user-role.enum';
import { filter, map, take } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return toObservable(authService.userSignal).pipe(
    filter((user) => user !== undefined),
    take(1),
    map((user) => {
      if (!user) {
        router.navigateByUrl('/login');
        return false;
      }

      if (user.role !== UserRole.Administrator) {
        router.navigateByUrl('/forbidden');
        return false;
      }

      return true;
    })
  );
};
