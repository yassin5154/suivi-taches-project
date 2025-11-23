import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateNeedComponent } from './create-need.component';

describe('CreateNeedComponent', () => {
  let component: CreateNeedComponent;
  let fixture: ComponentFixture<CreateNeedComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateNeedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateNeedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
