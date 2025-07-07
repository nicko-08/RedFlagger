import { TestBed } from '@angular/core/testing';

import { ReportSyncService } from './report-sync.service';

describe('ReportSyncService', () => {
  let service: ReportSyncService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReportSyncService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
