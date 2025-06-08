import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewUserProfileComponent } from './review-user-profile.component';

describe('ReviewUserProfileComponent', () => {
  let component: ReviewUserProfileComponent;
  let fixture: ComponentFixture<ReviewUserProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReviewUserProfileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReviewUserProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
