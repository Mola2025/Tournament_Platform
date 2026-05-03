import { Routes } from '@angular/router';
import { AuthComponent } from './features/auth/auth';
import { TournamentList } from './features/tournament/tournament-list/tournament-list';
import { TournamentForm } from './features/tournament/tournament-form/tournament-form';
import { TournamentDetailed } from './features/tournament/tournament-detailed/tournament-detailed';
import { authGuard } from './core/Guards/auth.guard';
import { MatchesList } from './features/matches/matches-list/matches-list';
import { MatchesForm } from './features/matches/matches-form/matches-form';
import { MatchesDetailed } from './features/matches/matches-detailed/matches-detailed';
import { ProfilePage } from './features/profile/profile-page/profile-page';

export const routes: Routes = [
    { path: '', pathMatch: 'full', redirectTo: 'login' },
    { path: 'login', component: AuthComponent, data: { mode: 'login' } },
    { path: 'register', component: AuthComponent, data: { mode: 'register' } },
    { path: 'home', component: TournamentList, canActivate: [authGuard] },
    {
        path: 'tournaments',
        canActivate: [authGuard],
        children: [
            { path: '', component: TournamentList },
            { path: 'new', component: TournamentForm },
            { path: ':id', component: TournamentDetailed },
            { path: ':id/edit', component: TournamentForm },
        ]
    },
    {
        path: 'matches',
        canActivate: [authGuard],
        children: [
            { path: '', component: MatchesList },
            { path: 'new', component: MatchesForm },
            { path: ':id', component: MatchesDetailed },
        ]
    },
    { path: 'profile', component: ProfilePage, canActivate: [authGuard] },
];
