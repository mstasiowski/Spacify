import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/user';
import { CommonModule } from '@angular/common';
import { Unsubscribe } from '../../../helpers/unsubscribe.class';
import { takeUntil } from 'rxjs';
import { UserRole } from '../../../enums/user-role.enum';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent extends Unsubscribe implements OnInit {
  constructor(public authService: AuthService) {
    super();
  }

  ngOnInit(): void {
    const user = this.authService.userSignal();
    if (user != undefined) {
      this.currentUser = user ?? null;
    }
  }

  currentUser: User | null = null;
  isDropdownOpen = false;
  userEmail = 'testowyemail@gmail.com';
  @Output() toggleSidebar = new EventEmitter<void>();

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  logout(): void {
    this.authService
      .logoutUser()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: () => {},
        error: (res) => {
          console.log(res);
        },
      });
  }

  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }

  translateRoles(role: UserRole | undefined): string {
    switch (role) {
      case 'Administrator':
        return 'Administrator';
      case 'Employee':
        return 'Pracownik';
      case 'Leader':
        return 'Lider zespołu';
      default:
        return 'Nieznana rola';
    }
  }
}
