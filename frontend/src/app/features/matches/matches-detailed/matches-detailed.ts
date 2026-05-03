import { Component, inject, signal, computed, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { MatchService } from '../../../core/Services/match_service';
import { MatchItem } from '../../../core/Services/api_response_models';
import { RealtimeService } from '../../../core/Services/realtime.service';


@Component({
  selector: 'app-matches-detailed',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './matches-detailed.html',
  styleUrl: './matches-detailed.css',
})
export class MatchesDetailed {
  private readonly matchService = inject(MatchService);
  private readonly realtimeService = inject(RealtimeService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  match = signal<MatchItem | null>(null);
  isLoading = signal<boolean>(false);
  pageError = signal<string | null>(null);

  // Toast 
  toastMessage = signal<string | null>(null);
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  isFinished = computed(() => this.match()?.status === 'finished');
  isLive = computed(() => this.match()?.status === 'live');
  isPending = computed(() => this.match()?.status === 'pending');
  isTie = computed(() => this.isFinished() && !this.match()?.winner);

  statusClass = computed(() => {
    switch (this.match()?.status) {
      case 'live':
        return 'bg-green-200 text-green-800';
      case 'finished':
        return 'bg-gray-300 text-gray-700';
      default:
        return 'bg-yellow-200 text-yellow-800';
    }
  });

  constructor() {
    const matchId = this.route.snapshot.paramMap.get('id');
    if (matchId) {
      this.loadMatch(matchId);
    } else {
      this.pageError.set('Match ID not found in route.');
    }
    this.realtimeService.connect({
      onMatchScoreUpdate: () => this.reloadMatch(),
      onMatchStatusChange: () => this.reloadMatch(),
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

  private reloadMatch(): void {
    const id = this.match()?._id;
    if (!id) return;
    this.matchService.getMatchById(id).subscribe({
      next: (response) => this.match.set(response.data.match),
    });
  }

  loadMatch(matchId: string): void {
    this.isLoading.set(true);
    this.pageError.set(null);

    this.matchService.getMatchById(matchId).subscribe({
      next: (response) => {
        this.match.set(response.data.match);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.pageError.set(err?.error?.message ?? 'Error loading match.');
        this.isLoading.set(false);
      },
    });
  }

  private get matchId(): string {
    return this.match()?._id ?? '';
  }

  incrementPlayer1(): void {
    const current = this.match();
    if (!current || this.isFinished()) return;
    const newScore = {
      player1: (current.score?.player1 ?? 0) + 1,
      player2: current.score?.player2 ?? 0,
    };
    this.updateScore(newScore);
  }

  decrementPlayer1(): void {
    const current = this.match();
    if (!current || this.isFinished()) return;
    const newScore = {
      player1: Math.max(0, (current.score?.player1 ?? 0) - 1),
      player2: current.score?.player2 ?? 0,
    };
    this.updateScore(newScore);
  }

  incrementPlayer2(): void {
    const current = this.match();
    if (!current || this.isFinished()) return;
    const newScore = {
      player1: current.score?.player1 ?? 0,
      player2: (current.score?.player2 ?? 0) + 1,
    };
    this.updateScore(newScore);
  }

  decrementPlayer2(): void {
    const current = this.match();
    if (!current || this.isFinished()) return;
    const newScore = {
      player1: current.score?.player1 ?? 0,
      player2: Math.max(0, (current.score?.player2 ?? 0) - 1),
    };
    this.updateScore(newScore);
  }

  private updateScore(score: { player1: number; player2: number }): void {
    this.matchService.updateMatch(this.matchId, { score }).subscribe({
      next: (response) => {
        this.match.update((m) =>
          m ? { ...m, score: response.data.match.score } : m
        );
      },
      error: (err) => {
        this.pageError.set(err?.error?.message ?? 'Error updating score.');
      },
    });
  }

  startMatch(): void {
    if (!this.isPending()) return;
    this.matchService.updateMatch(this.matchId, { status: 'live' }).subscribe({
      next: (response) => {
        this.match.update((m) =>
          m ? { ...m, status: response.data.match.status } : m
        );
      },
      error: (err) => {
        this.pageError.set(err?.error?.message ?? 'Error starting match.');
      },
    });
  }

  finishMatch(): void {
    if (!this.isLive()) return;
    this.matchService
      .updateMatch(this.matchId, { status: 'finished' })
      .subscribe({
        next: (response) => {
          // Update the full match so winner calculated by backend is reflected
          this.match.set(response.data.match);
        },
        error: (err) => {
          this.pageError.set(err?.error?.message ?? 'Error finishing match.');
        },
      });
  }

  goBack(): void {
    this.router.navigate(['/matches']);
  }
}