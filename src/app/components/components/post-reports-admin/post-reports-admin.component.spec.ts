import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostReportsAdminComponent } from './post-reports-admin.component';

describe('PostReportsAdminComponent', () => {
  let component: PostReportsAdminComponent;
  let fixture: ComponentFixture<PostReportsAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostReportsAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostReportsAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
