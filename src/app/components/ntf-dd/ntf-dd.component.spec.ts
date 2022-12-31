import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NtfDDComponent } from './ntf-dd.component';

describe('NtfDDComponent', () => {
  let component: NtfDDComponent;
  let fixture: ComponentFixture<NtfDDComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NtfDDComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NtfDDComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
