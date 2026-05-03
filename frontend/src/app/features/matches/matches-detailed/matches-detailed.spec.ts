import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatchesDetailed } from './matches-detailed';

describe('MatchesDetailed', () => {
  let component: MatchesDetailed;
  let fixture: ComponentFixture<MatchesDetailed>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatchesDetailed]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MatchesDetailed);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
