import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FavoriteMovies } from './favorite-movies';

describe('FavoriteMovies', () => {
  let component: FavoriteMovies;
  let fixture: ComponentFixture<FavoriteMovies>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FavoriteMovies],
    }).compileComponents();

    fixture = TestBed.createComponent(FavoriteMovies);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
