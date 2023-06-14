import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SlideboardComponent } from './slideboard.component';

describe('SlideboardComponent', () => {
  let component: SlideboardComponent;
  let fixture: ComponentFixture<SlideboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SlideboardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SlideboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
