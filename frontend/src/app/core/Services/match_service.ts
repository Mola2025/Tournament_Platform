import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { environment } from "../../../environments/environment";
import { ApiResponse, MatchItem } from "./api_response_models";

interface MatchData {
    tournamentId?: string;
    player1?: string;
    player2?: string;
    score?: { player1: number; player2: number };
    status?: 'pending' | 'live' | 'finished';
    winner?: string;
}

@Injectable({ providedIn: "root" })
export class MatchService {
    private readonly http = inject(HttpClient);

    getMatches() {
        return this.http.get<ApiResponse<{ matches: MatchItem[] }>>(
            `${environment.apiUrl}/matches`,
        );
    }

    getMatchById(matchId: string) {
        return this.http.get<ApiResponse<{ match: MatchItem }>>(
            `${environment.apiUrl}/matches/${matchId}`,
        );
    }

    createMatch(payload: MatchData) {
        return this.http.post<ApiResponse<{ match: MatchItem }>>(
            `${environment.apiUrl}/matches`,
            payload,
        );
    }

    updateMatch(matchId: string, payload: MatchData) {
        return this.http.patch<ApiResponse<{ match: MatchItem }>>(
            `${environment.apiUrl}/matches/${matchId}`,
            payload,
        );
    }

    deleteMatch(matchId: string) {
        return this.http.delete<ApiResponse<{ match: MatchItem }>>(
            `${environment.apiUrl}/matches/${matchId}`,
        );
    }
}