import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CartogramComponent } from './cartogram.component';

describe('CartogramComponent', () => {
  let component: CartogramComponent;
  let fixture: ComponentFixture<CartogramComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CartogramComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CartogramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
