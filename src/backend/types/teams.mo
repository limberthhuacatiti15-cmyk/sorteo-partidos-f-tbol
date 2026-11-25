import Common "../types/common";

module {
  public type Team = {
    id : Common.TeamId;
    name : Text;
    color : Text;
  };

  public type TeamInput = {
    name : Text;
    color : Text;
  };
};
