export interface ModifyConfRoomReservationRequest {
  userId: string;
  conferenceRoomId: number;
  reservationStart: string;
  reservationEnd: string;
  isConfirmed: boolean;
}
