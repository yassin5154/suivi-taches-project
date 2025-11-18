import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuiviTachesComponent } from './suivi-taches.component';

describe('SuiviTachesComponent', () => {
  let component: SuiviTachesComponent;
  let fixture: ComponentFixture<SuiviTachesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuiviTachesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuiviTachesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
