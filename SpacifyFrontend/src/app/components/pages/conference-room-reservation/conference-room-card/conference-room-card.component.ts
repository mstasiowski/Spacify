import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ConferenceRoomResponse } from '../../../../models/response/conference-room-response';
import { CommonModule } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';
import { ConferenceRoomReservationResponse } from '../../../../models/response/conference-room-reservation-response';

@Component({
  selector: 'app-conference-room-card',
  imports: [CommonModule, MatChipsModule],
  templateUrl: './conference-room-card.component.html',
  styleUrl: './conference-room-card.component.scss',
})
export class ConferenceRoomCardComponent {
  @Input() conferenceRoom!: ConferenceRoomResponse;
  @Input() startTime!: Date;
  @Input() endTime!: Date;
  @Input() reservation!: ConferenceRoomReservationResponse | undefined;
  @Output() reserve = new EventEmitter<void>();

  get confEquipment(): string[] {
    return this.conferenceRoom?.equipmentDetails
      ? this.conferenceRoom.equipmentDetails
          .split(',')
          .map((e: string) => e.trim())
      : [];
  }

  getEquipmentIcon(equipment: string): string {
    const eq = equipment.toLowerCase();
    if (eq.includes('tv') || eq.includes('telewizor')) {
      return 'fa-solid fa-tv';
    }
    if (eq.includes('projektor')) {
      return 'fa-solid fa-video'; // lub fa-tv jeśli nie masz fa-video
    }
    if (eq.includes('wifi')) {
      return 'fa-solid fa-wifi';
    }
    if (eq.includes('tablica') || eq.includes('tablice')) {
      return 'fa-solid fa-chalkboard';
    }
    if (eq.includes('rj-45') || eq.includes('gniazd')) {
      return 'fa-solid fa-network-wired';
    }
    if (eq.includes('automat')) {
      return 'fa-solid fa-coffee';
    }
    return 'fa-solid fa-circle-info';
  }

  getStartTime(): string {
    return this.startTime
      ? this.startTime.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })
      : '';
  }

  getEndTime(): string {
    return this.endTime
      ? this.endTime.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })
      : '';
  }

  onReserveClick() {
    this.reserve.emit();
  }

  get reservationStartLocal(): string {
    return this.reservation
      ? new Date(this.reservation.reservationStart).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })
      : '';
  }

  get reservationEndLocal(): string {
    return this.reservation
      ? new Date(this.reservation.reservationEnd).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })
      : '';
  }
}
