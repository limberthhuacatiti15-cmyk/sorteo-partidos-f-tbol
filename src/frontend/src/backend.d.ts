import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Cell {
    value: Value;
    name: string;
}
export type Error_ = {
    __kind__: "FrontendOriginsNotConfigured";
    FrontendOriginsNotConfigured: null;
} | {
    __kind__: "MixedSsoSources";
    MixedSsoSources: {
        otherKeys: Array<string>;
        ssoKeys: Array<string>;
    };
} | {
    __kind__: "Stale";
    Stale: {
        ageNs: bigint;
    };
} | {
    __kind__: "MalformedCandid";
    MalformedCandid: null;
} | {
    __kind__: "AmbiguousAttribute";
    AmbiguousAttribute: {
        field: string;
        sources: Array<string>;
    };
} | {
    __kind__: "NoAttributes";
    NoAttributes: null;
} | {
    __kind__: "UnknownNonce";
    UnknownNonce: null;
} | {
    __kind__: "UntrustedSsoSource";
    UntrustedSsoSource: {
        domain: string;
    };
} | {
    __kind__: "MissingField";
    MissingField: string;
} | {
    __kind__: "FrontendOriginMismatch";
    FrontendOriginMismatch: {
        got: string;
        expected: Array<string>;
    };
};
export type FixtureError = {
    __kind__: "invalidScore";
    invalidScore: null;
} | {
    __kind__: "teamAlreadyInMatchday";
    teamAlreadyInMatchday: {
        teamId: TeamId;
    };
} | {
    __kind__: "sameTeam";
    sameTeam: null;
} | {
    __kind__: "unknownTeam";
    unknownTeam: {
        teamId: TeamId;
    };
} | {
    __kind__: "notFound";
    notFound: null;
};
export interface Match {
    id: MatchId;
    status: MatchStatus;
    matchdayId: MatchdayId;
    awayTeamId: TeamId;
    homeTeamId: TeamId;
    homeScore?: bigint;
    awayScore?: bigint;
}
export type MatchId = bigint;
export interface MatchInput {
    awayTeamId: TeamId;
    homeTeamId: TeamId;
}
export interface Matchday {
    id: MatchdayId;
    name: string;
    createdAt: Timestamp;
}
export type MatchdayId = bigint;
export interface MatchdayView {
    id: MatchdayId;
    name: string;
    createdAt: Timestamp;
    matches: Array<Match>;
}
export interface Result {
    hasMore: boolean;
    rows: Array<Array<Cell>>;
}
export type Result__1 = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: Error_;
};
export interface Team {
    id: TeamId;
    name: string;
    color: string;
}
export type TeamId = bigint;
export interface TeamInput {
    name: string;
    color: string;
}
export type Timestamp = bigint;
export interface UserApprovalInfo {
    status: ApprovalStatus;
    principal: Principal;
}
export type Value = {
    __kind__: "int";
    int: bigint;
} | {
    __kind__: "nat";
    nat: bigint;
} | {
    __kind__: "float";
    float: number;
} | {
    __kind__: "bool";
    bool: boolean;
} | {
    __kind__: "null";
    null: null;
} | {
    __kind__: "text";
    text: string;
};
export enum ApprovalStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum MatchStatus {
    scheduled = "scheduled",
    played = "played"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addMatch(matchdayId: MatchdayId, input: MatchInput): Promise<{
        __kind__: "ok";
        ok: Match;
    } | {
        __kind__: "err";
        err: FixtureError;
    }>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createMatchday(name: string): Promise<Matchday>;
    createTeam(input: TeamInput): Promise<Team>;
    deleteMatch(matchId: MatchId): Promise<boolean>;
    deleteMatchday(id: MatchdayId): Promise<boolean>;
    deleteTeam(id: TeamId): Promise<boolean>;
    execute(qJson: string): Promise<Result>;
    getApiDoc(): Promise<string>;
    getCallerUserRole(): Promise<UserRole>;
    isCallerAdmin(): Promise<boolean>;
    isCallerApproved(): Promise<boolean>;
    listApprovals(): Promise<Array<UserApprovalInfo>>;
    listMatchdays(): Promise<Array<MatchdayView>>;
    listTeams(): Promise<Array<Team>>;
    removeApproval(user: Principal): Promise<void>;
    requestApproval(): Promise<void>;
    schema(): Promise<string>;
    setApproval(user: Principal, status: ApprovalStatus): Promise<void>;
    setMatchResult(matchId: MatchId, homeScore: bigint, awayScore: bigint): Promise<Match | null>;
    updateMatch(matchId: MatchId, input: MatchInput): Promise<{
        __kind__: "ok";
        ok: Match;
    } | {
        __kind__: "err";
        err: FixtureError;
    }>;
    updateTeam(id: TeamId, input: TeamInput): Promise<Team | null>;
}
