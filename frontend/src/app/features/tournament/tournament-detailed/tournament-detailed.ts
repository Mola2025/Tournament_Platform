import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { TournamentItem } from '../../../core/Services/api_response_models';
import { TournamentService } from '../../../core/Services/tournament_service';
import { AuthService } from '../../../core/Services/auth_service';
import { RealtimeService } from '../../../core/Services/realtime.service';


type TournamentStatus = 'open' | 'ongoing' | 'finished';

const STATUS_TRANSITIONS: Record<TournamentStatus, TournamentStatus | null> = {
  open: 'ongoing',
  ongoing: 'finished',
  finished: null,
};

const BUTTON_LABELS: Record<TournamentStatus, string> = {
  open: 'Start Tournament',
  ongoing: 'Finish Tournament',
  finished: '',
};
@Component({
  selector: 'app-tournament-detailed',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tournament-detailed.html',
  styleUrl: './tournament-detailed.css',
})
export class TournamentDetailed {
  private readonly tournamentService = inject(TournamentService);
  private readonly realtimeService = inject(RealtimeService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly currentUser = inject(AuthService).currentUser;

  readonly tournament = signal<TournamentItem | null>(null);
  readonly isLoading = signal(true);
  readonly isUpdatingStatus = signal(false);
  readonly pageError = signal('');

  // Toast
  readonly toastMessage = signal<string | null>(null);
  readonly toastProminent = signal(false);
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  readonly isCreator = computed(() => {
    const user = this.currentUser();
    const t = this.tournament();
    if (!user || !t) return false;

    return t.createdBy._id === user._id;
  });

  readonly nextStatus = computed<TournamentStatus | null>(() => {
    const status = this.tournament()?.status as TournamentStatus | undefined;
    if (!status) return null;
    return STATUS_TRANSITIONS[status] ?? null;
  });

  readonly changeButtonLabel = computed<string>(() => {
    const status = this.tournament()?.status as TournamentStatus | undefined;
    if (!status) return '';
    return BUTTON_LABELS[status];
  });

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadTournament(id);
    } else {
      this.pageError.set('Tournament ID is missing from the route.');
      this.isLoading.set(false);
    }
    this.realtimeService.connect({
      onMatchScoreUpdate: () => { },
      onMatchStatusChange: () => { },
      onPlayerJoined: () => {
        // Reload tournament to reflect updated players list
        const tid = this.tournament()?._id;
        if (tid) this.loadTournament(tid);
        this.showToast('New player joined the tournament!');
      },
      onGlobalAlert: (message) => this.showToast(message, true),
    });

    this.destroyRef.onDestroy(() => this.realtimeService.disconnect());
  }

  showToast(message: string, prominent = false): void {
    this.toastMessage.set(message);
    this.toastProminent.set(prominent);
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toastMessage.set(null), prominent ? 5000 : 4000);
  }

  dismissToast(): void {
    this.toastMessage.set(null);
    if (this.toastTimer) clearTimeout(this.toastTimer);
  }

  loadTournament(id: string): void {
    this.isLoading.set(true);
    this.pageError.set('');

    this.tournamentService
      .getTournamentById(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response) => {
          this.tournament.set(response.data.tournament);
        },
        error: (error) => {
          this.pageError.set(
            error.error?.message ?? 'Could not load the tournament.'
          );
        },
      });
  }

  changeStatus(): void {
    const t = this.tournament();
    const next = this.nextStatus();
    if (!t || !next) return;

    this.isUpdatingStatus.set(true);

    this.tournamentService
      .updateTournament(t._id, { status: next })
      .pipe(finalize(() => this.isUpdatingStatus.set(false)))
      .subscribe({
        next: (response) => {
          this.tournament.set(response.data.tournament);
        },
        error: (error) => {
          this.pageError.set(
            error.error?.message ?? 'Could not update the tournament status.'
          );
        },
      });
  }

  navigateToEdit(): void {
    const t = this.tournament();
    if (t) {
      this.router.navigateByUrl(`/tournaments/${t._id}/edit`);
    }
  }

  goBack(): void {
    this.router.navigateByUrl('/tournaments');
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      open: 'status-open',
      ongoing: 'status-ongoing',
      finished: 'status-finished',
    };
    return map[status] ?? '';
  }
}
