import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonDetails } from './person-detail';

describe('PersonDetail', () => {
  let component: PersonDetails;
  let fixture: ComponentFixture<PersonDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonDetails],
    }).compileComponents();

    fixture = TestBed.createComponent(PersonDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
