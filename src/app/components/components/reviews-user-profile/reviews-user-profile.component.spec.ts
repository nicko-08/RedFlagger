import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewsUserProfileComponent } from './reviews-user-profile.component';

describe('ReviewsUserProfileComponent', () => {
  let component: ReviewsUserProfileComponent;
  let fixture: ComponentFixture<ReviewsUserProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReviewsUserProfileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReviewsUserProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
