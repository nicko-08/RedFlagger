import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  private inputSource = new BehaviorSubject<string | null>(null);
  currentInput$ = this.inputSource.asObservable();

  updateInput(input: string): void {
    this.inputSource.next(input);
  }
}
