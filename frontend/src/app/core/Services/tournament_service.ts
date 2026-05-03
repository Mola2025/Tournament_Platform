import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { environment } from "../../../environments/environment";
import { ApiResponse, TournamentItem } from "./api_response_models";

interface TournamentData {
    title?: string;
    game?: string;
    description?: string;
    status?: "open" | "ongoing" | "finished";
}

@Injectable({ providedIn: "root" })
export class TournamentService {
    private readonly http = inject(HttpClient);

    getTournaments(filter?: 'created' | 'joined') {
        const params = filter ? `?filter=${filter}` : '';
        return this.http.get<ApiResponse<{ tournaments: TournamentItem[] }>>(
            `${environment.apiUrl}/tournaments${params}`,
        );
    }

    getTournamentById(id: string) {
        return this.http.get<ApiResponse<{ tournament: TournamentItem }>>(
            `${environment.apiUrl}/tournaments/${id}`,
        );
    }

    joinTournament(tournamentId: string) {
        return this.http.post<ApiResponse<{ tournament: TournamentItem }>>(
            `${environment.apiUrl}/tournaments/${tournamentId}/join`,
            {}
        );
    }

    leaveTournament(tournamentId: string) {
        return this.http.delete<ApiResponse<{ tournament: TournamentItem }>>(
            `${environment.apiUrl}/tournaments/${tournamentId}/leave`
        );
    }

    createTournament(payload: TournamentData) {
        return this.http.post<ApiResponse<{ tournament: TournamentItem }>>(
            `${environment.apiUrl}/tournaments`,
            payload,
        );
    }

    updateTournament(tournamentId: string, payload: TournamentData) {
        return this.http.patch<ApiResponse<{ tournament: TournamentItem }>>(
            `${environment.apiUrl}/tournaments/${tournamentId}`,
            payload,
        );
    }

    deleteTournament(tournamentId: string) {
        return this.http.delete<ApiResponse<{ tournament: TournamentItem }>>(
            `${environment.apiUrl}/tournaments/${tournamentId}`,
        );
    }
}