import Common "../types/common";

module {
  public type MatchStatus = {
    #scheduled;
    #played;
  };

  public type Match = {
    id : Common.MatchId;
    matchdayId : Common.MatchdayId;
    homeTeamId : Common.TeamId;
    awayTeamId : Common.TeamId;
    status : MatchStatus;
    homeScore : ?Nat;
    awayScore : ?Nat;
  };

  public type Matchday = {
    id : Common.MatchdayId;
    name : Text;
    createdAt : Common.Timestamp;
  };

  public type MatchInput = {
    homeTeamId : Common.TeamId;
    awayTeamId : Common.TeamId;
  };

  public type MatchdayView = {
    id : Common.MatchdayId;
    name : Text;
    createdAt : Common.Timestamp;
    matches : [Match];
  };

  public type FixtureError = {
    #notFound;
    #sameTeam;
    #teamAlreadyInMatchday : { teamId : Common.TeamId };
    #unknownTeam : { teamId : Common.TeamId };
    #invalidScore;
  };
};
