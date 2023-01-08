import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SceletonLoadComponent } from './sceleton-load.component';

describe('SceletonLoadComponent', () => {
  let component: SceletonLoadComponent;
  let fixture: ComponentFixture<SceletonLoadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SceletonLoadComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SceletonLoadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
