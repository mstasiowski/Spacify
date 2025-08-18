import { AvailableConfRoomsReservationResponse } from './Available-conference-rooms-reservation-response';
import { AvailableWorkstationsReservationResponse } from './Available-workstations-reservation-response';
import { FloorResponse } from './floor-response';
import { ReservationTimeRangeResponse } from './reservation-time-range-response';

export interface DashboardDataResponse {
  confRooms: AvailableConfRoomsReservationResponse;
  workstations: AvailableWorkstationsReservationResponse;
  upcomingReservations: FloorResponse[];
  reservationWatch: ReservationTimeRangeResponse;
}
