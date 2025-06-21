import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileImageSelectComponent } from './profile-image-select.component';

describe('ProfileImageSelectComponent', () => {
  let component: ProfileImageSelectComponent;
  let fixture: ComponentFixture<ProfileImageSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileImageSelectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileImageSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
