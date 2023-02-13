import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationModComponent } from './notification-mod.component';

describe('NotificationModComponent', () => {
  let component: NotificationModComponent;
  let fixture: ComponentFixture<NotificationModComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NotificationModComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotificationModComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
