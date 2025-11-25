import { TestBed } from '@angular/core/testing';

import { ChefserviceService } from './chefservice.service';

describe('ChefserviceService', () => {
  let service: ChefserviceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChefserviceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
