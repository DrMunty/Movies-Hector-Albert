import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonDetail } from './person-detail';

describe('PersonDetail', () => {
  let component: PersonDetail;
  let fixture: ComponentFixture<PersonDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(PersonDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
