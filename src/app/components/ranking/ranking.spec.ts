import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Ranking } from './ranking';

describe('Ranking', () => {
  let component: Ranking;
  let fixture: ComponentFixture<Ranking>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Ranking],
    }).compileComponents();

    fixture = TestBed.createComponent(Ranking);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
