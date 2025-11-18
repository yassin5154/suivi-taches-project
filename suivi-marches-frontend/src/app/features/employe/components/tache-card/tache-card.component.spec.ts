import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TacheCardComponent } from './tache-card.component';

describe('TacheCardComponent', () => {
  let component: TacheCardComponent;
  let fixture: ComponentFixture<TacheCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TacheCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TacheCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
