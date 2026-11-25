import Map "mo:core/Map";
import Common "../types/common";
import Types "../types/teams";

module {
  public func listTeams(teams : Map.Map<Common.TeamId, Types.Team>) : [Types.Team] {
    teams.values().toArray();
  };

  public func createTeam(
    teams : Map.Map<Common.TeamId, Types.Team>,
    state : { var nextTeamId : Nat },
    input : Types.TeamInput,
  ) : Types.Team {
    let id = state.nextTeamId;
    state.nextTeamId := id + 1;
    let team : Types.Team = {
      id;
      name = input.name;
      color = input.color;
    };
    teams.add(id, team);
    team;
  };

  public func updateTeam(
    teams : Map.Map<Common.TeamId, Types.Team>,
    id : Common.TeamId,
    input : Types.TeamInput,
  ) : ?Types.Team {
    switch (teams.get(id)) {
      case (?existing) {
        let updated : Types.Team = {
          id = existing.id;
          name = input.name;
          color = input.color;
        };
        teams.add(id, updated);
        ?updated;
      };
      case null { null };
    };
  };

  public func deleteTeam(
    teams : Map.Map<Common.TeamId, Types.Team>,
    id : Common.TeamId,
  ) : Bool {
    switch (teams.get(id)) {
      case (?_) {
        teams.remove(id);
        true;
      };
      case null { false };
    };
  };
};
