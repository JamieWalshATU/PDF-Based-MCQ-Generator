import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseButtonComponent } from './course-button.component';

describe('CourseButtonComponent', () => {
  let component: CourseButtonComponent;
  let fixture: ComponentFixture<CourseButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourseButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourseButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
