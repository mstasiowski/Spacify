export interface ModifyWorkstationReservationRequest {
  userId?: string;
  workstationId?: number;
  reservationStart: Date;
  reservationEnd: Date;
}
