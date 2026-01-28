const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const TeamPlayer = sequelize.define(
  "TeamPlayer",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    team_id: {
      type: DataTypes.INTEGER,
    },
    player_id: {
      type: DataTypes.INTEGER,
    },
  },
  {
    tableName: "team_players",
    timestamps: true,
  }
);

module.exports = TeamPlayer;
