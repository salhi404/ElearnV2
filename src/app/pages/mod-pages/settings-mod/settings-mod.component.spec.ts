import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsModComponent } from './settings-mod.component';

describe('SettingsModComponent', () => {
  let component: SettingsModComponent;
  let fixture: ComponentFixture<SettingsModComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SettingsModComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingsModComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
