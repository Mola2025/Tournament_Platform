import { Component, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/Services/auth_service';
import { TournamentService } from '../../../core/Services/tournament_service';
import { TournamentItem } from '../../../core/Services/api_response_models';
import { signal } from '@angular/core';
import { RealtimeService } from '../../../core/Services/realtime.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.css',
})
export class ProfilePage {
  private readonly authService = inject(AuthService);
  private readonly tournamentService = inject(TournamentService);
  private readonly realtimeService = inject(RealtimeService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);

  user = this.authService.currentUser;

  myTournaments = signal<TournamentItem[]>([]);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  // Toast notification state
  toastMessage = signal<string | null>(null);
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.loadUserTournaments();

    this.realtimeService.connect({
      onMatchScoreUpdate: () => this.loadUserTournaments(),
      onMatchStatusChange: () => this.loadUserTournaments(),
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

  loadUserTournaments() {
    this.isLoading.set(true);
    this.tournamentService.getTournaments('created').subscribe({
      next: (res) => {
        this.myTournaments.set(res.data.tournaments);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set('Error loading your tournaments');
        this.isLoading.set(false);
      }
    });
  }

  navigateToDetail(tournament: TournamentItem): void {
    this.router.navigateByUrl(`/tournaments/${tournament._id}`);
  }
}