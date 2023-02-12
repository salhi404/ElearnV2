import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersModComponent } from './users-mod.component';

describe('UsersModComponent', () => {
  let component: UsersModComponent;
  let fixture: ComponentFixture<UsersModComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UsersModComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsersModComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
