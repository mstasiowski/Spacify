import { TestBed } from '@angular/core/testing';

import { ConferenceRoomReservationService } from './conference-room-reservation.service';

describe('ConferenceRoomReservationService', () => {
  let service: ConferenceRoomReservationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConferenceRoomReservationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
