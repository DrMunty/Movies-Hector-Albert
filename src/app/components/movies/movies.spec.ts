import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Movies } from './movies';

describe('Movies', () => {
  let component: Movies;
  let fixture: ComponentFixture<Movies>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Movies],
    }).compileComponents();

    fixture = TestBed.createComponent(Movies);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
