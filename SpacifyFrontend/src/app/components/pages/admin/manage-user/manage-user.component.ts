import { Component, OnInit } from '@angular/core';
import { Unsubscribe } from '../../../../helpers/unsubscribe.class';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { UserService } from '../../../../services/user.service';
import { NotificationService } from '../../../../services/notification.service';
import { takeUntil } from 'rxjs';
import { UserResponse } from '../../../../models/response/user-response';
import { UserResponseForAdmin } from '../../../../models/response/user-response-for-admin';
import { DurationType } from '../../../../enums/durationType.enum';
import { BlockUserRequest } from '../../../../models/request/block-user-request';
import { ModifyUserRequest } from '../../../../models/request/modify-user-request';
import { UserRole } from '../../../../enums/user-role.enum';

@Component({
  selector: 'app-manage-user',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './manage-user.component.html',
  styleUrl: './manage-user.component.scss',
})
export class ManageUserComponent extends Unsubscribe implements OnInit {
  getUserInformationForm: FormGroup;
  blockUserForm: FormGroup;
  deleteUserForm: FormGroup;
  changeUserInformationForm: FormGroup;

  users: UserResponseForAdmin[] = [];
  user: UserResponseForAdmin | null | undefined = null;
  durationType = DurationType;
  durationTypeValues = Object.values(DurationType);

  userRoles = UserRole;
  userRolesValues = Object.values(UserRole);

  selectedForm:
    | 'getUserInformation'
    | 'blockUser'
    | 'deleteUser'
    | 'changeUserInformation' = 'getUserInformation';

  ngOnInit(): void {
    this.getAllUsersForAdmin();

    this.blockUserForm
      .get('userId')
      ?.valueChanges.pipe(takeUntil(this.unsubscribe$))
      .subscribe((userId) => {
        this.user = this.users.find((user) => user.id === userId || null);
      });

    this.changeUserInformationForm
      .get('userId')
      ?.valueChanges.pipe(takeUntil(this.unsubscribe$))
      .subscribe((userId) => {
        this.user = this.users.find((user) => user.id === userId || null);
        if (this.user) {
          this.changeUserInformationForm.patchValue({
            name: this.user.name,
            surname: this.user.surname,
            email: this.user.email,
            username: this.user.username,
            role: this.user.role,
          });
        }
      });
  }

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private notificationService: NotificationService
  ) {
    super();

    this.getUserInformationForm = this.fb.group({
      userId: ['', Validators.required],
    });

    this.blockUserForm = this.fb.group({
      userId: ['', Validators.required],
      durationValue: ['', Validators.required],
      durationType: ['', Validators.required],
    });

    this.deleteUserForm = this.fb.group({
      userId: ['', Validators.required],
    });

    this.changeUserInformationForm = this.fb.group({
      userId: ['', Validators.required],
      name: ['', Validators.required],
      surname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      username: ['', Validators.required],
      role: ['', Validators.required],
    });
  }

  changeForm(
    form:
      | 'getUserInformation'
      | 'blockUser'
      | 'deleteUser'
      | 'changeUserInformation'
  ) {
    this.selectedForm = form;
    const formName = form + 'Form';

    if (formName === 'getUserInformationForm') {
      this.getUserInformationForm.reset();
      this.getUserInformationForm.patchValue({ userId: '' });
    } else if (formName === 'blockUserForm') {
      this.blockUserForm.reset();
      this.blockUserForm.patchValue({
        userId: '',
        durationValue: '',
        durationType: '',
      });
    } else if (formName === 'deleteUserForm') {
      this.deleteUserForm.reset();
      this.deleteUserForm.patchValue({ userId: '' });
    } else if (formName === 'changeUserInformationForm') {
      this.changeUserInformationForm.reset();
      this.changeUserInformationForm.patchValue({
        userId: '',
        name: '',
        surname: '',
        email: '',
        username: '',
        role: '',
      });
    }

    this.user = null;
  }

  getAllUsersForAdmin() {
    this.userService
      .getAllUsersForAdmin()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (res: UserResponseForAdmin[]) => {
          this.users = res;
        },
        error: (err) => {
          this.notificationService.showError(
            'Nie udało się pobrać użytkowników'
          );
          console.error('Error fetching users:', err);
        },
      });
  }

  getUserInformationForAdmin(userId: string) {
    this.userService
      .getUserByIdForAdmin(userId)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (res: UserResponseForAdmin) => {
          this.notificationService.showSuccess(
            'Pobrano informacje o użytkowniku'
          );
          this.user = res;
        },
        error: (err) => {
          this.notificationService.showError(
            'Nie udało się pobrać informacji o użytkowniku'
          );
          console.error('Error fetching user information:', err);
        },
      });
  }

  blockUserUntil(userId: string, blockUserReq: BlockUserRequest) {
    this.userService
      .blockUserUntil(userId, blockUserReq)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (res: UserResponseForAdmin) => {
          this.notificationService.showSuccess('Użytkownik został zablokowany');
          this.changeUserInUsersTable(res);
          this.user = res;
        },
        error: (err) => {
          this.notificationService.showError(
            'Nie udało się zablokować użytkownika'
          );
          console.error('Error blocking user:', err);
        },
      });
  }

  deleteUser(userId: string) {
    this.userService
      .deleteUser(userId)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: () => {
          this.notificationService.showSuccess('Użytkownik został usunięty');
          this.users = this.users.filter((user) => user.id !== userId);
        },
        error: (err) => {
          this.notificationService.showError(
            'Nie udało się usunąć użytkownika'
          );
          console.error('Error deleting user:', err);
        },
      });
  }

  editUserInformation(userId: string, modifiedUser: ModifyUserRequest) {
    this.userService
      .modifyUser(userId, modifiedUser)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (res: UserResponseForAdmin) => {
          this.notificationService.showSuccess(
            'Informacje o użytkowniku zostały zaktualizowane'
          );
          this.changeUserInUsersTable(res);
          this.user = res;
        },
        error: (err) => {
          this.notificationService.showError(
            'Nie udało się zaktualizować informacji o użytkowniku'
          );
          console.error('Error updating user information:', err);
        },
      });
  }

  onGetUserInformationSubmit() {
    if (this.getUserInformationForm.invalid) {
      this.notificationService.showError('Proszę wypełnić wszystkie pola');
      return;
    }

    const userId = this.getUserInformationForm.value.userId;
    this.getUserInformationForAdmin(userId);
  }

  onBlockUserSubmit() {
    if (this.blockUserForm.invalid) {
      this.notificationService.showError('Proszę wypełnić wszystkie pola');
      return;
    }

    const form = this.blockUserForm.value;
    const userId = form.userId || '';
    const blockUserRequest: BlockUserRequest = {
      durationValue: form.durationValue,
      durationType: form.durationType,
    };

    this.blockUserUntil(userId, blockUserRequest);
  }

  onUnblockUser() {
    this.userService
      .unblockUser(this.user?.id || '')
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (res) => {
          this.notificationService.showSuccess('Użytkownik został odblokowany');
          this.changeUserInUsersTable(res);
          this.user = res;
        },
        error: (err) => {
          this.notificationService.showError(
            'Nie udało się odblokować użytkownika'
          );
          console.error('Error unblocking user:', err);
        },
      });
  }

  changeUserInUsersTable(user: UserResponseForAdmin): void {
    const id = this.users.findIndex((u) => u.id === user.id);
    if (id !== -1) {
      this.users[id] = user;
    } else {
      this.notificationService.showError(
        'Nie udało się zaktualizować użytkownika w tabeli'
      );
    }
  }

  confirmDeleteUserId: string | null = null;

  onDeleteUser() {
    if (this.deleteUserForm.invalid) {
      this.notificationService.showError('Proszę wypełnić wszystkie pola');
      return;
    }

    const userId = this.deleteUserForm.value.userId;
    this.confirmDeleteUserId = userId;
    this.user = this.users.find((user) => user.id === userId || null);
  }

  confirmDeleteUser(confirmed: boolean) {
    if (confirmed && this.confirmDeleteUserId) {
      this.deleteUser(this.confirmDeleteUserId);
    }
    this.confirmDeleteUserId = null;
    this.user = null;
  }

  onChangeUserInformationSubmit() {
    if (this.changeUserInformationForm.invalid) {
      this.notificationService.showError('Proszę wypełnić wszystkie pola');
      return;
    }

    const form = this.changeUserInformationForm.value;
    const modifiedUser: ModifyUserRequest = {
      name: form.name,
      surname: form.surname,
      email: form.email,
      username: form.username,
      role: form.role,
    };

    this.editUserInformation(form.userId, modifiedUser);
  }
}
