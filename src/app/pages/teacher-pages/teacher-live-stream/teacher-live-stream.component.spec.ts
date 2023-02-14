import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherLiveStreamComponent } from './teacher-live-stream.component';

describe('TeacherLiveStreamComponent', () => {
  let component: TeacherLiveStreamComponent;
  let fixture: ComponentFixture<TeacherLiveStreamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TeacherLiveStreamComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeacherLiveStreamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
