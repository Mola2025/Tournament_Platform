import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TournamentDetailed } from './tournament-detailed';

describe('TournamentDetailed', () => {
  let component: TournamentDetailed;
  let fixture: ComponentFixture<TournamentDetailed>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TournamentDetailed]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TournamentDetailed);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
