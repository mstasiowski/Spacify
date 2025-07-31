import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ConferenceRoomService } from '../../../../services/conference-room.service';
import { Unsubscribe } from '../../../../helpers/unsubscribe.class';
import { takeUntil } from 'rxjs';
import { ConferenceRoomResponse } from '../../../../models/response/conference-room-response';
import { NotificationService } from '../../../../services/notification.service';
import { FloorService } from '../../../../services/floor.service';
import { FloorResponse } from '../../../../models/response/floor-response';
import { createConferenceRoomRequest } from '../../../../models/request/create-conference-room-request';

@Component({
  selector: 'app-manage-conf-room',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './manage-conf-room.component.html',
  styleUrl: './manage-conf-room.component.scss',
})
export class ManageConfRoomComponent extends Unsubscribe implements OnInit {
  createConferenceRoomForm: FormGroup;
  editConferenceRoomForm: FormGroup;
  deleteConferenceRoomForm: FormGroup;
  conferenceRooms: ConferenceRoomResponse[] = [];
  floors: FloorResponse[] = [];
  selectedForm: 'create' | 'edit' | 'delete' = 'create';

  constructor(
    private fb: FormBuilder,
    private conferenceRoomService: ConferenceRoomService,
    private notificationService: NotificationService,
    private floorService: FloorService
  ) {
    super();
    this.createConferenceRoomForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(5)]],
      equipmentDetails: ['', [Validators.required, Validators.minLength(5)]],
      imageUrl: [
        '',
        [
          Validators.required,
          Validators.minLength(15),
          Validators.pattern('https?://.+'),
        ],
      ],
      capacity: [
        '',
        [Validators.required, Validators.min(1), Validators.max(120)],
      ],
      floorId: [
        '',
        [Validators.required, Validators.min(1), Validators.max(9999)],
      ],
    });

    this.editConferenceRoomForm = this.fb.group({
      chooseConfRoom: [
        '',
        [Validators.required, Validators.min(1), Validators.max(9999)],
      ],

      name: ['', [Validators.required, Validators.minLength(5)]],
      equipmentDetails: ['', [Validators.required, Validators.minLength(5)]],
      imageUrl: [
        '',
        [
          Validators.required,
          Validators.minLength(15),
          Validators.pattern('https?://.+'),
        ],
      ],
      capacity: [
        '',
        [Validators.required, Validators.min(1), Validators.max(120)],
      ],
      floorId: [
        '',
        [Validators.required, Validators.min(1), Validators.max(9999)],
      ],
    });

    this.deleteConferenceRoomForm = this.fb.group({
      chooseConfRoom: [
        '',
        [Validators.required, Validators.min(1), Validators.max(9999)],
      ],
    });
  }
  ngOnInit(): void {
    this.getConferenceRooms();
    this.getFloors();
  }

  getConferenceRooms() {
    this.conferenceRoomService
      .getConferenceRooms()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (response) => {
          console.log('Conference Rooms:', response);
          this.conferenceRooms = response;
          if (this.conferenceRooms.length > 0) {
            this.enteringInitialDataIntoTheEditingForm(this.conferenceRooms[0]);
            this.deleteConferenceRoomForm.patchValue({
              chooseConfRoom: this.conferenceRooms[0].id,
            });
          }
          this.listenAndEnterDataIntoTheEditForm();
        },
        error: (error) => {
          this.notificationService.showError(
            'Błąd podczas pobierania sali konferencyjnej. Proszę spróbować ponownie później.'
          );
        },
      });
  }

  enteringInitialDataIntoTheEditingForm(
    conferenceroom: ConferenceRoomResponse
  ) {
    this.editConferenceRoomForm.patchValue({
      chooseConfRoom: conferenceroom.id,
      name: conferenceroom.name,
      equipmentDetails: conferenceroom.equipmentDetails,
      imageUrl: conferenceroom.imageUrl,
      capacity: conferenceroom.capacity,
      floorId: conferenceroom.floorId,
    });
  }

  createConferenceRoom(newConfRoom: createConferenceRoomRequest) {
    this.conferenceRoomService
      .createConferenceRoom(newConfRoom)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (res) => {
          this.notificationService.showSuccess('Stworzono salę konferencyjną');
        },
        error: (err) => {
          console.log(err);
          console.log('status', err.status);
          this.notificationService.showError(
            'Nie udało się stworzyć sali konferencyjnej.',
            `Status: ${err.status}`
          );
        },
      });
  }

  editConferenceRoom(
    confRoomId: number,
    updatedConfRoom: createConferenceRoomRequest
  ) {
    this.conferenceRoomService
      .updateConferenceRoom(confRoomId, updatedConfRoom)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: () => {
          this.notificationService.showSuccess(
            'Zaktualizowano salę konferencyjną.'
          );
          this.getConferenceRooms();
        },
        error: (err) => {
          this.notificationService.showError(
            'Nie udało się zaktualizować sali konferencyjnej.',
            `Status: ${err.status}`
          );
        },
      });
  }

  deleteConfRoom(confRoomId: number) {
    this.conferenceRoomService
      .deleteConferenceRoom(confRoomId)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: () => {
          this.notificationService.showSuccess('Usunięto salę konferencyjną.');
          this.getConferenceRooms();
        },
        error: (err) => {
          this.notificationService.showError(
            'Nie udało się usunąć sali konferencyjnej.',
            `Status: ${err.status}`
          );
        },
      });
  }

  onCreateConferenceRoom() {
    if (this.createConferenceRoomForm.invalid) {
      this.notificationService.showError(
        'Formularz zawiera błędy. Proszę poprawić dane.'
      );
      return;
    }

    const formData = this.createConferenceRoomForm.value;
    console.log('Form Data:', formData);

    let newConfRoom: createConferenceRoomRequest = {
      name: formData.name,
      equipmentDetails: formData.equipmentDetails,
      imageUrl: formData.imageUrl,
      capacity: formData.capacity,
      floorId: formData.floorId,
    };

    this.createConferenceRoom(newConfRoom);
  }

  onEditConferenceRoom() {
    if (this.editConferenceRoomForm.invalid) {
      this.notificationService.showError(
        'Formularz zawiera błędy. Proszę poprawić dane.'
      );
      return;
    }

    const confRoomId = this.editConferenceRoomForm.get('chooseConfRoom')?.value;

    const formData = this.editConferenceRoomForm.value;

    let updatedConfRoom: createConferenceRoomRequest = {
      name: formData.name,
      equipmentDetails: formData.equipmentDetails,
      imageUrl: formData.imageUrl,
      capacity: formData.capacity,
      floorId: formData.floorId,
    };

    this.editConferenceRoom(confRoomId, updatedConfRoom);
    this.editConferenceRoomForm.reset();
  }

  onDeleteConferenceRoom() {
    if (this.deleteConferenceRoomForm.invalid) {
      this.notificationService.showError(
        'Formularz zawiera błędy. Proszę poprawić dane.'
      );
      return;
    }

    const confRoomId =
      this.deleteConferenceRoomForm.get('chooseConfRoom')?.value;

    this.deleteConfRoom(confRoomId);
    this.deleteConferenceRoomForm.reset();
  }

  getFloors() {
    this.floorService
      .getFloors()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (floors) => {
          console.log('Floors:', floors);
          this.floors = floors;
        },
        error: (error) => {
          this.notificationService.showError(
            'Failed to load floors. Please try again later.'
          );
        },
      });
  }

  listenAndEnterDataIntoTheEditForm() {
    this.editConferenceRoomForm
      .get('chooseConfRoom')
      ?.valueChanges.pipe(takeUntil(this.unsubscribe$))
      .subscribe((selectedConfRoomId: number) => {
        console.log('Selected Conference Room ID:', selectedConfRoomId);

        if (!selectedConfRoomId) {
          return;
        }

        const selectedConfRoom = this.conferenceRooms.find(
          (confRoom) => confRoom.id === +selectedConfRoomId
        );

        if (selectedConfRoom) {
          this.editConferenceRoomForm.patchValue({
            name: selectedConfRoom.name,
            equipmentDetails: selectedConfRoom.equipmentDetails,
            imageUrl: selectedConfRoom.imageUrl,
            capacity: selectedConfRoom.capacity,
            floorId: selectedConfRoom.floorId,
          });
        } else {
          console.warn('Selected conference room not found in the list.');
          this.notificationService.showError(
            'Wybrana sala konferencyjna nie została znaleziona.',
            `ID: ${selectedConfRoomId}`
          );
        }
      });
  }
}
