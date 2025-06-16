import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportUserProfileComponent } from './report-user-profile.component';

describe('ReportUserProfileComponent', () => {
  let component: ReportUserProfileComponent;
  let fixture: ComponentFixture<ReportUserProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportUserProfileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportUserProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
