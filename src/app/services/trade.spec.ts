import { TestBed } from '@angular/core/testing';

import { Trade } from './trade';

describe('Trade', () => {
  let service: Trade;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Trade);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
