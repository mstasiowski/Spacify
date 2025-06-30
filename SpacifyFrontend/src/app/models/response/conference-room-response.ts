import { ConferenceRoomReservationResponse } from './conference-room-reservation-response';

export interface ConferenceRoomResponse {
  id: number;
  name: string;
  equipmentDetails: string;
  imageUrl: string;
  capacity: number;
  floorId: number;
  conferenceRoomReservations?: ConferenceRoomReservationResponse[];
}
