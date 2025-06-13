export interface ConferenceRoomReservationResponse {
  id: number;
  userId: string;
  conferenceRoomId: number;
  reservationStart: Date;
  reservationEnd: Date;
  createdAt: Date;
  isConfirmed: boolean;
}
