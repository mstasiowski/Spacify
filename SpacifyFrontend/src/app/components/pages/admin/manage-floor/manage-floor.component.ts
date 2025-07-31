import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Unsubscribe } from '../../../../helpers/unsubscribe.class';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FloorResponse } from '../../../../models/response/floor-response';
import { FloorService } from '../../../../services/floor.service';
import { NotificationService } from '../../../../services/notification.service';
import { takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-manage-floor',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './manage-floor.component.html',
  styleUrl: './manage-floor.component.scss',
})
export class ManageFloorComponent extends Unsubscribe implements OnInit {
  createFloorForm: FormGroup;
  editFloorForm: FormGroup;
  deleteFloorForm: FormGroup;
  floors: FloorResponse[] = [];
  selectedForm: 'create' | 'edit' | 'delete' = 'create';
  @Output() floorEdited: EventEmitter<FloorResponse[]> = new EventEmitter<
    FloorResponse[]
  >();

  constructor(
    private fb: FormBuilder,
    private floorService: FloorService,
    private notificationService: NotificationService
  ) {
    super();

    //create form initialization
    this.createFloorForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      imageUrl: [
        '',
        [
          Validators.required,
          Validators.minLength(15),
          Validators.pattern('https?://.+'),
        ],
      ],
    });

    //edit form initialization
    this.editFloorForm = this.fb.group({
      id: ['', [Validators.required, Validators.min(1), Validators.max(9999)]],
      name: ['', [Validators.required, Validators.minLength(3)]],
      imageUrl: [
        '',
        [
          Validators.required,
          Validators.minLength(15),
          Validators.pattern('https?://.+'),
        ],
      ],
    });

    //delete form initialization
    this.deleteFloorForm = this.fb.group({
      id: ['', [Validators.required, Validators.min(1)]],
    });
  }

  ngOnInit(): void {
    this.getFloors();
  }

  getFloors() {
    this.floorService
      .getFloors()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (floors: FloorResponse[]) => {
          this.floors = floors;
          console.log('Pobrano piętra:', this.floors);
          this.emitEditedFloor(this.floors);

          if (this.floors.length > 0) {
            this.enteringInitialDataIntoEditingForm(this.floors[0]);
            this.deleteFloorForm.patchValue({
              id: this.floors[0].id,
            });
          }
          this.listenAndEnterDataIntoTheEditForm();
        },
        error: (error) => {
          this.notificationService.showError(
            'Błąd podczas pobierania pięter.',
            `status: ${error.status} `
          );
        },
      });
  }

  createFloor(newFloor: FloorResponse) {
    this.floorService
      .createFloor(newFloor)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (floor: FloorResponse) => {
          this.notificationService.showSuccess(
            'Piętro zostało pomyślnie utworzone.'
          );
          this.getFloors();

          this.createFloorForm.reset();
        },
        error: (error) => {
          this.notificationService.showError(
            'Błąd podczas tworzenia piętra.',
            `status: ${error.status} `
          );
        },
      });
  }

  editFloor(floorId: number, updatedFloor: FloorResponse) {
    this.floorService
      .updateFloor(floorId, updatedFloor)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (floor: FloorResponse) => {
          this.notificationService.showSuccess(
            'Piętro zostało zaktualizowane.'
          );
          this.getFloors();
          console.log('Zaktualizowane piętro:', floor);
          this.editFloorForm.reset();
        },
        error: (error) => {
          this.notificationService.showError(
            'Błąd podczas aktualizacji piętra.',
            `status: ${error.status} `
          );
        },
      });
  }

  listenAndEnterDataIntoTheEditForm() {
    this.editFloorForm
      .get('id')
      ?.valueChanges.pipe(takeUntil(this.unsubscribe$))
      .subscribe((selectedFloorId: number) => {
        if (!selectedFloorId) {
          return;
        }

        const selectedFloor = this.floors.find(
          (floor) => floor.id === +selectedFloorId
        );

        if (selectedFloor) {
          this.editFloorForm.patchValue({
            name: selectedFloor.name,
            imageUrl: selectedFloor.imageUrl,
          });
        } else {
          this.notificationService.showError(
            'Wybrane piętro nie zostało znalezione.',
            `ID: ${selectedFloorId}`
          );
        }
      });
  }

  deleteFloor(floorId: number) {
    this.floorService
      .deleteFloor(floorId)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: () => {
          this.notificationService.showSuccess('Piętro zostało usunięte.');
          this.getFloors();
          this.deleteFloorForm.reset();
        },
        error: (error) => {
          this.notificationService.showError(
            'Błąd podczas usuwania piętra.',
            `status: ${error.status} `
          );
        },
      });
  }

  onCreateFloor() {
    if (this.createFloorForm.invalid) {
      this.notificationService.showError(
        'Proszę poprawić błędy w formularzu tworzenia piętra.'
      );
      return;
    }

    this.createFloor(this.createFloorForm.value);
  }

  onEditFloor() {
    if (this.editFloorForm.invalid) {
      this.notificationService.showError(
        'Proszę poprawić błędy w formularzu edycji piętra.'
      );
      return;
    }

    this.editFloor(this.editFloorForm.value.id, this.editFloorForm.value);
  }

  emitEditedFloor(editedFloor: FloorResponse[]) {
    this.floorEdited.emit(editedFloor);
  }

  onDeleteFloor() {
    if (this.deleteFloorForm.invalid) {
      this.notificationService.showError(
        'Proszę poprawić błędy w formularzu usuwania piętra.'
      );
      return;
    }

    this.deleteFloor(this.deleteFloorForm.value.id);
  }

  enteringInitialDataIntoEditingForm(floor: FloorResponse) {
    this.editFloorForm.patchValue({
      id: floor.id,
      name: floor.name,
      imageUrl: floor.imageUrl,
    });
  }
}
