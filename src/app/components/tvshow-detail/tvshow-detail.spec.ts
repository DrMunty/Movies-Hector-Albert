import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TvshowDetail } from './tvshow-detail';

describe('TvshowDetail', () => {
  let component: TvshowDetail;
  let fixture: ComponentFixture<TvshowDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TvshowDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(TvshowDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
