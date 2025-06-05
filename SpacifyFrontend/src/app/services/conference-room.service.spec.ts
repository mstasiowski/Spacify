import { TestBed } from '@angular/core/testing';

import { ConferenceRoomService } from './conference-room.service';

describe('ConferenceRoomService', () => {
  let service: ConferenceRoomService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConferenceRoomService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
