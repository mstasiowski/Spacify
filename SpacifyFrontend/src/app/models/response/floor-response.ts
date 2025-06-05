import { ConferenceRoomResponse } from './conference-room-response';
import { WorkstationResponse } from './workstation-response';

export interface FloorResponse {
  id: number;
  name: string;
  imageUrl: string;
  conferenceRooms?: ConferenceRoomResponse[];
  workstation?: WorkstationResponse[];
}
