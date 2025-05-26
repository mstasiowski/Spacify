import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkspaceReservationsComponent } from './workspace-reservations.component';

describe('WorkspaceReservationsComponent', () => {
  let component: WorkspaceReservationsComponent;
  let fixture: ComponentFixture<WorkspaceReservationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkspaceReservationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkspaceReservationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
