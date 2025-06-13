import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConferenceRoomCardComponent } from './conference-room-card.component';

describe('ConferenceRoomCardComponent', () => {
  let component: ConferenceRoomCardComponent;
  let fixture: ComponentFixture<ConferenceRoomCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConferenceRoomCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConferenceRoomCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
