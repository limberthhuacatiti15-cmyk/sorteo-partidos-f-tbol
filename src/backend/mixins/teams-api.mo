import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import UserApproval "mo:caffeineai-user-approval/approval";
import Common "../types/common";
import Types "../types/teams";
import TeamsLib "../lib/teams";

mixin (
  accessControlState : AccessControl.AccessControlState,
  approvalState : UserApproval.UserApprovalState,
  teams : Map.Map<Common.TeamId, Types.Team>,
  state : { var nextTeamId : Nat },
) {
  func requireApproved(caller : Principal) {
    if (not (UserApproval.isApproved(approvalState, caller) or AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("No autorizado: solo usuarios aprobados pueden ver los equipos");
    };
  };

  func requireAdmin(caller : Principal) {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("No autorizado: solo el administrador puede gestionar los equipos");
    };
  };

  public query ({ caller }) func listTeams() : async [Types.Team] {
    requireApproved(caller);
    TeamsLib.listTeams(teams);
  };

  public shared ({ caller }) func createTeam(input : Types.TeamInput) : async Types.Team {
    requireAdmin(caller);
    TeamsLib.createTeam(teams, state, input);
  };

  public shared ({ caller }) func updateTeam(id : Common.TeamId, input : Types.TeamInput) : async ?Types.Team {
    requireAdmin(caller);
    TeamsLib.updateTeam(teams, id, input);
  };

  public shared ({ caller }) func deleteTeam(id : Common.TeamId) : async Bool {
    requireAdmin(caller);
    TeamsLib.deleteTeam(teams, id);
  };
};
