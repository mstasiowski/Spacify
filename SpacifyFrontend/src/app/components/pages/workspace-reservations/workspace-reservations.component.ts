import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { WorkstationReservationService } from '../../../services/workstation-reservation.service';
import { WorkstationReservationResponse } from '../../../models/response/workstation-reservation-response';
import { CreateWorkstationReservationRequest } from '../../../models/request/create-workstation-reservation-request';
import { ModifyWorkstationReservationRequest } from '../../../models/request/modify-workstation-reservation-request';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { User } from '../../../models/user';
import { WorkstationService } from '../../../services/workstation.service';
import { min, takeUntil } from 'rxjs';
import { Unsubscribe } from '../../../helpers/unsubscribe.class';
import { WorkstationResponse } from '../../../models/response/workstation-response';
import Konva from 'konva';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { FloorService } from '../../../services/floor.service';
import { FloorResponse } from '../../../models/response/floor-response';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { MatButtonModule } from '@angular/material/button';
import { UserService } from '../../../services/user.service';
import { NotificationService } from '../../../services/notification.service';
import {
  endAfterStartTimeValidator,
  fullOrHalfHourValidator,
  startNotEqualEndTimeValidator,
} from '../../../helpers/validators';
import { getDefaultReservationTimes } from '../../../helpers/default-reservation-time';
import { excludeWeekendsFilter } from '../../../helpers/date-filters';

@Component({
  selector: 'app-workspace-reservations',
  imports: [
    CommonModule,
    FormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonToggleModule,
    MatTimepickerModule,
    MatButtonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './workspace-reservations.component.html',
  styleUrl: './workspace-reservations.component.scss',
})
export class WorkspaceReservationsComponent
  extends Unsubscribe
  implements OnInit, AfterViewInit
{
  constructor(
    private authService: AuthService,
    private workstationService: WorkstationService,
    private floorService: FloorService,
    private reservationService: WorkstationReservationService,
    private userService: UserService,
    private fb: FormBuilder,
    private notificationService: NotificationService
  ) {
    super();
  }

  ngOnInit(): void {
    const user = this.authService.userSignal();
    if (user != undefined) {
      this.currentUser = user ?? null;
    }

    this.originalImageSize = { width: 1, height: 1 };
    this.getFloors();
    this.getUsers();

    //TODO formularz rezerwacji
    this.formInit();
    //TODO
  }

  ngAfterViewInit(): void {
    // Initialize stage and layer ONCE
    const containerWidth = this.floorContainerRef.nativeElement.offsetWidth;
    const containerHeight = this.floorContainerRef.nativeElement.offsetHeight;

    this.stage = new Konva.Stage({
      container: this.floorContainerRef.nativeElement,
      width: containerWidth,
      height: containerHeight,
      draggable: true,
    });

    this.layer = new Konva.Layer();
    this.stage.add(this.layer);

    // Wheel zoom
    this.stage.on('wheel', (e) => {
      e.evt.preventDefault();
      const oldScale = this.stage.scaleX();
      const pointer = this.stage.getPointerPosition();
      if (!pointer) return;
      const mousePointTo = {
        x: (pointer.x - this.stage.x()) / oldScale,
        y: (pointer.y - this.stage.y()) / oldScale,
      };
      const direction = e.evt.deltaY > 0 ? 1 : -1;
      const scaleBy = 1.05;
      const newScale = direction > 0 ? oldScale / scaleBy : oldScale * scaleBy;
      this.stage.scale({ x: newScale, y: newScale });
      const newPos = {
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
      };
      this.stage.position(newPos);
      this.stage.batchDraw();
    });

    // Responsive resize
    const resizeStage = () => {
      const container = this.floorContainerRef.nativeElement;
      const width = container.offsetWidth;
      const height = container.offsetHeight;
      this.stage.width(width);
      this.stage.height(height);
      this.updateOfficeMap();
    };
    const resizeObserver = new ResizeObserver(resizeStage);
    resizeObserver.observe(this.floorContainerRef.nativeElement);

    // Draw initial map if data is ready
    if (this.imageUrl) {
      this.updateOfficeMap();
    }

    //Todo temp info
    this.stage.on('click', (e) => {
      if (e.target === this.stage) {
        const pointer = this.stage.getPointerPosition();
        if (pointer) {
          const pos = this.stage.position();
          const scaleX = this.stage.width() / this.originalImageSize.width;
          const scaleY = this.stage.height() / this.originalImageSize.height;
          const originalX = (pointer.x - pos.x) / scaleX;
          const originalY = (pointer.y - pos.y) / scaleY;
          alert(`X: ${originalX.toFixed(2)}, Y: ${originalY.toFixed(2)}`);
        }
      }
    });

    //Todo temp info

    //Todo tooltip
    this.tooltipLayer = new Konva.Layer();
    this.stage.add(this.tooltipLayer);

    this.tooltip = new Konva.Label({
      opacity: 0.9,
      visible: false,
    });

    this.tooltip.add(
      new Konva.Tag({
        fill: '#333',
        pointerDirection: 'down',
        pointerWidth: 10,
        pointerHeight: 10,
        lineJoin: 'round',
        shadowColor: 'black',
        shadowBlur: 10,
        shadowOffset: { x: 2, y: 2 },
        shadowOpacity: 0.2,
      })
    );

    this.tooltip.add(
      new Konva.Text({
        text: '',
        fontFamily: 'Arial',
        fontSize: 14,
        padding: 5,
        fill: 'white',
        align: 'center',
      })
    );

    this.tooltipLayer.add(this.tooltip);
    //Todo tooltip
  }

  formInit() {
    const {
      date: defaultDate,
      start: defaultStart,
      end: defaultEnd,
    } = getDefaultReservationTimes();

    console.log('Default reservation times:', {
      defaultDate,
      defaultStart,
      defaultEnd,
    });

    this.selectedDate = defaultDate;

    //Info ustawianie domyślnych godzin
    // const now = new Date();
    // const currentHour = now.getHours();

    // // Domyślna godzina rozpoczęcia to najbliższa pełna godzina w przyszłości (ale nie wcześniej niż 8, nie później niż 17)
    // const startHour = Math.min(Math.max(currentHour + 1, 8), 17);

    // // Domyślna godzina zakończenia to godzina później (ale maksymalnie do 18)
    // const endHour = Math.min(startHour + 1, 18);

    // const today = new Date();
    // const defaultStart = new Date(
    //   today.getFullYear(),
    //   today.getMonth(),
    //   today.getDate(),
    //   startHour,
    //   0,
    //   0,
    //   0
    // );
    // const defaultEnd = new Date(
    //   today.getFullYear(),
    //   today.getMonth(),
    //   today.getDate(),
    //   endHour,
    //   0,
    //   0,
    //   0
    // );
    //Info </> ustawianie domyślnych godzin

    this.reservationForm = this.fb.group(
      {
        startTime: [
          defaultStart,
          [Validators.required, fullOrHalfHourValidator()],
        ],
        endTime: [defaultEnd, [Validators.required, fullOrHalfHourValidator()]],
      },
      {
        validators: [
          startNotEqualEndTimeValidator(),
          endAfterStartTimeValidator(),
        ],
      }
    );

    this.reservationForm
      .get('startTime')!
      .valueChanges.pipe(takeUntil(this.unsubscribe$))
      .subscribe((value) => {
        if (this.reservationForm.valid) {
          this.refreshReservationsAndMap();
        }
      });

    this.reservationForm
      .get('endTime')!
      .valueChanges.pipe(takeUntil(this.unsubscribe$))
      .subscribe((value) => {
        if (this.reservationForm.valid) {
          this.refreshReservationsAndMap();
        }
      });
  }

  currentUser: User | null = null;

  workstations: WorkstationResponse[] = [];
  reservedWorkstations: WorkstationReservationResponse[] = [];
  floors: FloorResponse[] = [];
  users: User[] = [];
  selectedFloorId!: number;
  selectedWorkstationId?: number;

  reservationForm!: FormGroup;

  @ViewChild('floorPlan', { static: true }) floorContainerRef!: ElementRef;
  private stage!: Konva.Stage;
  private layer!: Konva.Layer;
  private backgroundImage?: Konva.Image;
  private originalImageSize!: { width: number; height: number };
  private imageUrl!: string;
  tooltipLayer!: Konva.Layer;
  tooltip!: Konva.Label;

  // selectedDate: Date = new Date();
  selectedDate: Date | null = null; // Allow null for better handling in date picker

  freeWorkstationColor: string = '#00FF00';
  reservedWorkstationColor: string = '#F2003C';
  selectedWorkstationColor: string = '#00BFFF';

  minDateForDatePicker: Date = new Date();
  maxDateForDatePicker: Date = new Date(
    new Date().getTime() + 7 * 24 * 60 * 60 * 1000
  ); // 7 dni od dzisiaj
  excludeWeekends = excludeWeekendsFilter;

  // Call this whenever floor or workstations change
  updateOfficeMap() {
    if (!this.layer || !this.stage) return;

    // Remove all children from the layer (background + workstations)
    this.layer.destroyChildren();

    // Draw background image
    if (this.imageUrl) {
      const image = new window.Image();
      image.crossOrigin = 'anonymous';
      image.src = this.imageUrl;
      image.onload = () => {
        this.originalImageSize = {
          width: image.naturalWidth,
          height: image.naturalHeight,
        };

        this.backgroundImage = new Konva.Image({
          x: 0,
          y: 0,
          image: image,
          width: this.stage.width(),
          height: this.stage.height(),
          listening: false,
        });
        this.layer.add(this.backgroundImage!);
        this.backgroundImage!.moveToBottom();
        this.layer.draw();

        // Draw workstations after background is ready
        this.drawWorkstations();

        this.drawFloorNameOnMap();
      };
    } else {
      // If no image, just draw workstations
      this.drawWorkstations();
      this.drawFloorNameOnMap();
    }
  }

  drawFloorNameOnMap() {
    const imageWidth =
      this.backgroundImage?.width() ?? this.stage?.width() ?? 0;
    const imageHeight =
      this.backgroundImage?.height() ?? this.stage?.height() ?? 0;
    const text = new Konva.Text({
      text: this.selectedFloorName,
      fontSize: 32,
      fontFamily: 'Tahoma',
      fontStyle: 'bold',
      fill: '#3b82f6',
      x: 0,
      y: -35,
      width: imageWidth,
      align: 'center',
      listening: false,
    });
    this.layer.add(text);
    this.layer.draw();
  }

  drawWorkstations() {
    if (!this.layer || !this.stage) return;

    //! Testowy warunek
    if (
      !this.originalImageSize ||
      !this.originalImageSize.width ||
      !this.originalImageSize.height
    ) {
      return;
    }
    //! Testowy warunek

    const scaleX = this.stage.width() / this.originalImageSize.width;
    const scaleY = this.stage.height() / this.originalImageSize.height;

    this.workstations.forEach((workstation) => {
      const isReserved = this.reservedWorkstations.some(
        (r) => r.workstationId === workstation.id
      );

      const isSelected = this.selectedWorkstationId === workstation.id;

      let fill = this.freeWorkstationColor;
      if (isReserved) fill = this.reservedWorkstationColor;
      if (isSelected) fill = this.selectedWorkstationColor;

      const hoverFill = this.getHoverColor(fill);

      const xPos = workstation.positionX * scaleX;
      const yPos = workstation.positionY * scaleY;

      const circle = new Konva.Circle({
        x: xPos,
        y: yPos,
        radius: 10,
        fill,
        stroke: 'black',
        strokeWidth: 1,
        name: `workstation-${workstation.id}`,
      });
      circle.on('click', () => {
        if (!isReserved) {
          if (this.selectedWorkstationId === workstation.id) {
            this.selectedWorkstationId = undefined;
            this.tooltip.hide();
            this.notificationService.showInfo(
              `Odznaczono stanowisko: ${workstation.deskNumber}`,
              'Informacja o rezerwacji'
            );
          } else {
            this.selectedWorkstationId = workstation.id;
            this.tooltip.hide();
            this.notificationService.showInfo(
              `Wybrano stanowisko: ${workstation.deskNumber}`,
              'Informacja o rezerwacji'
            );
          }
          this.updateOfficeMap();
        } else {
          this.notificationService.showWarning(
            `Stanowisko ${workstation.deskNumber} jest już zarezerwowane.`,
            'Informacja o rezerwacji'
          );
        }
      });
      this.layer.add(circle);

      const label = new Konva.Text({
        x: xPos - 25,
        y: yPos - 20,
        text: workstation.deskNumber
          ? workstation.deskNumber.toString()
          : 'Brak numeru',
        fontSize: 14,
        fontFamily: 'Arial',
        fontStyle: 'bold',
        fill: isSelected
          ? this.selectedWorkstationColor
          : isReserved
          ? this.reservedWorkstationColor
          : this.freeWorkstationColor,
        stroke: 'black',
        strokeWidth: 0.5,
        listening: false,
      });

      this.layer.add(label);

      // Todo tooltip
      circle.on('mouseenter', () => {
        circle.fill(hoverFill);
        this.layer.batchDraw();

        let tooltipText: string = '';

        if (isSelected) {
          tooltipText = `Wybrane stanowisko: ${
            workstation.deskNumber || 'Brak numeru'
          }\nKliknij, aby odznaczyć`;
        } else if (isReserved) {
          const reservation = this.reservedWorkstations.find(
            (r) => r.workstationId === workstation.id
          );

          let reservationStartTime = '';
          let reservationEndTime = '';
          let reservationDate = '';

          const user = this.users.find((u) => u.id === reservation?.userId);
          // Extract only the time part for start and end, and the date
          if (reservation) {
            // const start = new Date(reservation.reservationStart + 'Z');
            const start = new Date(reservation.reservationStart);
            const end = new Date(reservation.reservationEnd);
            reservationStartTime = start.toLocaleTimeString('pl-PL', {
              hour: '2-digit',
              minute: '2-digit',
            });
            reservationEndTime = end.toLocaleTimeString('pl-PL', {
              hour: '2-digit',
              minute: '2-digit',
            });
            reservationDate = start.toLocaleDateString('pl-PL', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
            });
          }

          tooltipText = `Zarezerwowane przez:\n ${user?.name} ${user?.surname}\n Na dzień: ${reservationDate}\n Od: ${reservationStartTime}\nDo: ${reservationEndTime}`;
        } else {
          tooltipText = `Stanowisko: ${
            workstation.deskNumber || 'Brak numeru'
          }\n Jest dostępne`;
        }

        this.tooltip.position({
          x: circle.x() + 5,
          y: circle.y() - 20,
        });

        (this.tooltip.getChildren()[1] as Konva.Text).text(tooltipText);
        this.tooltip.show();
        this.tooltipLayer.batchDraw();
        this.stage.container().style.cursor = 'pointer';
      });

      circle.on('mouseleave', () => {
        circle.fill(fill);
        this.layer.batchDraw();

        this.tooltip.hide();
        this.tooltipLayer.batchDraw();
        this.stage.container().style.cursor = 'default';
      });

      // Todo tooltip
    });
  }

  private getHoverColor(baseColor: string): string {
    switch (baseColor) {
      case this.freeWorkstationColor:
        return '#7CFC00';
      case this.reservedWorkstationColor:
        return '#DC143C';
      case this.selectedWorkstationColor:
        return '#87CEEB';
      default:
        return '#cccccc';
    }
  }

  refreshReservationsAndMap() {
    const startDate = this.reservationForm.get('startTime')?.value;
    const endDate = this.reservationForm.get('endTime')?.value;
    if (!this.selectedDate || !startDate || !endDate || !this.selectedFloorId)
      return;

    // console.log('==========================');
    // console.log('StartDate', startDate);
    // console.log('endDate', endDate);

    this.reservationService
      .GetReservationsByDateTimeRange(startDate, endDate)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (res) => {
          const floorWorkstationIds = this.workstations.map((w) => w.id);
          this.reservedWorkstations = res.filter((r) =>
            floorWorkstationIds.includes(r.workstationId)
          );
          this.updateOfficeMap();
          // console.log('Wykonano odświeżenie rezerwacji i mapy');
          // console.log(res);
        },
        error(err) {
          console.log(err);
        },
      });
  }

  getWorkstationsByFloor() {
    this.workstationService
      .getWorkstationsByFloor(this.selectedFloorId)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (res) => {
          this.workstations = res;
          this.updateOfficeMap();
          this.refreshReservationsAndMap();
        },
        error(err) {
          console.log(err);
        },
      });
  }

  getFloors() {
    this.floorService
      .getFloors()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (res) => {
          this.floors = res;
          this.imageUrl = res[0].imageUrl;
          if (res.length > 0 && !this.selectedFloorId) {
            this.selectedFloorId = res[0].id;
            this.getWorkstationsByFloor();
          }

          if (this.stage && this.layer) {
            this.updateOfficeMap();
          }
        },
        error(err) {
          console.log(err);
        },
      });
  }

  onFloorChange(floorId: number) {
    this.selectedFloorId = floorId;
    this.imageUrl = this.floors.find((f) => f.id === floorId)?.imageUrl || '';
    this.getWorkstationsByFloor();
    this.refreshReservationsAndMap();
  }

  getUsers() {
    this.userService
      .getAllUsers()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (res) => {
          this.users = res;
          // console.log('Users fetched:', this.users);
        },
        error: (err) => {
          console.error('Error fetching users:', err);
        },
      });
  }

  get formattedDate(): string {
    if (!this.selectedDate) return '';
    return this.selectedDate.toLocaleDateString('pl-PL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  onDateChange(date: Date | null) {
    if (date) {
      this.selectedDate = date;

      const startTime = this.reservationForm.get('startTime')?.value;
      const endTime = this.reservationForm.get('endTime')?.value;

      if (startTime) {
        const newStartTime = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          startTime.getHours(),
          startTime.getMinutes(),
          startTime.getSeconds()
        );

        this.reservationForm
          .get('startTime')
          ?.setValue(newStartTime, { emitEvent: false });
      }

      if (endTime) {
        const newEndTime = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          endTime.getHours(),
          endTime.getMinutes(),
          endTime.getSeconds()
        );

        this.reservationForm
          .get('endTime')
          ?.setValue(newEndTime, { emitEvent: false });
      }

      this.refreshReservationsAndMap();
    }
  }

  get formattedStartTime(): string {
    const date = this.reservationForm.get('startTime')?.value;
    return date
      ? date.toLocaleTimeString('pl-PL', {
          hour: '2-digit',
          minute: '2-digit',
        })
      : '';
  }

  get formattedEndTime(): string {
    const date = this.reservationForm.get('endTime')?.value;
    return date
      ? date.toLocaleTimeString('pl-PL', {
          hour: '2-digit',
          minute: '2-digit',
        })
      : '';
  }

  get isTimeRangeInvalid(): boolean {
    const startRaw = this.reservationForm.get('startTime')?.value;
    const endRaw = this.reservationForm.get('endTime')?.value;

    // If either is missing, don't show "zły zakres"
    if (!startRaw || !endRaw) return false;

    const start = new Date(startRaw);
    const end = new Date(endRaw);

    // If either is not a valid date, treat as invalid
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return true;

    // Invalid if start >= end or if any control has errors
    return (
      start >= end ||
      (this.reservationForm.get('startTime')?.invalid ?? false) ||
      (this.reservationForm.get('endTime')?.invalid ?? false)
    );
  }

  get selectedDeskNumber(): string {
    const ws = this.workstations?.find(
      (w) => w.id === this.selectedWorkstationId
    );
    return ws?.deskNumber.toString() ?? 'Brak numeru';
  }

  get selectedFloorName(): string {
    const floor = this.floors.find((f) => f.id === this.selectedFloorId);
    return floor ? floor.name : 'Brak piętra';
  }

  confirmReservation() {
    const start = this.reservationForm.get('startTime')?.value;
    const end = this.reservationForm.get('endTime')?.value;
    const workstationId = this.selectedWorkstationId;
    if (start && end && workstationId && this.reservationForm.valid) {
      const reservation: CreateWorkstationReservationRequest = {
        workstationId: workstationId,
        userId: this.currentUser?.id ?? '',
        reservationStart: start.toISOString(),
        reservationEnd: end.toISOString(),
      };

      this.reservationService
        .createWorkstationReservation(reservation)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe({
          next: (res) => {
            this.refreshReservationsAndMap();
            this.selectedWorkstationId = undefined; // Deselect workstation after reservation
            this.notificationService.showSuccess(
              'Rezerwacja została pomyślnie utworzona.'
            );
          },
          error: (err) => {
            this.notificationService.showError(
              'Nie udało się utworzyć rezerwacji. Sprawdź poprawność danych.',
              'Błąd rezerwacji'
            );
            console.error('Error creating reservation:', err);
          },
        });
    }
  }
}
