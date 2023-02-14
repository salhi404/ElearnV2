import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherEnrollersComponent } from './teacher-enrollers.component';

describe('TeacherEnrollersComponent', () => {
  let component: TeacherEnrollersComponent;
  let fixture: ComponentFixture<TeacherEnrollersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TeacherEnrollersComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeacherEnrollersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
