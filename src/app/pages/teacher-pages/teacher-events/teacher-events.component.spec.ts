import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherEventsComponent } from './teacher-events.component';

describe('TeacherEventsComponent', () => {
  let component: TeacherEventsComponent;
  let fixture: ComponentFixture<TeacherEventsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TeacherEventsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeacherEventsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
