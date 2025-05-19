export interface WorkstationReservationResponse {
  id: number;
  userId: string;
  workstationId: number;
  reservationStart: string;
  reservationEnd: string;
  createdAt: string;
  updatedAt?: string | null;
  isConfirmed: boolean;
}
