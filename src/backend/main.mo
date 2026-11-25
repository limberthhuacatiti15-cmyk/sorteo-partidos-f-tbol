import Map "mo:core/Map";
import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import UserApproval "mo:caffeineai-user-approval/approval";
import MixinUserApproval "mo:caffeineai-user-approval/MixinUserApproval";
import Expose "mo:caffeineai-oql/Expose";
import MapEntity "mo:caffeineai-oql/MapEntity";
import Entity "mo:caffeineai-oql/Entity";
import RecordValue "mo:caffeineai-oql/RecordValue";
import NatValue "mo:caffeineai-oql/NatValue";
import TextValue "mo:caffeineai-oql/TextValue";
import IntValue "mo:caffeineai-oql/IntValue";
import Common "types/common";
import TeamTypes "types/teams";
import FixtureTypes "types/fixtures";
import TeamsApi "mixins/teams-api";
import FixturesApi "mixins/fixtures-api";
import ApiDocMixin "mixins/api-doc";

actor {
  let accessControlState : AccessControl.AccessControlState;
  include MixinAuthorization(accessControlState, null);

  let approvalState : UserApproval.UserApprovalState;
  include MixinUserApproval(accessControlState, approvalState);

  let teams : Map.Map<Common.TeamId, TeamTypes.Team>;
  let matchdays : Map.Map<Common.MatchdayId, FixtureTypes.Matchday>;
  let matches : Map.Map<Common.MatchId, FixtureTypes.Match>;
  let state : {
    var nextTeamId : Nat;
    var nextMatchdayId : Nat;
    var nextMatchId : Nat;
  };

  include TeamsApi(accessControlState, approvalState, teams, state);
  include FixturesApi(accessControlState, approvalState, teams, matchdays, matches, state);

  include Expose({
    entities = [
      teams.toEntity("team", "Team", "id")
        .sample({ id = 0; name = ""; color = "" })
        .controllerOnly()
        .build(),
      matchdays.toEntity("matchday", "Matchday", "id")
        .sample({ id = 0; name = ""; createdAt = 0 })
        .controllerOnly()
        .build(),
      matches.toEntityManual("match", "Match", "id")
        .sample({
          id = 0;
          matchdayId = 0;
          homeTeamId = 0;
          awayTeamId = 0;
          status = #scheduled;
          homeScore = ?0;
          awayScore = ?0;
        })
        .payload("id", func m = m.id)
        .payload("matchdayId", func m = m.matchdayId)
        .payload("homeTeamId", func m = m.homeTeamId)
        .payload("awayTeamId", func m = m.awayTeamId)
        .payload("status", func m = switch (m.status) { case (#scheduled) "scheduled"; case (#played) "played" })
        .payload("homeScore", func m = m.homeScore)
        .payload("awayScore", func m = m.awayScore)
        .controllerOnly()
        .build(),
    ];
  });

  include ApiDocMixin();
};
