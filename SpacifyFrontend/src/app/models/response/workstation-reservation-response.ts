export interface WorkstationReservationResponse {
  id: number;
  userId: string;
  workstationId: number;
  reservationStart: Date;
  reservationEnd: Date;
  createdAt: string;
  updatedAt?: string | null;
  isConfirmed: boolean;
}
