import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/user';
import { CommonModule } from '@angular/common';
import { UserRole } from '../../../enums/user-role.enum';

@Component({
  selector: 'app-sidebar',
  imports: [RouterModule, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent implements OnInit, OnDestroy {
  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const user = this.authService.userSignal();
    if (user && user.role) {
      this.currentUser = user;
    } else {
      this.currentUser = null;
    }

    this.checkScreenSize();
    window.addEventListener('resize', this.checkScreenSize);
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.checkScreenSize);
  }

  currentUser: User | null = null;
  roles = UserRole;
  @Input() isOpen = false;
  @Output() sidebarClosed = new EventEmitter<void>();
  isMobileView: boolean = false;

  closeSidebar() {
    this.sidebarClosed.emit();
  }

  checkScreenSize = () => {
    this.isMobileView = window.innerWidth < 1024;
  };
}
