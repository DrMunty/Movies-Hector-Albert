import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MovieCardDetails } from './movie-card-details';

describe('MovieCardDetails', () => {
  let component: MovieCardDetails;
  let fixture: ComponentFixture<MovieCardDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MovieCardDetails],
    }).compileComponents();

    fixture = TestBed.createComponent(MovieCardDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
