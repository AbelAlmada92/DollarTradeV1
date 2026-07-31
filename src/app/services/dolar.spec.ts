import { TestBed } from '@angular/core/testing';

import { Dolar } from './dolar';

describe('Dolar', () => {
  let service: Dolar;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Dolar);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
