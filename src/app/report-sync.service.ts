import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReportSyncService {
 private recoveredReport$ = new BehaviorSubject<any>(null);
  
setRecoveredReport(report: any) {
    this.recoveredReport$.next(report);
  }
getRecoveredReport() {
    return this.recoveredReport$.asObservable();
  }
}
