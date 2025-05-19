import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConferenceRoomReservationComponent } from './conference-room-reservation.component';

describe('ConferenceRoomReservationComponent', () => {
  let component: ConferenceRoomReservationComponent;
  let fixture: ComponentFixture<ConferenceRoomReservationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConferenceRoomReservationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConferenceRoomReservationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
