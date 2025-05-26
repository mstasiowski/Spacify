// import { inject, Injectable } from '@angular/core';
// import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
// import { AuthService } from '../auth.service';
// import { catchError, switchMap, throwError } from 'rxjs';
// import { Router } from '@angular/router';

// export const authInterceptor: HttpInterceptorFn = (request, next) => {
//   const authService = inject(AuthService);
//   const router = inject(Router);
//   const accessToken = authService.getAccessToken() ?? '';
//   let isTokenRefreshed: boolean = false;
//   const requestWithHeader = request.clone({
//     setHeaders: {
//       Authorization: accessToken ? `Bearer ${accessToken}` : '',
//     },
//   });

//   // return next(requestWithHeader);
//   return next(requestWithHeader).pipe(
//     catchError((error) => {
//       //info Obsługa 401 (accessToken wygasł)
//       if (
//         error instanceof HttpErrorResponse &&
//         error.status === 401 &&
//         !request.url.includes('/refresh-token') &&
//         !isTokenRefreshed
//       ) {
//         isTokenRefreshed = true;

//         return authService.refreshToken().pipe(
//           switchMap(() => {
//             const newToken = authService.getAccessToken();
//             const retryRequest = request.clone({
//               setHeaders: {
//                 Authorization: `Bearer ${newToken}`,
//               },
//             });
//             return next(retryRequest);
//           }),
//           catchError((refreshError) => {
//             //info Obsługa 403 z /refresh-token (refreshToken nieważny)
//             authService.clearAccessToken();
//             router.navigate(['/login']);
//             return throwError(() => refreshError);
//           })
//         );
//       }

//       //info Inne błędy
//       return throwError(() => error);
//     })
//   );
// };

//TODO

import {
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const accessToken = authService.getAccessToken();

  // Nie dodawaj nagłówka do tych endpointów
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
      if (error.status === 401) {
        return handle401Error(req, next, authService, router);
      }

      console.log(error.status, 'Pierwszy wyłapany error poza ifem');
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

function handle401Error(
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
    catchError((refreshError) => {
      // Jeśli refreshToken również zwraca 401/403

      if (req.url.includes('/Auth/refresh-token')) {
        console.log('error dziala');
        authService.clearAccessToken();
        authService.userSignal.set(null);
        router.navigateByUrl('/login');
      } else {
        console.log('inny error przy handle401Error()');
      }

      return throwError(() => refreshError);
    })
  );
}
