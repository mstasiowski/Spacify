import { WorkstationReservationResponse } from './workstation-reservation-response';

export interface WorkstationResponse {
  id: number;
  deskNumber: number;
  positionX: number;
  positionY: number;
  floorId: number;

  workstationReservations?: WorkstationReservationResponse[];
}
