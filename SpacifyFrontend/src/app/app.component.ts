import { Component, inject, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Unsubscribe } from './helpers/unsubscribe.class';
import { AuthService } from './services/auth.service';
import { EMPTY, filter, switchMap, takeUntil } from 'rxjs';
import { UserService } from './services/user.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent extends Unsubscribe implements OnInit {
  authService = inject(AuthService);
  userService = inject(UserService);

  ngOnInit(): void {
    this.authService
      .refreshAndFetchUser()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (user) => {},
        error: (err) => {
          console.error('Błąd logowania lub pobierania użytkownika:', err);
          this.authService.userSignal.set(null);
        },
      });
  }
}
