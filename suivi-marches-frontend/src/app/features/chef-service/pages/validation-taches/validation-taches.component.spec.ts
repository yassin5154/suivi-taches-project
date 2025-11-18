import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidationTachesComponent } from './validation-taches.component';

describe('ValidationTachesComponent', () => {
  let component: ValidationTachesComponent;
  let fixture: ComponentFixture<ValidationTachesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValidationTachesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ValidationTachesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
