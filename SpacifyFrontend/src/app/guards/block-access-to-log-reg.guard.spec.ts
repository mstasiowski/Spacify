import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { blockAccessToLogRegGuard } from './block-access-to-log-reg.guard';

describe('blockAccessToLogRegGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => blockAccessToLogRegGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
