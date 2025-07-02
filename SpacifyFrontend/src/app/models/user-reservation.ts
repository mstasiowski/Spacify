import { ReservationType } from '../enums/reservationType';

export interface UserReservation {
  reservationId: number;
  type: ReservationType;
  floorName: string;
  locationName: string;
  reservationStart: Date;
  reservationEnd: Date;
  isConfirmed: boolean;
}
