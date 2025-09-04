import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardPesananComponent } from './card-pesanan.component';

describe('CardPesananComponent', () => {
  let component: CardPesananComponent;
  let fixture: ComponentFixture<CardPesananComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardPesananComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardPesananComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
