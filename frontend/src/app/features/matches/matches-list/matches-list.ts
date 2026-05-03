import { Component, inject, signal, computed, input, effect, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { MatchService } from '../../../core/Services/match_service';
import { MatchItem, MatchTournamentRef } from '../../../core/Services/api_response_models';
import { AuthService } from '../../../core/Services/auth_service';
import { RealtimeService } from '../../../core/Services/realtime.service';

@Component({
  selector: 'app-matches-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './matches-list.html',
  styleUrl: './matches-list.css',
})
export class MatchesList {
  private readonly matchService = inject(MatchService);
  private readonly authService = inject(AuthService);
  private readonly realtimeService = inject(RealtimeService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);

  matches = signal<MatchItem[]>([]);
  isLoading = signal<boolean>(false);
  pageError = signal<string | null>(null);

  // Toast notification state
  toastMessage = signal<string | null>(null);
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  tournamentId = input<string | null>(null);

  filteredMatches = computed(() => {
    const tournamentId = this.tournamentId();
    if (!tournamentId) return this.matches();
    return this.matches().filter((m) => {
      const matchTid = typeof m.tournamentId === 'object'
        ? m.tournamentId._id
        : m.tournamentId;
      return matchTid === tournamentId;
    });
  });

  hasMatches = computed(() => this.filteredMatches().length > 0);

  constructor() {
    effect(() => {
      this.tournamentId(); // tracked for embedded inside tournament details
      this.loadMatches();
    });

    this.realtimeService.connect({
      onMatchScoreUpdate: () => this.refreshMatches(),
      onMatchStatusChange: () => this.refreshMatches(),
      onPlayerJoined: () => this.showToast('New player joined the tournament!'),
      onGlobalAlert: (message) => this.showToast(message, true),
    });

    this.destroyRef.onDestroy(() => this.realtimeService.disconnect());
  }

  showToast(message: string, prominent = false): void {
    this.toastMessage.set(message);
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toastMessage.set(null), prominent ? 6000 : 4000);
  }

  dismissToast(): void {
    this.toastMessage.set(null);
    if (this.toastTimer) clearTimeout(this.toastTimer);
  }

  isCreatorOf(match: MatchItem): boolean {
    const currentUserId = this.authService.currentUser()?._id;
    if (!currentUserId) return false;

    const tid = match.tournamentId;
    if (typeof tid === 'object') {
      return (tid as MatchTournamentRef).createdBy === currentUserId;
    }

    return false;
  }

  loadMatches(): void {
    this.isLoading.set(true);
    this.pageError.set(null);

    this.matchService.getMatches().subscribe({
      next: (response) => {
        this.matches.set(response.data.matches);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.pageError.set(err?.error?.message ?? 'Error loading matches.');
        this.isLoading.set(false);
      },
    });
  }

  refreshMatches(): void {
    this.loadMatches();
  }

  deleteMatch(matchId: string): void {
    if (!confirm('Are you sure you want to delete this match?')) return;

    this.matchService.deleteMatch(matchId).subscribe({
      next: () => {
        this.matches.update((current) =>
          current.filter((m) => m._id !== matchId)
        );
      },
      error: (err) => {
        this.pageError.set(err?.error?.message ?? 'Error deleting match.');
      },
    });
  }

  goToDetail(matchId: string): void {
    this.router.navigate(['/matches', matchId]);
  }

  goToForm(): void {
    const tournamentId = this.tournamentId();
    if (tournamentId) {
      this.router.navigate(['/matches/new'], {
        queryParams: { tournamentId },
      });
    } else {
      this.router.navigate(['/matches/new']);
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'live':
        return 'bg-green-100 text-green-800';
      case 'finished':
        return 'bg-gray-200 text-gray-700';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  }
}
