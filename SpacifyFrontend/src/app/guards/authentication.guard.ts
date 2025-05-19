import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs/operators';

export const authenticationGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return toObservable(authService.userSignal).pipe(
    filter((user) => user !== undefined),
    take(1),
    map((user) => {
      if (user === null) {
        router.navigate(['/login']);
        return false;
      }
      return true;
    })
  );
};
