import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import Konva from 'konva';
import { Unsubscribe } from '../../../helpers/unsubscribe.class';
import { WorkstationService } from '../../../services/workstation.service';
import { takeUntil } from 'rxjs';
import { WorkstationReservationService } from '../../../services/workstation-reservation.service';

@Component({
  selector: 'app-conference-room-reservation',
  imports: [],
  templateUrl: './conference-room-reservation.component.html',
  styleUrl: './conference-room-reservation.component.scss',
})
export class ConferenceRoomReservationComponent
  extends Unsubscribe
  implements AfterViewInit, OnInit
{
  @ViewChild('container', { static: true }) containerRef!: ElementRef;

  workstations: any[] = [];
  reservations: any[] = [];

  constructor(
    private workstationService: WorkstationService,
    private reservationService: WorkstationReservationService
  ) {
    super();
  }
  ngOnInit(): void {
    this.getWorkstation();
    this.getReservationForDay();
  }

  private stage!: Konva.Stage;
  private scaleBy = 1.05;
  private layer!: Konva.Layer;

  ngAfterViewInit(): void {
    this.stage = new Konva.Stage({
      container: this.containerRef.nativeElement,
      width: 800,
      height: 600,
      draggable: true, // for panning
    });

    this.layer = new Konva.Layer();
    this.stage.add(this.layer);

    const imageObj = new Image();
    imageObj.src = 'floor3_plan.png';

    imageObj.onload = () => {
      const background = new Konva.Image({
        x: 0,
        y: 0,
        image: imageObj,
        width: this.stage.width() * 2,
        height: this.stage.height() * 2,
        listening: false,
      });

      this.layer.add(background); // potem obraz
      background.moveToBottom();
      this.layer.draw();
    };

    // Workstation rectangle
    const rect = new Konva.Circle({
      x: 300,
      y: 220,
      width: 50,
      height: 50,
      radius: 25,
      fill: 'green',
      stroke: 'black',
      strokeWidth: 2,
      draggable: true,
    });

    // Hover effect
    rect.on('mouseenter', () => {
      document.body.style.cursor = 'pointer';
      rect.fill('lightgreen');
      this.layer.draw();
    });

    rect.on('mouseleave', () => {
      document.body.style.cursor = 'default';
      rect.fill('green');
      this.layer.draw();
    });

    // Click interaction
    rect.on('click', () => {
      alert(`Kliknięto biurko o ID: 1`);
    });

    this.layer.add(rect);
    this.layer.draw();

    // Zoom
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
      const newScale =
        direction > 0 ? oldScale / this.scaleBy : oldScale * this.scaleBy;

      this.stage.scale({ x: newScale, y: newScale });

      const newPos = {
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
      };

      this.stage.position(newPos);
      this.stage.batchDraw();
    });
  }

  // Todo

  getWorkstation() {
    this.workstationService
      .getWorkstationsByFloor(7)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (res) => {
          console.log(res);
          this.workstations = res;

          for (let i = 0; i < this.workstations.length; i++) {
            const rect = new Konva.Circle({
              x: this.workstations[i].positionX,
              y: this.workstations[i].positionY,
              width: 50,
              height: 50,
              radius: 25,
              fill: 'orange',
              stroke: 'black',
              strokeWidth: 2,
              draggable: true,
            });
            // === Tooltip setup ===
            const tooltip = new Konva.Label({
              x: rect.x(),
              y: rect.y() - 30, // nad kółkiem
              opacity: 0,
              visible: false,
            });

            tooltip.add(
              new Konva.Tag({
                fill: 'black',
                pointerDirection: 'down',
                pointerWidth: 10,
                pointerHeight: 10,
                lineJoin: 'round',
                shadowColor: 'black',
                shadowBlur: 10,
                shadowOffset: { x: 10, y: 10 },
                shadowOpacity: 0.2,
              })
            );

            tooltip.add(
              new Konva.Text({
                text: `Desk ${this.workstations[i].deskNumber}`,
                fontFamily: 'Calibri',
                fontSize: 16,
                padding: 5,
                fill: 'white',
              })
            );

            // === Events ===
            rect.on('mouseenter', () => {
              document.body.style.cursor = 'pointer';
              tooltip.position({
                x: rect.x(),
                y: rect.y() - 35,
              });
              tooltip.opacity(1);
              tooltip.visible(true);
              this.layer.batchDraw();
            });

            rect.on('mouseleave', () => {
              document.body.style.cursor = 'default';
              tooltip.visible(false);
              tooltip.opacity(0);
              this.layer.batchDraw();
            });

            rect.on('dragmove', () => {
              tooltip.position({
                x: rect.x(),
                y: rect.y() - 35,
              });
            });

            this.layer.add(rect);
            this.layer.draw();
            rect.on('dragend', () => {
              const pos = rect.position();
              console.log(
                `Biurko ID: ${this.workstations[i].id} przeniesiono na X: ${pos.x}, Y: ${pos.y}`
              );
            });

            this.layer.add(tooltip);
          }
        },
      });
  }

  getReservationForDay() {
    this.reservationService
      .GetWorkstationReservationsByFloorAndDate(7, new Date('2025-05-27'))
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (res) => {
          console.log(res);
          this.reservations = res;
        },
      });
  }

  //Info </Test czy dziala rezerwacja>

  // reservations: WorkstationReservationResponse[] = [];
  // reservation: WorkstationReservationResponse | null = null;

  // reservationId!: number;
  // userId: string = '';
  // startDateLocal: string = '';
  // endDateLocal: string = '';
  // date!: string;

  // createRequest: CreateWorkstationReservationRequest = {
  //   userId: '',
  //   workstationId: 0,
  //   reservationStart: new Date(),
  //   reservationEnd: new Date(),
  // };

  // modifyRequest: ModifyWorkstationReservationRequest = {
  //   userId: '',
  //   workstationId: 0,
  //   reservationStart: new Date(),
  //   reservationEnd: new Date(),
  // };

  // // Konwersja daty lokalnej do UTC ISO stringa
  // convertLocalToUtc(localString: string): string {
  //   const localDate = new Date(localString);
  //   return localDate.toISOString(); // ISO 8601 UTC format
  // }

  // getAllReservations() {
  //   this.reservationService
  //     .getWorkstationReservations()
  //     .subscribe((res) => (this.reservations = res));
  // }

  // getReservationById() {
  //   this.reservationService
  //     .getWorkstationReservationById(this.reservationId)
  //     .subscribe((res) => (this.reservation = res));
  // }

  // getReservationsByUserId() {
  //   this.reservationService
  //     .getWorkstationReservationsByUserId(this.userId)
  //     .subscribe((res) => (this.reservations = res));
  // }

  // getReservationsByDate() {
  //   const dateObj = new Date(this.date);
  //   this.reservationService
  //     .getWorkstationReservationsByDate(dateObj)
  //     .subscribe((res) => (this.reservations = res));
  // }

  // getReservationsByDateRange() {
  //   const start = new Date(this.startDateLocal);
  //   const end = new Date(this.endDateLocal);
  //   this.reservationService
  //     .getWorkstationReservationsByDateRange(start, end)
  //     .subscribe((res) => (this.reservations = res));
  // }

  // getTodaysReservations() {
  //   this.reservationService
  //     .getTodaysWorkstationReservations()
  //     .subscribe((res) => (this.reservations = res));

  //   console.log(this.workstations);
  // }

  // createReservation() {
  //   this.createRequest.reservationStart = new Date(
  //     this.convertLocalToUtc(this.startDateLocal)
  //   );
  //   this.createRequest.reservationEnd = new Date(
  //     this.convertLocalToUtc(this.endDateLocal)
  //   );

  //   this.reservationService
  //     .createWorkstationReservation(this.createRequest)
  //     .subscribe((res) => {
  //       this.reservation = res;
  //       this.getAllReservations();
  //     });
  // }

  // modifyReservation() {
  //   this.modifyRequest.reservationStart = new Date(
  //     this.convertLocalToUtc(this.startDateLocal)
  //   );
  //   this.modifyRequest.reservationEnd = new Date(
  //     this.convertLocalToUtc(this.endDateLocal)
  //   );

  //   this.reservationService
  //     .modifyWorkstationReservation(this.reservationId, this.modifyRequest)
  //     .subscribe((res) => {
  //       this.reservation = res;
  //       this.getAllReservations();
  //     });
  // }

  // confirmReservation() {
  //   this.reservationService
  //     .confirmWorkstationReservation(this.reservationId)
  //     .subscribe((res) => {
  //       this.reservation = res;
  //       this.getAllReservations();
  //     });
  // }

  // deleteReservation() {
  //   this.reservationService
  //     .deleteWorkstationReservation(this.reservationId)
  //     .subscribe(() => {
  //       this.reservation = null;
  //       this.getAllReservations();
  //     });
  // }

  // // 🛠️ (opcjonalnie) Do formularzy, jeśli chcesz wyświetlać datę UTC jako lokalną:
  // formatUtcForInput(datetime: string | Date): string {
  //   const date = new Date(datetime);
  //   return date.toISOString().slice(0, 16); // yyyy-MM-ddTHH:mm
  // }

  // //Info </Test czy dziala rezerwacja>
}
