import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostReportsReviewsComponent } from './post-reports-reviews.component';

describe('PostReportsReviewsComponent', () => {
  let component: PostReportsReviewsComponent;
  let fixture: ComponentFixture<PostReportsReviewsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostReportsReviewsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostReportsReviewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
