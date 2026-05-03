import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { TournamentService } from '../../../core/Services/tournament_service';

@Component({
  selector: 'app-tournament-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './tournament-form.html',
  styleUrl: './tournament-form.css',
})
export class TournamentForm {
  private readonly fb = inject(FormBuilder);
  private readonly tournamentService = inject(TournamentService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly editingTournamentId = signal<string | null>(null);
  readonly isLoadingData = signal(false);
  readonly isSaving = signal(false);
  readonly pageError = signal('');

  readonly isEditing = computed(() => Boolean(this.editingTournamentId()));

  readonly tournamentForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    game: ['', [Validators.required]],
    description: [''],
    status: ['open' as 'open' | 'ongoing' | 'finished'],
  });

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editingTournamentId.set(id);
      this.loadTournamentForEdit(id);
    }
  }

  get titleControl() {
    return this.tournamentForm.controls.title;
  }

  get gameControl() {
    return this.tournamentForm.controls.game;
  }

  submitTournament(): void {
    if (this.titleControl.invalid) {
      this.titleControl.markAsTouched();
    }
    if (this.gameControl.invalid) {
      this.gameControl.markAsTouched();
    }
    if (this.tournamentForm.invalid) {
      return;
    }

    const tournamentData = {
      title: this.tournamentForm.controls.title.getRawValue(),
      game: this.tournamentForm.controls.game.getRawValue(),
      description: this.tournamentForm.controls.description.getRawValue(),
      status: this.tournamentForm.controls.status.getRawValue(),
    };

    this.isSaving.set(true);
    this.pageError.set('');

    const editingId = this.editingTournamentId();
    const request$ = editingId
      ? this.tournamentService.updateTournament(editingId, tournamentData)
      : this.tournamentService.createTournament(tournamentData);

    request$.pipe(finalize(() => this.isSaving.set(false))).subscribe({
      next: () => {
        this.router.navigateByUrl('/tournaments');
      },
      error: (error) => {
        this.pageError.set(
          error.error?.message ?? 'Could not save the tournament.'
        );
      },
    });
  }

  goBack(): void {
    this.router.navigateByUrl('/tournaments');
  }

  private loadTournamentForEdit(id: string): void {
    this.isLoadingData.set(true);

    this.tournamentService
      .getTournamentById(id)
      .pipe(finalize(() => this.isLoadingData.set(false)))
      .subscribe({
        next: (response) => {
          const t = response.data.tournament;
          this.tournamentForm.patchValue({
            title: t.title,
            game: t.game,
            description: t.description ?? '',
            status: t.status,
          });
        },
        error: (error) => {
          this.pageError.set(
            error.error?.message ?? 'Could not load tournament data.'
          );
        },
      });
  }
}
