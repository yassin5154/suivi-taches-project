import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuiviGlobalComponent } from './suivi-global.component';

describe('SuiviGlobalComponent', () => {
  let component: SuiviGlobalComponent;
  let fixture: ComponentFixture<SuiviGlobalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuiviGlobalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuiviGlobalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
