import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { TournamentItem } from '../../../core/Services/api_response_models';
import { TournamentService } from '../../../core/Services/tournament_service';
import { AuthService } from '../../../core/Services/auth_service';
import { RealtimeService } from '../../../core/Services/realtime.service';


@Component({
  selector: 'app-tournament-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tournament-list.html',
  styleUrl: './tournament-list.css',
})
export class TournamentList {
  private readonly tournamentService = inject(TournamentService);
  private readonly authService = inject(AuthService);
  private readonly realtimeService = inject(RealtimeService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);

  readonly tournaments = signal<TournamentItem[]>([]);
  readonly isLoading = signal(true);
  readonly pageError = signal('');
  readonly deletingId = signal<string | null>(null);
  readonly joiningId = signal<string | null>(null);
  readonly leavingId = signal<string | null>(null);

  // Toast
  readonly toastMessage = signal<string | null>(null);
  readonly toastProminent = signal(false);
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  readonly currentUser = computed(() => this.authService.currentUser());

  constructor() {
    this.loadTournaments();
    this.realtimeService.connect({
      onMatchScoreUpdate: () => this.refreshTournaments(),
      onMatchStatusChange: () => this.refreshTournaments(),
      onPlayerJoined: () => {
        this.refreshTournaments();
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
    this.toastTimer = setTimeout(() => this.toastMessage.set(null), prominent ? 7000 : 4000);
  }

  dismissToast(): void {
    this.toastMessage.set(null);
    if (this.toastTimer) clearTimeout(this.toastTimer);
  }

  trackByTournament(_: number, tournament: TournamentItem): string {
    return tournament._id;
  }

  isCreator(tournament: TournamentItem): boolean {
    return tournament.createdBy._id === this.currentUser()?._id;
  }

  hasJoined(tournament: TournamentItem): boolean {
    const userId = this.currentUser()?._id;
    if (!userId) return false;
    return tournament.players.some((p) => p._id === userId);
  }

  canJoin(tournament: TournamentItem): boolean {
    return (
      tournament.status === 'open' &&
      !this.isCreator(tournament) &&
      !this.hasJoined(tournament)
    );
  }

  joinTournament(tournament: TournamentItem): void {
    this.joiningId.set(tournament._id);

    this.tournamentService
      .joinTournament(tournament._id)
      .pipe(finalize(() => this.joiningId.set(null)))
      .subscribe({
        next: () => this.refreshTournaments(),
        error: (error) => {
          this.pageError.set(
            error.error?.message ?? 'Could not join the tournament.'
          );
        },
      });
  }

  leaveTournament(tournament: TournamentItem): void {
    this.leavingId.set(tournament._id);

    this.tournamentService
      .leaveTournament(tournament._id)
      .pipe(finalize(() => this.leavingId.set(null)))
      .subscribe({
        next: () => {
          this.refreshTournaments();
        },
        error: (error) => {
          this.pageError.set(
            error.error?.message ?? 'Could not leave the tournament.'
          );
        },
      });
  }

  loadTournaments(): void {
    this.isLoading.set(true);
    this.pageError.set('');

    this.tournamentService
      .getTournaments()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response) => {
          this.tournaments.set(response.data.tournaments);
        },
        error: (error) => {
          this.pageError.set(
            error.error?.message ?? 'Could not load tournaments.'
          );
        },
      });
  }

  deleteTournament(tournament: TournamentItem): void {
    this.deletingId.set(tournament._id);

    this.tournamentService
      .deleteTournament(tournament._id)
      .pipe(finalize(() => this.deletingId.set(null)))
      .subscribe({
        next: () => this.refreshTournaments(),
        error: (error) => {
          this.pageError.set(
            error.error?.message ?? 'Could not delete the tournament.'
          );
        },
      });
  }

  navigateToCreate(): void {
    this.router.navigateByUrl('/tournaments/new');
  }

  navigateToEdit(tournament: TournamentItem): void {
    this.router.navigateByUrl(`/tournaments/${tournament._id}/edit`);
  }

  navigateToDetail(tournament: TournamentItem): void {
    this.router.navigateByUrl(`/tournaments/${tournament._id}`);
  }

  getStatusClass(status: TournamentItem['status']): string {
    const map: Record<TournamentItem['status'], string> = {
      open: 'status-open',
      ongoing: 'status-ongoing',
      finished: 'status-finished',
    };
    return map[status];
  }

  private refreshTournaments(): void {
    this.tournamentService.getTournaments().subscribe({
      next: (response) => {
        this.tournaments.set(response.data.tournaments);
      },
      error: (error) => {
        this.pageError.set(
          error.error?.message ?? 'Could not reload tournaments.'
        );
      },
    });
  }
}
