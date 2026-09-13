import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TvShowDetails } from './tvshow-detail';

describe('TvshowDetail', () => {
  let component: TvShowDetails;
  let fixture: ComponentFixture<TvShowDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TvShowDetails],
    }).compileComponents();

    fixture = TestBed.createComponent(TvShowDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
