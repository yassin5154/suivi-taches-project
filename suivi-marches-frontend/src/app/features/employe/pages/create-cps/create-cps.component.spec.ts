import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateCpsComponent } from './create-cps.component';

describe('CreateCpsComponent', () => {
  let component: CreateCpsComponent;
  let fixture: ComponentFixture<CreateCpsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateCpsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateCpsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
