export interface UserProfile {
    _id: string;
    name: string;
    username: string;
    email: string;
    createdAt: string;
}

export interface ApiResponse<T> {
    message: string;
    data: T;
}

export interface TournamentItem {
    _id: string;
    title: string;
    game: string;
    description: string;
    createdBy: {
        _id: string;
        name: string;
        email: string;
    };
    players: {
        _id: string;
        username: string;
        email: string;
    }[];
    status: "open" | "ongoing" | "finished";
    createdAt: string;
    updatedAt: string;
}

export interface PlayerRef {
    _id: string;
    username: string;
}

export interface MatchScore {
    player1: number;
    player2: number;
}

export interface MatchTournamentRef {
    _id: string;
    title: string;
    createdBy: string;
}

export interface MatchItem {
    _id: string;
    tournamentId: MatchTournamentRef | string;
    player1: PlayerRef;
    player2: PlayerRef;
    score: MatchScore;
    winner?: PlayerRef | null;
    status: 'pending' | 'live' | 'finished';
    createdAt: string;
    updatedAt: string;
}
