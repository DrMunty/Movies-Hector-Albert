import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MovieList } from './movie-list';

describe('MovieList', () => {
  let component: MovieList;
  let fixture: ComponentFixture<MovieList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MovieList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MovieList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
