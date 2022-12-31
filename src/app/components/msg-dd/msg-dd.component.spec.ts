import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MsgDDComponent } from './msg-dd.component';

describe('MsgDDComponent', () => {
  let component: MsgDDComponent;
  let fixture: ComponentFixture<MsgDDComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MsgDDComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MsgDDComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
