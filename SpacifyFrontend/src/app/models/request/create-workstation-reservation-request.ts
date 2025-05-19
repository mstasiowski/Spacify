export interface CreateWorkstationReservationRequest {
  userId: string;
  workstationId: number;
  reservationStart: Date;
  reservationEnd: Date;
}
