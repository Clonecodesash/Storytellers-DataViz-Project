import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StackedbarchartmultComponent } from './stackedbarchartmult.component';

describe('StackedbarchartmultComponent', () => {
  let component: StackedbarchartmultComponent;
  let fixture: ComponentFixture<StackedbarchartmultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StackedbarchartmultComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StackedbarchartmultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
