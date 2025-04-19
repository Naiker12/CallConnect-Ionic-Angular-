import { TestBed } from '@angular/core/testing';

import { FirebaseUserService } from './firebase-user.service';

describe('FirebaseUserService', () => {
  let service: FirebaseUserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FirebaseUserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
