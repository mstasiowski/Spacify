import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';

export const blockAccessToLogRegGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return toObservable(authService.userSignal).pipe(
    filter((user) => user !== undefined),
    map((user) => {
      if (user === null) {
        return true;
      } else {
        router.navigateByUrl('/dashboard');
        return false;
      }
    })
  );
};
