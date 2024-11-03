import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Stackedbarchart100Component } from './stackedbarchart100.component';

describe('Stackedbarchart100Component', () => {
  let component: Stackedbarchart100Component;
  let fixture: ComponentFixture<Stackedbarchart100Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Stackedbarchart100Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Stackedbarchart100Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
