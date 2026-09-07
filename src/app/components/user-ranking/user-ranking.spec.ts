import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserRanking } from './user-ranking';

describe('UserRanking', () => {
  let component: UserRanking;
  let fixture: ComponentFixture<UserRanking>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserRanking],
    }).compileComponents();

    fixture = TestBed.createComponent(UserRanking);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
