import { Routes } from '@angular/router';
import { AuthComponent } from './features/auth/auth';
import { TournamentList } from './features/tournament/tournament-list/tournament-list';
import { authGuard } from './core/Guards/auth.guard';

export const routes: Routes = [
    { path: '', pathMatch: 'full', redirectTo: 'login' },
    { path: 'login', component: AuthComponent, data: { mode: 'login' } },
    { path: 'register', component: AuthComponent, data: { mode: 'register' } },
    { path: 'home', component: TournamentList, canActivate: [authGuard] },
];
