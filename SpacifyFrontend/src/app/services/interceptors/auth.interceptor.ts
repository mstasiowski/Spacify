//TODO

// import {
//   HttpHandlerFn,
//   HttpInterceptorFn,
//   HttpRequest,
//   HttpErrorResponse,
// } from '@angular/common/http';
// import { inject } from '@angular/core';
// import { AuthService } from '../auth.service';
// import { Router } from '@angular/router';
// import { catchError, switchMap, throwError } from 'rxjs';

// export const authInterceptor: HttpInterceptorFn = (req, next) => {
//   const authService = inject(AuthService);
//   const router = inject(Router);

//   const accessToken = authService.getAccessToken();

//   // Nie dodawaj nagłówka do tych endpointów
//   if (
//     req.url.includes('/login') ||
//     req.url.includes('/register') ||
//     req.url.includes('/Auth/refresh-token')
//   ) {
//     return next(req);
//   }

//   const requestWithToken = accessToken ? addToken(req, accessToken) : req;

//   return next(requestWithToken).pipe(
//     catchError((error: HttpErrorResponse) => {
//       if (error.status === 401) {
//         return handle401Error(req, next, authService, router);
//       }

//       console.log(error.status, 'Pierwszy wyłapany error poza ifem');
//       return throwError(() => error);
//     })
//   );
// };

// function addToken(req: HttpRequest<unknown>, token: string) {
//   return req.clone({
//     setHeaders: {
//       Authorization: `Bearer ${token}`,
//     },
//   });
// }

// function handle401Error(
//   req: HttpRequest<unknown>,
//   next: HttpHandlerFn,
//   authService: AuthService,
//   router: Router
// ) {
//   return authService.refreshToken().pipe(
//     switchMap(() => {
//       const newToken = authService.getAccessToken();
//       const newReq = newToken ? addToken(req, newToken) : req;
//       return next(newReq);
//     }),
//     catchError((refreshError) => {
//       // Jeśli refreshToken również zwraca 401/403

//       if (req.url.includes('/Auth/refresh-token')) {
//         console.log('error dziala');
//         authService.clearAccessToken();
//         authService.userSignal.set(null);
//         router.navigateByUrl('/login');
//       } else {
//         console.log('inny error przy handle401Error()');
//       }

//       return throwError(() => refreshError);
//     })
//   );
// }
// todo

//fixit new interceptor

import {
  HttpErrorResponse,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { AuthService } from '../auth.service';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const accessToken = authService.getAccessToken();

  if (
    req.url.includes('/login') ||
    req.url.includes('/register') ||
    req.url.includes('/Auth/refresh-token')
  ) {
    return next(req);
  }

  const requestWithToken = accessToken ? addToken(req, accessToken) : req;

  return next(requestWithToken).pipe(
    catchError((error: HttpErrorResponse) => {
      //403 - jeśli użytkownik jest zablokowany
      if (error.status === 403 && isBlockedUserError(error)) {
        authService.clearAccessToken();
        authService.userSignal.set(null);
        router.navigateByUrl('/login');
        return throwError(() => error);
      }

      //  Reagujemy zarówno na 401, jak i 403
      if (error.status === 401 || error.status === 403) {
        return handleAuthError(req, next, authService, router);
      }

      return throwError(() => error);
    })
  );
};

function addToken(req: HttpRequest<unknown>, token: string) {
  return req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
}

function handleAuthError(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService,
  router: Router
) {
  return authService.refreshToken().pipe(
    switchMap(() => {
      const newToken = authService.getAccessToken();
      const newReq = newToken ? addToken(req, newToken) : req;
      return next(newReq);
    }),
    catchError((refreshError: HttpErrorResponse) => {
      // 🔹 Refresh token też wygasł → wyloguj
      authService.clearAccessToken();
      authService.userSignal.set(null);
      router.navigateByUrl('/login');
      return throwError(() => refreshError);
    })
  );
}

// Sprawdzamy, czy 403 przyszło z komunikatem blokady
function isBlockedUserError(error: HttpErrorResponse): boolean {
  if (!error.error) return false;

  const message =
    typeof error.error === 'string' ? error.error : error.error?.message || '';

  return message.toLowerCase().includes('account is blocked');
}
