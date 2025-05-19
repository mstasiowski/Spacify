import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Unsubscribe } from './helpers/unsubscribe.class';
import { AuthService } from './services/auth.service';
import { takeUntil } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent extends Unsubscribe implements OnInit {
  title = 'Spacify';
  authService = inject(AuthService);

  ngOnInit(): void {
    this.authService
      .refreshToken()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (res) => {
          let user = this.authService.getUserInfo();
          this.authService.userSignal.set(user);
          console.log(this.authService.userSignal());
        },
        error: (err) => {
          console.log(err);
          this.authService.userSignal.set(null);
        },
      });
  }
}
