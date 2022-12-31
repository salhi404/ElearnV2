import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserDDComponent } from './user-dd.component';

describe('UserDDComponent', () => {
  let component: UserDDComponent;
  let fixture: ComponentFixture<UserDDComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserDDComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserDDComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
