import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/Services/auth_service';
import { TournamentService } from '../../../core/Services/tournament_service';
import { TournamentItem } from '../../../core/Services/api_response_models';
import { signal } from '@angular/core';

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

  user = this.authService.currentUser;

  myTournaments = signal<TournamentItem[]>([]);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  constructor() {
    this.loadUserTournaments();
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
}