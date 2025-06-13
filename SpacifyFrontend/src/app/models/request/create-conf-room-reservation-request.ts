export interface CreateConferenceRoomReservationRequest {
  userId: String;
  conferenceRoomId: number;
  reservationStart: string;
  reservationEnd: string;
}
