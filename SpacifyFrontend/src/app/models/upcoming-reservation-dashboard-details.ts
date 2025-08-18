import { ReservationType } from '../enums/reservationType';

export interface UpcomingReservationDetails {
  floorName: string;
  objectName: string;
  createdAt: Date;
  reservationStart: Date;
  reservationEnd: Date;
  reservationId: number;
}
