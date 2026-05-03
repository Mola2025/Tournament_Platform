import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { MatchService } from '../../../core/Services/match_service';
import { TournamentService } from '../../../core/Services/tournament_service';
import { TournamentItem } from '../../../core/Services/api_response_models';

// Custom validator to ensure player1 and player2 are different
function differentPlayersValidator(group: AbstractControl): ValidationErrors | null {
  const p1 = group.get('player1')?.value;
  const p2 = group.get('player2')?.value;
  if (p1 && p2 && p1 === p2) {
    return { samePlayer: true };
  }
  return null;
}

@Component({
  selector: 'app-matches-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './matches-form.html',
  styleUrl: './matches-form.css',
})
export class MatchesForm {
  private readonly matchService = inject(MatchService);
  private readonly tournamentService = inject(TournamentService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);

  isLoading = signal<boolean>(false);
  isLoadingTournaments = signal<boolean>(false);
  pageError = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  tournamentId = signal<string>('');

  // Tracks whether the user has attempted to submit (to show samePlayer error even before dirty)
  submitAttempted = signal<boolean>(false);

  myTournaments = signal<TournamentItem[]>([]);
  availablePlayers = signal<{ _id: string; username: string }[]>([]);

  form: FormGroup = this.fb.group(
    {
      tournamentId: ['', Validators.required],
      player1: ['', Validators.required],
      player2: ['', Validators.required],
    },
    { validators: differentPlayersValidator }
  );

  hasSamePlayerError = computed(() => {
    const hasSamePlayer = !!this.form.errors?.['samePlayer'];
    const bothDirty =
      !!this.form.get('player1')?.dirty && !!this.form.get('player2')?.dirty;
    return hasSamePlayer && (bothDirty || this.submitAttempted());
  });

  constructor() {
    this.loadMyTournaments();

    const tid = this.route.snapshot.queryParamMap.get('tournamentId');
    if (tid) {
      this.tournamentId.set(tid);
      this.form.patchValue({ tournamentId: tid });
    }
  }

  loadMyTournaments(): void {
    this.isLoadingTournaments.set(true);

    // filter=created to only get tournaments created by the user
    this.tournamentService.getTournaments('created').subscribe({
      next: (response) => {
        this.myTournaments.set(response.data.tournaments);
        this.isLoadingTournaments.set(false);

        // If tournamentId is in the query params, load players for that tournament
        const tid = this.route.snapshot.queryParamMap.get('tournamentId');
        if (tid) {
          this.loadPlayersForTournament(tid);
        }
      },
      error: (err) => {
        this.pageError.set(err?.error?.message ?? 'Error loading tournaments.');
        this.isLoadingTournaments.set(false);
      },
    });
  }

  onTournamentChange(): void {
    const tid = this.form.get('tournamentId')?.value;
    this.form.patchValue({ player1: '', player2: '' });
    this.availablePlayers.set([]);
    if (tid) {
      this.loadPlayersForTournament(tid);
    }
  }

  private loadPlayersForTournament(tournamentId: string): void {
    this.tournamentService.getTournamentById(tournamentId).subscribe({
      next: (response) => {
        this.availablePlayers.set(response.data.tournament.players);
      },
      error: (err) => {
        this.pageError.set(err?.error?.message ?? 'Error loading players.');
      },
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      if (this.form.errors?.['samePlayer']) {
        this.pageError.set('Player 1 and Player 2 must be different.');
      }
      return;
    }

    this.isLoading.set(true);
    this.pageError.set(null);
    this.successMessage.set(null);

    const payload = this.form.getRawValue() as {
      tournamentId: string;
      player1: string;
      player2: string;
    };

    this.matchService.createMatch(payload).subscribe({
      next: () => {
        this.successMessage.set('Match created successfully!');
        this.isLoading.set(false);
        setTimeout(() => this.goBack(), 1200);
      },
      error: (err) => {
        this.pageError.set(err?.error?.message ?? 'Error creating match.');
        this.isLoading.set(false);
      },
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control?.invalid && control?.touched);
  }

  goBack(): void {
    const tid = this.tournamentId();
    if (tid) {
      this.router.navigate(['/tournaments', tid]);
    } else {
      this.router.navigate(['/matches']);
    }
  }
}