import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatchesForm } from './matches-form';

describe('MatchesForm', () => {
  let component: MatchesForm;
  let fixture: ComponentFixture<MatchesForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatchesForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MatchesForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
