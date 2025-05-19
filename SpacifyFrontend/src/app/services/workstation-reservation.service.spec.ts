import { TestBed } from '@angular/core/testing';

import { WorkstationReservationService } from './workstation-reservation.service';

describe('WorkstationReservationService', () => {
  let service: WorkstationReservationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkstationReservationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
