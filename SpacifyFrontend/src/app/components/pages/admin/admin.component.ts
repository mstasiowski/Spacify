import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import Konva from 'konva';
import { Unsubscribe } from '../../../helpers/unsubscribe.class';
import { WorkstationResponse } from '../../../models/response/workstation-response';
import { FloorResponse } from '../../../models/response/floor-response';
import { User } from '../../../models/user';
import {
  FormGroup,
  FormsModule,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../services/auth.service';
import { WorkstationService } from '../../../services/workstation.service';
import { NotificationService } from '../../../services/notification.service';
import { FloorService } from '../../../services/floor.service';
import { takeUntil } from 'rxjs';
import { CreateWorkstationRequest } from '../../../models/request/create-workstation-request';

@Component({
  selector: 'app-admin',
  imports: [
    CommonModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatDividerModule,
    FormsModule,
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
})
export class AdminComponent
  extends Unsubscribe
  implements OnInit, AfterViewInit
{
  constructor(
    private authService: AuthService,
    private workstationService: WorkstationService,
    private floorService: FloorService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {
    super();
  }

  workstations: WorkstationResponse[] = [];
  floors: FloorResponse[] = [];
  users: User[] = [];
  selectedFloorId!: number;
  selectedWorkstationId?: number;

  @ViewChild('floorPlan', { static: true }) floorContainerRef!: ElementRef;
  private stage!: Konva.Stage;
  private layer!: Konva.Layer;
  private backgroundImage?: Konva.Image;
  private originalImageSize!: { width: number; height: number };
  private imageUrl!: string;
  tooltipLayer!: Konva.Layer;
  tooltip!: Konva.Label;

  workstationColor: string = '#00FF00';
  addWorkstationHoverColor: string = '#27DE1A';
  editWorkstationHoverColor: string = '#FF9C2B';
  deleteWorkstationHoverColor: string = '#F42116';
  currentMode: 'add' | 'edit' | 'delete' | null = 'add';

  // Flaga do sprawdzenia czy stage jest już zainicjalizowany
  private isStageInitialized = false;

  ngOnInit(): void {
    // Najpierw załaduj dane o piętrach
    this.loadFloors();

    // this.enableAddMode();

    // this.cdr.detectChanges();
  }

  ngAfterViewInit(): void {
    //! Poczekaj chwilę, żeby DOM się stabilizował
    setTimeout(() => {
      this.initializeStage();
    }, 100);
  }

  private loadFloors(): void {
    this.floorService
      .getFloors()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (floors) => {
          this.floors = floors;
          // Automatycznie wybierz pierwsze piętro jeśli istnieje
          if (floors.length > 0 && !this.selectedFloorId) {
            this.selectedFloorId = floors[0].id;
            this.imageUrl = floors[0].imageUrl || '';
            // Jeśli stage jest już zainicjalizowany, załaduj dane
            if (this.isStageInitialized) {
              this.loadFloorData();
            }
          }
        },
        error: (err) => {
          console.error('Błąd podczas ładowania pięter:', err);
        },
      });
  }

  private initializeStage(): void {
    if (this.isStageInitialized) return;

    const container = this.floorContainerRef.nativeElement;
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;

    // Sprawdź czy kontener ma prawidłowe wymiary
    if (containerWidth === 0 || containerHeight === 0) {
      console.warn(
        'Kontener nie ma prawidłowych wymiarów, ponawiam próbę inicjalizacji...'
      );
      setTimeout(() => this.initializeStage(), 100);
      return;
    }

    this.stage = new Konva.Stage({
      container: container,
      width: containerWidth,
      height: containerHeight,
      draggable: true,
    });

    this.layer = new Konva.Layer();
    this.stage.add(this.layer);

    console.log('Mapa zainicjalizowana:', this.stage);

    // Dodaj obsługę zoomowania
    this.setupZoomHandling();

    // Dodaj obsługę responsywności
    this.setupResponsiveHandling();

    // Dodaj obsługę kliknięć
    this.setupClickHandling();

    this.isStageInitialized = true;

    // Jeśli mamy już dane o piętrach, załaduj je
    if (this.selectedFloorId && this.floors.length > 0) {
      this.loadFloorData();
    }
  }

  private setupZoomHandling(): void {
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

      // Ograniczenia skalowania
      const minScale = 0.5;
      const maxScale = 3;
      const finalScale = Math.max(minScale, Math.min(maxScale, newScale));

      this.stage.scale({ x: finalScale, y: finalScale });
      const newPos = {
        x: pointer.x - mousePointTo.x * finalScale,
        y: pointer.y - mousePointTo.y * finalScale,
      };
      this.stage.position(newPos);
      this.stage.batchDraw();
    });
  }

  private setupResponsiveHandling(): void {
    const resizeStage = () => {
      const container = this.floorContainerRef.nativeElement;
      const width = container.offsetWidth;
      const height = container.offsetHeight;

      if (width > 0 && height > 0) {
        this.stage.width(width);
        this.stage.height(height);
        this.updateOfficeMap();
      }
    };

    const resizeObserver = new ResizeObserver(resizeStage);
    resizeObserver.observe(this.floorContainerRef.nativeElement);
  }

  private setupClickHandling(): void {
    this.stage.on('click', (e) => {
      if (this.currentMode === 'add' && e.target === this.stage) {
        const pointer = this.stage.getPointerPosition();
        if (pointer && this.originalImageSize) {
          const pos = this.stage.position();
          const scale = this.stage.scaleX();
          const scaleX = this.stage.width() / this.originalImageSize.width;
          const scaleY = this.stage.height() / this.originalImageSize.height;
          const originalX = (pointer.x - pos.x) / scale / scaleX;
          const originalY = (pointer.y - pos.y) / scale / scaleY;

          this.newWorkstationPosition = { x: originalX, y: originalY };

          // Konwersja współrzędnych Konva na współrzędne DOM
          const containerRect = this.stage.container().getBoundingClientRect();
          this.tooltipPosition = {
            x: containerRect.left + 5 + pointer.x,
            y: containerRect.top - 180 + pointer.y,
          };
          this.showTooltip = true;
        }
      } else if (this.currentMode === 'edit' && e.target !== this.stage) {
        const targetName = e.target.name();
        if (targetName && targetName.startsWith('workstation-')) {
          const workstationId = parseInt(targetName.split('-')[1]);
          const workstation = this.workstations.find(
            (w) => w.id === workstationId
          );
          if (workstation) {
            this.selectedWorkstationId = workstationId;
            this.newWorkstationDeskNumber = workstation.deskNumber;

            const pointer = this.stage.getPointerPosition();
            const containerRect = this.stage
              .container()
              .getBoundingClientRect();
            this.tooltipPosition = {
              x: containerRect.left + pointer!.x,
              y: containerRect.top + pointer!.y,
            };
            this.showTooltip = true;
          }
        }
      }
    });

    //? Obsługa kliknięć na stanowiska
    // this.stage.on('click', (e) => {
    //   if (e.target !== this.stage) {
    //     const targetName = e.target.name();
    //     if (targetName && targetName.startsWith('workstation-')) {
    //       const workstationId = parseInt(targetName.split('-')[1]);
    //       this.selectWorkstation(workstationId);
    //     }
    //   }
    // });

    this.stage.on('click', (e) => {
      const targetName = e.target.name();

      // Kliknięcie na stanowisko
      if (targetName && targetName.startsWith('workstation-')) {
        const workstationId = parseInt(targetName.split('-')[1]);
        if (this.selectedWorkstationId === workstationId) {
          // Jeśli kliknięto ponownie, odznacz stanowisko
          this.selectedWorkstationId = undefined;
        } else {
          // Zaznacz stanowisko
          this.selectedWorkstationId = workstationId;
        }
        this.updateOfficeMap();
      } else {
        // Kliknięcie poza stanowiskiem
        this.selectedWorkstationId = undefined;
        this.updateOfficeMap();
      }
    });
  }

  private loadFloorData(): void {
    if (!this.selectedFloorId) return;
    this.getWorkstationsByFloor();
  }

  updateOfficeMap(): void {
    if (!this.layer || !this.stage) return;

    this.layer.destroyChildren();

    if (this.imageUrl) {
      const image = new window.Image();
      image.crossOrigin = 'anonymous';
      image.src = this.imageUrl;

      image.onload = () => {
        this.originalImageSize = {
          width: image.naturalWidth,
          height: image.naturalHeight,
        };

        // Oblicz skalę zachowując proporcje
        const scaleX = this.stage.width() / this.originalImageSize.width;
        const scaleY = this.stage.height() / this.originalImageSize.height;
        const scale = Math.min(scaleX, scaleY);

        const scaledWidth = this.originalImageSize.width * scale;
        const scaledHeight = this.originalImageSize.height * scale;

        this.backgroundImage = new Konva.Image({
          x: (this.stage.width() - scaledWidth) / 2,
          y: (this.stage.height() - scaledHeight) / 2,
          image: image,
          width: scaledWidth,
          height: scaledHeight,
          listening: false,
        });

        this.layer.add(this.backgroundImage);
        this.backgroundImage.moveToBottom();
        this.layer.draw();

        this.drawWorkstations();
        this.drawFloorNameOnMap();
      };

      image.onerror = () => {
        console.error('Nie udało się załadować obrazu:', this.imageUrl);
        this.drawWorkstations();
        this.drawFloorNameOnMap();
      };
    } else {
      console.warn('Brak obrazu dla wybranego piętra.');
      this.drawWorkstations();
      this.drawFloorNameOnMap();
    }
  }

  drawFloorNameOnMap(): void {
    if (!this.layer || !this.stage) return;

    const imageWidth = this.backgroundImage?.width() ?? this.stage.width();
    const imageHeight = this.backgroundImage?.height() ?? this.stage.height();
    const imageX = this.backgroundImage?.x() ?? 0;

    let modeColor: string = '#3b82f6';
    let modeText: string = '';

    if (this.currentMode === 'add') {
      modeColor = this.addWorkstationHoverColor;
      modeText = 'TRYB DODAWANIA';
    } else if (this.currentMode === 'edit') {
      modeColor = this.editWorkstationHoverColor;
      modeText = 'TRYB EDYCJI';
    } else if (this.currentMode === 'delete') {
      modeColor = this.deleteWorkstationHoverColor;
      modeText = 'TRYB USUWANIA';
    }

    const text = new Konva.Text({
      text: `${this.selectedFloorName} - ${modeText}`,
      fontSize: 32,
      fontFamily: 'Tahoma',
      fontStyle: 'bold',
      fill: modeColor,
      x: imageX,
      y: -45,
      width: imageWidth,
      stroke: 'black',
      strokeWidth: 0.5,
      align: 'center',
      listening: false,
    });
    this.layer.add(text);
    this.layer.draw();
  }

  drawWorkstations(): void {
    if (
      !this.layer ||
      !this.stage ||
      !this.originalImageSize ||
      !this.backgroundImage
    ) {
      console.warn('Nie można narysować stanowisk: brak wymaganych danych.');
      return;
    }

    const imageScale =
      this.backgroundImage.width() / this.originalImageSize.width;
    const imageOffsetX = this.backgroundImage.x();
    const imageOffsetY = this.backgroundImage.y();

    let index = 0;

    this.workstations.forEach((workstation) => {
      const xPos = imageOffsetX + workstation.positionX * imageScale;
      const yPos = imageOffsetY + workstation.positionY * imageScale;

      index++;

      const circle = new Konva.Circle({
        x: xPos,
        y: yPos,
        radius: 10,
        fill: this.workstationColor,
        stroke: 'black',
        strokeWidth: 1,
        draggable: this.currentMode === 'edit',
        name: `workstation-${workstation.id}`,
      });

      //TODO EDIT MODE
      // Obsługa przeciągania
      if (this.currentMode === 'edit') {
        circle.on('dragend', () => {
          const newPos = circle.position();
          const originalX = (newPos.x - imageOffsetX) / imageScale;
          const originalY = (newPos.y - imageOffsetY) / imageScale;

          let updatedWorkstation: CreateWorkstationRequest = {
            deskNumber: workstation.deskNumber,
            positionX: originalX,
            positionY: originalY,
            floorId: workstation.floorId,
          };

          this.updateWorkstationPosition(workstation.id!, updatedWorkstation);
        });
      }

      this.layer.add(circle);

      const label = new Konva.Text({
        x: xPos - 20,
        y: yPos - 20,
        text: workstation.deskNumber?.toString() || 'Brak numeru',
        fontSize: 12,
        fontFamily: 'Arial',
        fontStyle: 'bold',
        fill: this.workstationColor,
        stroke: 'black',
        strokeWidth: 0.5,
        listening: false,
      });

      this.layer.add(label);

      //!

      //? Obsługa hovera
      circle.on('mouseover', () => {
        let hoverColor: string = this.workstationColor;

        if (this.currentMode === 'add') {
          hoverColor = this.addWorkstationHoverColor;
        } else if (this.currentMode === 'edit') {
          hoverColor = this.editWorkstationHoverColor;
        } else if (this.currentMode === 'delete') {
          hoverColor = this.deleteWorkstationHoverColor;
        }

        circle.fill(hoverColor);
        label.fill(hoverColor);
        this.stage.container().style.cursor = 'pointer'; // Zmień kursor na pointer
        this.layer.draw();
      });

      circle.on('mouseout', () => {
        circle.fill(this.workstationColor);
        label.fill(this.workstationColor);
        this.stage.container().style.cursor = 'default'; // Przywróć domyślny kursor
        this.layer.draw();
      });

      console.log(index, workstation);

      //!
    });

    this.layer.draw();
  }

  showTooltip: boolean = false;
  tooltipPosition: { x: number; y: number } = { x: 0, y: 0 };
  newWorkstationDeskNumber: number | null = null;
  newWorkstationPosition: { x: number; y: number } | null = null;

  getWorkstationsByFloor(): void {
    if (!this.selectedFloorId) return;

    this.workstationService
      .getWorkstationsByFloor(this.selectedFloorId)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (res) => {
          this.workstations = res;
          this.updateOfficeMap();
        },
        error: (err) => {
          console.error('Błąd podczas ładowania stanowisk:', err);
        },
      });
  }

  selectWorkstation(workstationId: number): void {
    if (this.currentMode === 'delete') {
      this.deleteWorkstation(workstationId);
    } else {
      this.selectedWorkstationId = workstationId;
      this.updateOfficeMap();
    }
  }

  addWorkstation(deskNumber: number, x: number, y: number): void {
    const newWorkstation: CreateWorkstationRequest = {
      deskNumber: deskNumber,
      positionX: x,
      positionY: y,
      floorId: this.selectedFloorId,
    };

    this.workstationService
      .createWorkstation(newWorkstation)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (res) => {
          this.notificationService.showSuccess('Stanowisko zostało dodane.');
          this.getWorkstationsByFloor();
          this.selectedWorkstationId = res.id; // Ustaw nowo dodane stanowisko jako wybrane
        },
        error: (err) => {
          this.notificationService.showError('Nie udało się dodać stanowiska.');
          console.error(err);
        },
      });

    console.log('Dodawanie stanowiska na pozycji:', { x, y });
  }

  updateWorkstationPosition(
    workstationId: number,
    updatedWorkstation: CreateWorkstationRequest
  ): void {
    console.log(
      `Aktualizacja pozycji stanowiska (${workstationId}): X = ${updatedWorkstation.positionX}, Y = ${updatedWorkstation.positionY}`
    );

    if (updatedWorkstation)
      this.workstationService
        .updateWorkstation(workstationId, updatedWorkstation)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe({
          next: () => {
            this.notificationService.showSuccess(
              'Pozycja stanowiska została zaktualizowana.'
            );
            this.getWorkstationsByFloor();
          },
          error: (err) => {
            this.notificationService.showError(
              'Nie udało się zaktualizować pozycji stanowiska.'
            );
            console.error(err);
          },
        });
  }

  deleteWorkstation(workstationId: number): void {
    console.log('Usuwanie stanowiska:', workstationId);

    this.workstationService
      .deleteWorkstation(workstationId)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: () => {
          this.notificationService.showSuccess('Stanowisko zostało usunięte.');
          this.selectedWorkstationId = undefined;
          this.getWorkstationsByFloor();
        },
        error: (err) => {
          this.notificationService.showError(
            'Nie udało się usunąć stanowiska.'
          );
          console.error(err);
        },
      });
  }

  get selectedFloorName(): string {
    const floor = this.floors.find((f) => f.id === this.selectedFloorId);
    return floor ? floor.name : 'Brak piętra';
  }

  onFloorChange(floorId: number): void {
    this.selectedFloorId = floorId;
    this.selectedWorkstationId = undefined;
    const floor = this.floors.find((f) => f.id === floorId);
    this.imageUrl = floor?.imageUrl || '';

    console.log('Zmiana piętra:', { floorId, imageUrl: this.imageUrl });

    this.getWorkstationsByFloor();
  }

  enableAddMode(): void {
    this.currentMode = 'add';
    this.selectedWorkstationId = undefined;
    this.notificationService.showInfo('Aktywny', 'TRYB DODAWANIA');
    this.updateOfficeMap();
  }

  enableEditMode(): void {
    this.currentMode = 'edit';
    this.selectedWorkstationId = undefined;
    this.notificationService.showInfo('Aktywny', 'TRYB EDYCJI');
    this.updateOfficeMap();
  }

  enableDeleteMode(): void {
    this.currentMode = 'delete';
    this.selectedWorkstationId = undefined;
    this.notificationService.showInfo('Aktywny', 'TRYB USUWANIA');
    this.updateOfficeMap();
  }

  confirmAddWorkstation(): void {
    if (
      this.newWorkstationDeskNumber !== null &&
      this.newWorkstationDeskNumber > 0 &&
      this.newWorkstationPosition
    ) {
      this.addWorkstation(
        this.newWorkstationDeskNumber,
        this.newWorkstationPosition.x,
        this.newWorkstationPosition.y
      );
      this.resetTooltip();
    } else {
      this.notificationService.showError('Wprowadź poprawny numer stanowiska.');
    }
  }

  confirmEditWorkstation(): void {
    if (
      this.newWorkstationDeskNumber !== null &&
      this.newWorkstationDeskNumber > 0 &&
      this.selectedWorkstationId !== undefined
    ) {
      const workstation = this.workstations.find(
        (w) => w.id === this.selectedWorkstationId
      );
      if (workstation) {
        const updatedWorkstation: CreateWorkstationRequest = {
          deskNumber: this.newWorkstationDeskNumber,
          positionX: workstation.positionX,
          positionY: workstation.positionY,
          floorId: workstation.floorId,
        };

        this.updateWorkstationPosition(
          this.selectedWorkstationId,
          updatedWorkstation
        );
        this.resetTooltip();
      }
    } else {
      this.notificationService.showError('Wprowadź poprawny numer stanowiska.');
    }
  }

  cancelTooltip(): void {
    this.resetTooltip();
  }

  private resetTooltip(): void {
    this.showTooltip = false;
    this.newWorkstationDeskNumber = null;
    this.newWorkstationPosition = null;
    this.selectedWorkstationId = undefined;
  }
}
