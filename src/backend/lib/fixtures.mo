import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Common "../types/common";
import FixtureTypes "../types/fixtures";
import TeamTypes "../types/teams";

module {
  func matchesOf(
    matches : Map.Map<Common.MatchId, FixtureTypes.Match>,
    matchdayId : Common.MatchdayId,
  ) : [FixtureTypes.Match] {
    matches.values().filter(func m = m.matchdayId == matchdayId).toArray();
  };

  // A team may appear at most once per round. `ignoreMatchId` excludes the
  // match being edited from the conflict check.
  func conflict(
    matches : Map.Map<Common.MatchId, FixtureTypes.Match>,
    matchdayId : Common.MatchdayId,
    homeTeamId : Common.TeamId,
    awayTeamId : Common.TeamId,
    ignoreMatchId : ?Common.MatchId,
  ) : ?FixtureTypes.FixtureError {
    var found : ?FixtureTypes.FixtureError = null;
    for (m in matches.values()) {
      if (found == null and m.matchdayId == matchdayId) {
        let isSelf = switch (ignoreMatchId) {
          case (?id) { m.id == id };
          case null { false };
        };
        if (not isSelf) {
          if (m.homeTeamId == homeTeamId or m.awayTeamId == homeTeamId) {
            found := ?#teamAlreadyInMatchday({ teamId = homeTeamId });
          } else if (m.homeTeamId == awayTeamId or m.awayTeamId == awayTeamId) {
            found := ?#teamAlreadyInMatchday({ teamId = awayTeamId });
          };
        };
      };
    };
    found;
  };

  func validate(
    matchdays : Map.Map<Common.MatchdayId, FixtureTypes.Matchday>,
    matches : Map.Map<Common.MatchId, FixtureTypes.Match>,
    teams : Map.Map<Common.TeamId, TeamTypes.Team>,
    matchdayId : Common.MatchdayId,
    input : FixtureTypes.MatchInput,
    ignoreMatchId : ?Common.MatchId,
  ) : ?FixtureTypes.FixtureError {
    if (matchdays.get(matchdayId) == null) {
      return ?#notFound;
    };
    if (input.homeTeamId == input.awayTeamId) {
      return ?#sameTeam;
    };
    if (teams.get(input.homeTeamId) == null) {
      return ?#unknownTeam({ teamId = input.homeTeamId });
    };
    if (teams.get(input.awayTeamId) == null) {
      return ?#unknownTeam({ teamId = input.awayTeamId });
    };
    conflict(matches, matchdayId, input.homeTeamId, input.awayTeamId, ignoreMatchId);
  };

  public func listMatchdays(
    matchdays : Map.Map<Common.MatchdayId, FixtureTypes.Matchday>,
    matches : Map.Map<Common.MatchId, FixtureTypes.Match>,
  ) : [FixtureTypes.MatchdayView] {
    let views = matchdays.values().map(
      func(md) = {
        id = md.id;
        name = md.name;
        createdAt = md.createdAt;
        matches = matchesOf(matches, md.id);
      }
    ).toArray();
    views.sort(func(a, b) = Nat.compare(a.id, b.id));
  };

  public func createMatchday(
    matchdays : Map.Map<Common.MatchdayId, FixtureTypes.Matchday>,
    state : { var nextMatchdayId : Nat },
    name : Text,
    createdAt : Common.Timestamp,
  ) : FixtureTypes.Matchday {
    let id = state.nextMatchdayId;
    state.nextMatchdayId := id + 1;
    let matchday : FixtureTypes.Matchday = { id; name; createdAt };
    matchdays.add(id, matchday);
    matchday;
  };

  public func deleteMatchday(
    matchdays : Map.Map<Common.MatchdayId, FixtureTypes.Matchday>,
    matches : Map.Map<Common.MatchId, FixtureTypes.Match>,
    id : Common.MatchdayId,
  ) : Bool {
    if (matchdays.get(id) == null) {
      return false;
    };
    let doomed = matches.values().filter(func m = m.matchdayId == id).map(func m = m.id).toArray();
    for (matchId in doomed.values()) {
      matches.remove(matchId);
    };
    matchdays.remove(id);
    true;
  };

  public func addMatch(
    matchdays : Map.Map<Common.MatchdayId, FixtureTypes.Matchday>,
    matches : Map.Map<Common.MatchId, FixtureTypes.Match>,
    teams : Map.Map<Common.TeamId, TeamTypes.Team>,
    state : { var nextMatchId : Nat },
    matchdayId : Common.MatchdayId,
    input : FixtureTypes.MatchInput,
  ) : { #ok : FixtureTypes.Match; #err : FixtureTypes.FixtureError } {
    switch (validate(matchdays, matches, teams, matchdayId, input, null)) {
      case (?err) { #err(err) };
      case null {
        let id = state.nextMatchId;
        state.nextMatchId := id + 1;
        let match : FixtureTypes.Match = {
          id;
          matchdayId;
          homeTeamId = input.homeTeamId;
          awayTeamId = input.awayTeamId;
          status = #scheduled;
          homeScore = null;
          awayScore = null;
        };
        matches.add(id, match);
        #ok(match);
      };
    };
  };

  public func updateMatch(
    matchdays : Map.Map<Common.MatchdayId, FixtureTypes.Matchday>,
    matches : Map.Map<Common.MatchId, FixtureTypes.Match>,
    teams : Map.Map<Common.TeamId, TeamTypes.Team>,
    matchId : Common.MatchId,
    input : FixtureTypes.MatchInput,
  ) : { #ok : FixtureTypes.Match; #err : FixtureTypes.FixtureError } {
    let existing = switch (matches.get(matchId)) {
      case (?m) { m };
      case null { return #err(#notFound) };
    };
    switch (validate(matchdays, matches, teams, existing.matchdayId, input, ?matchId)) {
      case (?err) { #err(err) };
      case null {
        let updated : FixtureTypes.Match = {
          existing with
          homeTeamId = input.homeTeamId;
          awayTeamId = input.awayTeamId;
        };
        matches.add(matchId, updated);
        #ok(updated);
      };
    };
  };

  public func deleteMatch(
    matches : Map.Map<Common.MatchId, FixtureTypes.Match>,
    matchId : Common.MatchId,
  ) : Bool {
    if (matches.get(matchId) == null) {
      return false;
    };
    matches.remove(matchId);
    true;
  };

  public func setMatchResult(
    matches : Map.Map<Common.MatchId, FixtureTypes.Match>,
    matchId : Common.MatchId,
    homeScore : Nat,
    awayScore : Nat,
  ) : ?FixtureTypes.Match {
    switch (matches.get(matchId)) {
      case (?m) {
        let updated : FixtureTypes.Match = {
          m with
          status = #played;
          homeScore = ?homeScore;
          awayScore = ?awayScore;
        };
        matches.add(matchId, updated);
        ?updated;
      };
      case null { null };
    };
  };
};
