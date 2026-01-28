const sequelize = require("../config/database");

const User = require("./User");
const Player = require("./Player");
const Team = require("./Team");
const TeamPlayer = require("./TeamPlayer");

User.hasMany(Team, { foreignKey: "user_id", as: "teams" });
Team.belongsTo(User, { foreignKey: "user_id", as: "user" });

Team.belongsToMany(Player, {
  through: TeamPlayer,
  foreignKey: "team_id",
  as: "players",
});
Player.belongsToMany(Team, {
  through: TeamPlayer,
  foreignKey: "player_id",
  as: "teams",
});

Team.hasMany(TeamPlayer, { foreignKey: "team_id", as: "teamPlayers" });
TeamPlayer.belongsTo(Team, { foreignKey: "team_id", as: "team" });
TeamPlayer.belongsTo(Player, { foreignKey: "player_id", as: "player" });

module.exports = {
  sequelize,
  User,
  Player,
  Team,
  TeamPlayer,
};
