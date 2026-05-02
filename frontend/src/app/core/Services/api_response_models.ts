export interface UserProfile {
    id: string;
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
    status: "open" | "closed" | "finished";
    createdAt: string;
    updatedAt: string;
}

export interface MatchItem {
    _id: string;
    tournamentId: {
        _id: string;
        title: string;
    };
    player1: {
        _id: string;
        username: string;
        email: string;
    };
    player2: {
        _id: string;
        username: string;
        email: string;
    };
    score: string;
    winner: string | null;
    status: "pending" | "in_progress" | "finished";
    createdAt: string;
    updatedAt: string;
}
