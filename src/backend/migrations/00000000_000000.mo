import Map "mo:core/Map";
import AccessControl "mo:caffeineai-authorization/access-control";
import UserApproval "mo:caffeineai-user-approval/approval";

module {
  type Team = {
    id : Nat;
    name : Text;
    color : Text;
  };

  type MatchStatus = {
    #scheduled;
    #played;
  };

  type Match = {
    id : Nat;
    matchdayId : Nat;
    homeTeamId : Nat;
    awayTeamId : Nat;
    status : MatchStatus;
    homeScore : ?Nat;
    awayScore : ?Nat;
  };

  type Matchday = {
    id : Nat;
    name : Text;
    createdAt : Int;
  };

  public type OldActor = {};
  public type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    approvalState : UserApproval.UserApprovalState;
    teams : Map.Map<Nat, Team>;
    matchdays : Map.Map<Nat, Matchday>;
    matches : Map.Map<Nat, Match>;
    state : {
      var nextTeamId : Nat;
      var nextMatchdayId : Nat;
      var nextMatchId : Nat;
    };
  };

  public func migration(_ : OldActor) : NewActor {
    let accessControlState = AccessControl.initState();
    {
      accessControlState;
      approvalState = UserApproval.initState(accessControlState);
      teams = Map.empty();
      matchdays = Map.empty();
      matches = Map.empty();
      state = { var nextTeamId = 0; var nextMatchdayId = 0; var nextMatchId = 0 };
    };
  };
};
