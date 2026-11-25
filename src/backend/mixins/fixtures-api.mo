import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import AccessControl "mo:caffeineai-authorization/access-control";
import UserApproval "mo:caffeineai-user-approval/approval";
import Common "../types/common";
import FixtureTypes "../types/fixtures";
import TeamTypes "../types/teams";
import FixturesLib "../lib/fixtures";

mixin (
  accessControlState : AccessControl.AccessControlState,
  approvalState : UserApproval.UserApprovalState,
  teams : Map.Map<Common.TeamId, TeamTypes.Team>,
  matchdays : Map.Map<Common.MatchdayId, FixtureTypes.Matchday>,
  matches : Map.Map<Common.MatchId, FixtureTypes.Match>,
  state : { var nextMatchdayId : Nat; var nextMatchId : Nat },
) {
  func requireFixtureAdmin(caller : Principal) {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Solo el administrador puede gestionar el sorteo");
    };
  };

  func requireFixtureApproved(caller : Principal) {
    if (not UserApproval.isApproved(approvalState, caller)) {
      Runtime.trap("Necesitas aprobación para ver el calendario");
    };
  };

  public query ({ caller }) func listMatchdays() : async [FixtureTypes.MatchdayView] {
    requireFixtureApproved(caller);
    FixturesLib.listMatchdays(matchdays, matches);
  };

  public shared ({ caller }) func createMatchday(name : Text) : async FixtureTypes.Matchday {
    requireFixtureAdmin(caller);
    FixturesLib.createMatchday(matchdays, state, name, Time.now());
  };

  public shared ({ caller }) func deleteMatchday(id : Common.MatchdayId) : async Bool {
    requireFixtureAdmin(caller);
    FixturesLib.deleteMatchday(matchdays, matches, id);
  };

  public shared ({ caller }) func addMatch(
    matchdayId : Common.MatchdayId,
    input : FixtureTypes.MatchInput,
  ) : async { #ok : FixtureTypes.Match; #err : FixtureTypes.FixtureError } {
    requireFixtureAdmin(caller);
    FixturesLib.addMatch(matchdays, matches, teams, state, matchdayId, input);
  };

  public shared ({ caller }) func updateMatch(
    matchId : Common.MatchId,
    input : FixtureTypes.MatchInput,
  ) : async { #ok : FixtureTypes.Match; #err : FixtureTypes.FixtureError } {
    requireFixtureAdmin(caller);
    FixturesLib.updateMatch(matchdays, matches, teams, matchId, input);
  };

  public shared ({ caller }) func deleteMatch(matchId : Common.MatchId) : async Bool {
    requireFixtureAdmin(caller);
    FixturesLib.deleteMatch(matches, matchId);
  };

  public shared ({ caller }) func setMatchResult(
    matchId : Common.MatchId,
    homeScore : Nat,
    awayScore : Nat,
  ) : async ?FixtureTypes.Match {
    requireFixtureAdmin(caller);
    FixturesLib.setMatchResult(matches, matchId, homeScore, awayScore);
  };
};
