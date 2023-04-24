import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherWhiteboardComponent } from './teacher-whiteboard.component';

describe('TeacherWhiteboardComponent', () => {
  let component: TeacherWhiteboardComponent;
  let fixture: ComponentFixture<TeacherWhiteboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TeacherWhiteboardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeacherWhiteboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
