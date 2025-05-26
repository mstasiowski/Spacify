import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Unsubscribe } from './helpers/unsubscribe.class';
import { AuthService } from './services/auth.service';
import { EMPTY, switchMap, takeUntil } from 'rxjs';
import { UserService } from './services/user.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent extends Unsubscribe implements OnInit {
  title = 'Spacify';
  authService = inject(AuthService);
  userService = inject(UserService);

  ngOnInit(): void {
    this.authService
      .refreshAndFetchUser()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (user) => {
          console.log('Zalogowano jako:');
          console.log(this.authService.userSignal());
        },
        error: (err) => {
          console.error('Błąd logowania lub pobierania użytkownika:', err);
          this.authService.userSignal.set(null);
        },
      });
  }

  //Info To jest orginał
  // this.authService
  // .refreshToken()
  // .pipe(takeUntil(this.unsubscribe$))
  // .subscribe({
  //   next: (res) => {
  //     let user = this.authService.getUserInfo();
  //     //Todo tu coś chyba trzeba poprawic
  //     if (user?.id)
  //       this.userService
  //         .getUserById(user?.id)
  //         .pipe(takeUntil(this.unsubscribe$))
  //         .subscribe({
  //           next: (res) => {
  //             this.authService.userSignal.set(res);
  //             console.log(this.authService.userSignal());
  //           },
  //           error: (res) => {},
  //         });
  //     //Todo </>
  //   },
  //   error: (err) => {
  //     console.log(err);
  //     this.authService.userSignal.set(null);
  //   },
  // });

  //Info </>
}
